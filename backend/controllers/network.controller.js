const mongoose = require("mongoose");
const db = require("../models");
const Network = db.Network;
const Channel = db.Channel;
const User = db.User;

const {
  sendNotification,
  sendBulkNotification,
} = require("../services/notification.service");

// Tạo Network mới
const createNew = async (req, res, next) => {
  try {
    const {
      pubId,
      employment,
      reminderDate,
      profileAdsenseId,
      emailAddress,
      password,
      recoveryEmail,
      twoFA,
      creationDate,
      taxForm,
      location,
      linkedChannelUrl,
      status,
      note,
    } = req.body;

    // Validate required fields
    if (!profileAdsenseId || !emailAddress) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (profileAdsenseId, emailAddress)!",
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

    // Kiểm tra pubId nếu có (unique)
    if (pubId) {
      const existingPubId = await Network.findOne({ pubId });
      if (existingPubId) {
        return res.status(400).json({
          success: false,
          message: "PUB-ID này đã tồn tại!",
        });
      }
    }

    const newNetwork = await Network.create({
      pubId: pubId || undefined,
      employment: employment || "",
      reminderDate: reminderDate || null,
      profileAdsenseId,
      emailAddress,
      password: password || "",
      recoveryEmail: recoveryEmail || "",
      twoFA: twoFA || false,
      creationDate: creationDate || null,
      taxForm: taxForm || "",
      location: location || "OFFICE",
      linkedChannelUrl: linkedChannelUrl || "",
      status: status || "ACTIVE",
      note: note || "",
    });

    res.status(201).json({
      success: true,
      message: "Tạo network thành công!",
      data: newNetwork,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả Networks
const getAll = async (req, res, next) => {
  try {
    const { status, employment, location, pubId } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (employment) filter.employment = { $regex: employment, $options: "i" };
    if (location) filter.location = location;
    if (pubId) filter.pubId = { $regex: pubId, $options: "i" };

    const networks = await Network.find(filter).sort({ createdAt: -1 }).lean();

    // Đếm số kênh thuộc mỗi network (nếu còn dùng Channel model với network field)
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

    const network = await Network.findById(networkId).lean();

    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Lấy tất cả channels thuộc network này (nếu còn dùng)
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

    // Kiểm tra pubId nếu thay đổi
    if (updateData.pubId && updateData.pubId !== network.pubId) {
      const existingPubId = await Network.findOne({
        pubId: updateData.pubId,
        _id: { $ne: networkId },
      });

      if (existingPubId) {
        return res.status(400).json({
          success: false,
          message: "PUB-ID này đã được sử dụng!",
        });
      }
    }

    // Cập nhật các field
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        network[key] = updateData[key];
      }
    });

    await network.save();

    const updatedNetwork = await Network.findById(networkId).lean();

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

    channel.network = null;
    await channel.save();

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
        pubId: network.pubId,
        profileAdsenseId: network.profileAdsenseId,
        emailAddress: network.emailAddress,
        employment: network.employment,
        totalChannels: channels.length,
        statusBreakdown: statusStats,
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
