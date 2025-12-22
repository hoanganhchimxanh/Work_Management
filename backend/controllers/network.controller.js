const mongoose = require("mongoose");
const db = require("../models");
const Network = db.Network;
const Channel = db.Channel;
const User = db.User;
const XLSX = require("xlsx");

const {
  sendNotification,
  sendBulkNotification,
} = require("../services/notification.service");

// Tạo Network mới
const createNew = async (req, res, next) => {
  try {
    const {
      assignedUser,
      reminderDate,
      reminderNote,
      profileAdsenseId,
      emailAddress,
      recoveryEmail,
      creationDate,
      taxName,
      location,
      mainChannel,
      linkedChannelUrl,
      emailChannel,
      channelJoinDate,
      country,
      status,
      note,
    } = req.body;

    // Validate required fields
    if (!assignedUser || !profileAdsenseId || !emailAddress || !creationDate) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc (assignedUser, profileAdsenseId, emailAddress, creationDate)!",
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findById(assignedUser);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy nhân viên!",
      });
    }

    // Kiểm tra profileAdsenseId đã tồn tại chưa
    const existingNetwork = await Network.findOne({ profileAdsenseId });
    if (existingNetwork) {
      return res.status(400).json({
        success: false,
        message: "Profile AdSense ID này đã tồn tại!",
      });
    }

    // Kiểm tra mainChannel nếu có
    if (mainChannel) {
      const channel = await Channel.findById(mainChannel);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy kênh chính!",
        });
      }
    }

    const newNetwork = await Network.create({
      assignedUser,
      reminderDate: reminderDate || null,
      reminderNote: reminderNote || "",
      profileAdsenseId,
      emailAddress,
      recoveryEmail: recoveryEmail || "",
      creationDate,
      taxName: taxName || "",
      location: location || "OFFICE",
      mainChannel: mainChannel || null,
      linkedChannelUrl: linkedChannelUrl || "",
      emailChannel: emailChannel || "",
      channelJoinDate: channelJoinDate || null,
      country: country || "VN",
      status: status || "ACTIVE",
      note: note || "",
    });

    const populatedNetwork = await Network.findById(newNetwork._id)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("mainChannel", "name link")
      .lean();

    // 🔔 SEND NOTIFICATION
    if (userIds.length === 1) {
      await sendNotification({
        userId: userIds[0],
        title: "Bạn đã được gán quản lý kênh mới",
        message: `Bạn được làm quản lý cho kênh "${name}".`,
        // type: "TEAM",
        metadata: {},
      });
    }

    res.status(201).json({
      success: true,
      message: "Tạo network thành công!",
      data: populatedNetwork,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả Networks
const getAll = async (req, res, next) => {
  try {
    const { status, assignedUser, country, location } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (assignedUser) filter.assignedUser = assignedUser;
    if (country) filter.country = country;
    if (location) filter.location = location;

    const networks = await Network.find(filter)
      .populate("assignedUser", "fullName personalEmail role team")
      .populate("mainChannel", "name link status")
      .sort({ createdAt: -1 })
      .lean();

    // Đếm số kênh thuộc mỗi network
    const networksWithCount = await Promise.all(
      networks.map(async (network) => {
        const channelCount = await Channel.countDocuments({
          network: network._id,
        });

        return {
          ...network,
          channelCount,
        };
      })
    );

    res.json({
      success: true,
      count: networksWithCount.length,
      data: networksWithCount,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin Network theo ID
const getById = async (req, res, next) => {
  try {
    const networkId = req.params.id;

    const network = await Network.findById(networkId)
      .populate("assignedUser", "fullName personalEmail role team")
      .populate("mainChannel", "name link status")
      .lean();

    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Lấy tất cả channels thuộc network này
    const channels = await Channel.find({ network: networkId })
      .populate("assignedUser", "fullName personalEmail")
      .lean();

    res.json({
      success: true,
      data: {
        ...network,
        channels,
        channelCount: channels.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật thông tin Network
const updateNetwork = async (req, res, next) => {
  try {
    const networkId = req.params.id;
    const updateData = req.body;

    const network = await Network.findById(networkId);
    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Kiểm tra profileAdsenseId nếu thay đổi
    if (
      updateData.profileAdsenseId &&
      updateData.profileAdsenseId !== network.profileAdsenseId
    ) {
      const existingNetwork = await Network.findOne({
        profileAdsenseId: updateData.profileAdsenseId,
        _id: { $ne: networkId },
      });

      if (existingNetwork) {
        return res.status(400).json({
          success: false,
          message: "Profile AdSense ID này đã được sử dụng!",
        });
      }
    }

    // Kiểm tra user nếu thay đổi
    if (updateData.assignedUser) {
      const user = await User.findById(updateData.assignedUser);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân viên!",
        });
      }
    }

    // Kiểm tra mainChannel nếu thay đổi
    if (updateData.mainChannel) {
      const channel = await Channel.findById(updateData.mainChannel);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy kênh chính!",
        });
      }

      // Đánh dấu channel là main channel
      channel.isMainChannel = true;
      channel.network = networkId;
      await channel.save();

      // Bỏ đánh dấu channel cũ
      if (
        network.mainChannel &&
        network.mainChannel.toString() !== updateData.mainChannel
      ) {
        await Channel.updateOne(
          { _id: network.mainChannel },
          { isMainChannel: false }
        );
      }
    }

    // Cập nhật các field
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        network[key] = updateData[key];
      }
    });

    await network.save();

    const updatedNetwork = await Network.findById(networkId)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("mainChannel", "name link")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật network thành công!",
      data: updatedNetwork,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa Network
const deleteNetwork = async (req, res, next) => {
  try {
    const networkId = req.params.id;

    const network = await Network.findById(networkId);
    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Kiểm tra xem có kênh nào đang thuộc network này không
    const channelCount = await Channel.countDocuments({ network: networkId });
    if (channelCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa network vì còn ${channelCount} kênh đang thuộc network này!`,
      });
    }

    await Network.findByIdAndDelete(networkId);

    res.json({
      success: true,
      message: "Xóa network thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Gán kênh vào Network
const assignChannel = async (req, res, next) => {
  try {
    const networkId = req.params.id;
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu channelId!",
      });
    }

    const [network, channel] = await Promise.all([
      Network.findById(networkId),
      Channel.findById(channelId),
    ]);

    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Gán network cho channel
    channel.network = networkId;
    await channel.save();

    // 🔔 SEND NOTIFICATION
    if (userIds.length === 1) {
      await sendNotification({
        userId: userIds[0],
        title: "Bạn đã được gán quản lý kênh mới",
        message: `Bạn được làm quản lý cho kênh "${name}".`,
        // type: "TEAM",
        metadata: {},
      });
    }

    res.json({
      success: true,
      message: "Gán kênh vào network thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Gỡ kênh khỏi Network
const removeChannel = async (req, res, next) => {
  try {
    const networkId = req.params.id;
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu channelId!",
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Không cho phép gỡ kênh chính
    if (channel.isMainChannel) {
      return res.status(400).json({
        success: false,
        message: "Không thể gỡ kênh chính khỏi network!",
      });
    }

    channel.network = null;
    await channel.save();

    // 🔔 SEND NOTIFICATION
    if (userIds.length === 1) {
      await sendNotification({
        userId: userIds[0],
        title: "Bạn đã được gán quản lý kênh mới",
        message: `Bạn được làm quản lý cho kênh "${name}".`,
        // type: "TEAM",
        metadata: {},
      });
    }

    res.json({
      success: true,
      message: "Gỡ kênh khỏi network thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Thống kê Network
const getNetworkStats = async (req, res, next) => {
  try {
    const networkId = req.params.id;

    const network = await Network.findById(networkId);
    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Lấy tất cả channels
    const channels = await Channel.find({ network: networkId });

    // Đếm theo status
    const statusStats = channels.reduce((acc, ch) => {
      acc[ch.status] = (acc[ch.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        networkId: network._id,
        profileAdsenseId: network.profileAdsenseId,
        emailAddress: network.emailAddress,
        totalChannels: channels.length,
        statusBreakdown: statusStats,
        assignedUser: network.assignedUser,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNew,
  getAll,
  getById,
  updateNetwork,
  deleteNetwork,
  assignChannel,
  removeChannel,
  getNetworkStats,
};
