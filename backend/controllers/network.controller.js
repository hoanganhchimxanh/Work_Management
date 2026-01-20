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
    if (!profileAdsenseId || !employment) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (profileAdsenseId, employment)!",
      });
    }

    // Kiểm tra user có tồn tại không
    const user = await User.findById(employment);
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

    // Kiểm tra pubId nếu có
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
      employment,
      reminderDate: reminderDate || null,
      profileAdsenseId,
      emailAddress: emailAddress || "",
      password: password || "",
      recoveryEmail: recoveryEmail || "",
      twoFA: twoFA || false,
      creationDate: creationDate || null,
      taxForm: taxForm || "",
      location: location || "OFFICE",
      linkedChannelUrl: linkedChannelUrl || "",
      status: status || "ACTIVE",
      note: note || "PENDING_ACTIVATION",
    });

    const populatedNetwork = await Network.findById(newNetwork._id)
      .populate("employment", "fullName phoneNumber role")
      .lean();

    // 🔔 SEND NOTIFICATION
    await sendNotification({
      userId: employment,
      title: "Bạn đã được gán quản lý network mới",
      message: `Bạn được làm quản lý cho network "${profileAdsenseId}".`,
      metadata: {
        networkId: newNetwork._id,
        profileAdsenseId,
      },
    });

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
    const { status, employment, location, note } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (employment) filter.employment = employment;
    if (location) filter.location = location;
    if (note) filter.note = note;

    const networks = await Network.find(filter)
      .populate("employment", "fullName phoneNumber role team")
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
      }),
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
      .populate("employment", "fullName phoneNumber role team")
      .lean();

    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Lấy tất cả channels thuộc network này
    const channels = await Channel.find({ network: networkId })
      .populate("assignedUser", "fullName phoneNumber")
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

    // Kiểm tra user nếu thay đổi
    if (updateData.employment) {
      const user = await User.findById(updateData.employment);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy nhân viên!",
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

    const updatedNetwork = await Network.findById(networkId)
      .populate("employment", "fullName phoneNumber role")
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
    if (channel.assignedUser) {
      await sendNotification({
        userId: channel.assignedUser,
        title: "Kênh của bạn đã được gán vào network",
        message: `Kênh "${channel.name}" đã được gán vào network "${network.profileAdsenseId}".`,
        metadata: {
          channelId: channel._id,
          networkId: network._id,
        },
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

    channel.network = null;
    await channel.save();

    // 🔔 SEND NOTIFICATION
    if (channel.assignedUser) {
      await sendNotification({
        userId: channel.assignedUser,
        title: "Kênh của bạn đã được gỡ khỏi network",
        message: `Kênh "${channel.name}" đã được gỡ khỏi network.`,
        metadata: {
          channelId: channel._id,
        },
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
        pubId: network.pubId,
        profileAdsenseId: network.profileAdsenseId,
        emailAddress: network.emailAddress,
        status: network.status,
        note: network.note,
        totalChannels: channels.length,
        statusBreakdown: statusStats,
        employment: network.employment,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách địa chỉ duy nhất từ các network
const getUniqueLocations = async (req, res, next) => {
  try {
    // Lấy tất cả network có adSenseLocation không rỗng
    const networks = await Network.find({
      adSenseLocation: { $exists: true, $ne: "" },
    })
      .select("profileAdsenseId adSenseLocation")
      .lean();

    // Tạo Map để lưu địa chỉ duy nhất với profileAdsenseId đầu tiên sử dụng nó
    const locationMap = new Map();

    networks.forEach((network) => {
      const location = network.adSenseLocation.trim();
      if (location && !locationMap.has(location)) {
        locationMap.set(location, {
          adSenseLocation: location,
          profileAdsenseId: network.profileAdsenseId,
          networkId: network._id,
        });
      }
    });

    // Chuyển Map thành array
    const uniqueLocations = Array.from(locationMap.values());

    res.json({
      success: true,
      count: uniqueLocations.length,
      data: uniqueLocations,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả network sử dụng một địa chỉ cụ thể
const getNetworksByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin địa chỉ!",
      });
    }

    const networks = await Network.find({
      adSenseLocation: location.trim(),
    })
      .populate("employment", "fullName phoneNumber role")
      .select("profileAdsenseId pubId adSenseLocation emailAddress status note")
      .lean();

    res.json({
      success: true,
      count: networks.length,
      location: location,
      data: networks,
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật địa chỉ cho nhiều network cùng lúc
const bulkUpdateLocation = async (req, res, next) => {
  try {
    const { oldLocation, newLocation } = req.body;

    if (!oldLocation || !newLocation) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin địa chỉ cũ hoặc địa chỉ mới!",
      });
    }

    // Cập nhật tất cả network có địa chỉ cũ
    const result = await Network.updateMany(
      { adSenseLocation: oldLocation.trim() },
      { $set: { adSenseLocation: newLocation.trim() } },
    );

    res.json({
      success: true,
      message: `Đã cập nhật ${result.modifiedCount} network!`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Xóa địa chỉ khỏi tất cả network
const removeLocationFromNetworks = async (req, res, next) => {
  try {
    const { location } = req.body;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin địa chỉ!",
      });
    }

    // Đặt adSenseLocation về rỗng cho tất cả network có địa chỉ này
    const result = await Network.updateMany(
      { adSenseLocation: location.trim() },
      { $set: { adSenseLocation: "" } },
    );

    res.json({
      success: true,
      message: `Đã xóa địa chỉ khỏi ${result.modifiedCount} network!`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
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
  getUniqueLocations,
  getNetworksByLocation,
  bulkUpdateLocation,
  removeLocationFromNetworks,
};
