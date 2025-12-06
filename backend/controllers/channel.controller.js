const db = require("../models");
const User = db.User;
const Channel = db.Channel;
const Network = db.Network;

// Thêm kênh mới
const addNew = async (req, res, next) => {
  try {
    const {
      name,
      link,
      channelEmail,
      channelPassword,
      owner,
      network,
      status,
      subscriber,
      bktEnabled,
      bktDay,
    } = req.body;

    if (!name || !channelEmail) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (name, channelEmail)!",
      });
    }

    // Kiểm tra channelEmail đã tồn tại chưa
    const existingChannel = await Channel.findOne({ channelEmail });
    if (existingChannel) {
      return res.status(400).json({
        success: false,
        message: "Email kênh này đã được sử dụng!",
      });
    }

    // Kiểm tra owner có tồn tại không (nếu có)
    if (owner) {
      const user = await User.findById(owner);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user owner!",
        });
      }
    }

    // Kiểm tra network có tồn tại không (nếu có)
    if (network) {
      const networkDoc = await Network.findById(network);
      if (!networkDoc) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy network!",
        });
      }
    }

    const newChannel = await Channel.create({
      name,
      link,
      channelEmail,
      channelPassword,
      owner: owner || null,
      network: network || null,
      status: status || "ACTIVE",
      subscriber: subscriber || 0,
      bktEnabled: bktEnabled || false,
      bktDay: bktDay || null,
    });

    const populatedChannel = await Channel.findById(newChannel._id)
      .populate("owner", "fullName personalEmail")
      .populate("network", "name")
      .lean();

    res.status(201).json({
      success: true,
      message: "Thêm kênh thành công!",
      data: populatedChannel,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả kênh
const getAll = async (req, res, next) => {
  try {
    const channels = await Channel.find()
      .populate("owner", "fullName personalEmail")
      .populate("network", "name status")
      .lean();

    res.json({
      success: true,
      data: channels,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin 1 kênh theo ID
const getById = async (req, res, next) => {
  try {
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId)
      .populate("owner", "fullName personalEmail role")
      .populate("network", "name status")
      .lean();

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    res.json({
      success: true,
      data: channel,
    });
  } catch (err) {
    next(err);
  }
};

// Chỉnh sửa thông tin kênh
const editChannelInfo = async (req, res, next) => {
  try {
    const channelId = req.params.id;
    const {
      name,
      link,
      channelEmail,
      channelPassword,
      owner,
      network,
      status,
      subscriber,
      bktEnabled,
      bktDay,
    } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Kiểm tra channelEmail nếu thay đổi
    if (channelEmail && channelEmail !== channel.channelEmail) {
      const existingChannel = await Channel.findOne({ channelEmail });
      if (existingChannel) {
        return res.status(400).json({
          success: false,
          message: "Email kênh này đã được sử dụng!",
        });
      }
    }

    // Cập nhật các field
    if (name) channel.name = name;
    if (link !== undefined) channel.link = link;
    if (channelEmail) channel.channelEmail = channelEmail;
    if (channelPassword !== undefined)
      channel.channelPassword = channelPassword;
    if (owner !== undefined) channel.owner = owner;
    if (network !== undefined) channel.network = network;
    if (status) channel.status = status;
    if (subscriber !== undefined) channel.subscriber = subscriber;
    if (bktEnabled !== undefined) channel.bktEnabled = bktEnabled;
    if (bktDay !== undefined) channel.bktDay = bktDay;

    await channel.save();

    const updatedChannel = await Channel.findById(channelId)
      .populate("owner", "fullName personalEmail")
      .populate("network", "name")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật kênh thành công!",
      data: updatedChannel,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa kênh
const deleteChannel = async (req, res, next) => {
  try {
    const channelId = req.params.id;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    await Channel.findByIdAndDelete(channelId);

    res.json({
      success: true,
      message: "Xóa kênh thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Gán owner cho kênh
const assignOwner = async (req, res, next) => {
  try {
    const channelId = req.params.id;
    const { ownerId } = req.body;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ownerId!",
      });
    }

    const [channel, user] = await Promise.all([
      Channel.findById(channelId),
      User.findById(ownerId),
    ]);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user!",
      });
    }

    channel.owner = ownerId;
    await channel.save();

    const updatedChannel = await Channel.findById(channelId)
      .populate("owner", "fullName personalEmail")
      .populate("network", "name")
      .lean();

    res.json({
      success: true,
      message: "Gán owner thành công!",
      data: updatedChannel,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy các kênh theo owner
const getByOwner = async (req, res, next) => {
  try {
    const ownerId = req.params.ownerId;

    const channels = await Channel.find({ owner: ownerId })
      .populate("network", "name status")
      .lean();

    res.json({
      success: true,
      data: channels,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy các kênh theo network
const getByNetwork = async (req, res, next) => {
  try {
    const networkId = req.params.networkId;

    const channels = await Channel.find({ network: networkId })
      .populate("owner", "fullName personalEmail")
      .lean();

    res.json({
      success: true,
      data: channels,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addNew,
  getAll,
  getById,
  editChannelInfo,
  deleteChannel,
  assignOwner,
  getByOwner,
  getByNetwork,
};
