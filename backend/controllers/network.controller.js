const mongoose = require("mongoose");
const db = require("../models");
const Network = db.Network;
const Channel = db.Channel;

// Tạo Network mới
const createNew = async (req, res, next) => {
  try {
    const { name, mainChannel, primaryAccountEmail, status, note } = req.body;

    if (!name || !mainChannel || !primaryAccountEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc (name, mainChannel, primaryAccountEmail)!",
      });
    }

    // Kiểm tra mainChannel có tồn tại không
    const channel = await Channel.findById(mainChannel);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh chính!",
      });
    }

    // Kiểm tra email đã được dùng cho network khác chưa
    const existingNetwork = await Network.findOne({ primaryAccountEmail });
    if (existingNetwork) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được sử dụng cho network khác!",
      });
    }

    const newNetwork = await Network.create({
      name,
      mainChannel,
      primaryAccountEmail,
      status: status || "ACTIVE",
      note: note || "",
    });

    // Đánh dấu channel là kênh chính
    channel.isMainChannel = true;
    channel.network = newNetwork._id;
    await channel.save();

    const populatedNetwork = await Network.findById(newNetwork._id)
      .populate("mainChannel", "name link channelEmail")
      .lean();

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
    const { status } = req.query;

    const filter = status ? { status } : {};

    const networks = await Network.find(filter)
      .populate("mainChannel", "name link channelEmail subscriber")
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
      .populate("mainChannel", "name link channelEmail subscriber status")
      .lean();

    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Lấy tất cả channels thuộc network này
    const channels = await Channel.find({ network: networkId })
      .populate("owner", "fullName personalEmail")
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
    const { name, mainChannel, primaryAccountEmail, status, note } = req.body;

    const network = await Network.findById(networkId);
    if (!network) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy network!",
      });
    }

    // Nếu thay đổi mainChannel
    if (mainChannel && mainChannel !== network.mainChannel.toString()) {
      const newMainChannel = await Channel.findById(mainChannel);
      if (!newMainChannel) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy kênh chính mới!",
        });
      }

      // Bỏ đánh dấu kênh chính cũ
      await Channel.updateOne(
        { _id: network.mainChannel },
        { isMainChannel: false }
      );

      // Đánh dấu kênh chính mới
      newMainChannel.isMainChannel = true;
      newMainChannel.network = networkId;
      await newMainChannel.save();

      network.mainChannel = mainChannel;
    }

    // Cập nhật các field khác
    if (name) network.name = name;
    if (primaryAccountEmail) network.primaryAccountEmail = primaryAccountEmail;
    if (status) network.status = status;
    if (note !== undefined) network.note = note;

    await network.save();

    const updatedNetwork = await Network.findById(networkId)
      .populate("mainChannel", "name link channelEmail")
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

    // Tính tổng subscribers
    const totalSubscribers = channels.reduce(
      (sum, ch) => sum + (ch.subscriber || 0),
      0
    );

    // Đếm theo status
    const statusStats = channels.reduce((acc, ch) => {
      acc[ch.status] = (acc[ch.status] || 0) + 1;
      return acc;
    }, {});

    // Đếm số kênh có BKT enabled
    const bktEnabledCount = channels.filter((ch) => ch.bktEnabled).length;

    res.json({
      success: true,
      data: {
        networkId: network._id,
        networkName: network.name,
        totalChannels: channels.length,
        totalSubscribers,
        bktEnabledChannels: bktEnabledCount,
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
