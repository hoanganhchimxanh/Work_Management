const db = require("../models");
const ChannelManager = db.ChannelManager;
const Channel = db.Channel;

// Thêm tài khoản quản lý cho kênh
const addManager = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { managerEmail, role, managerPassword, note } = req.body;

    if (!managerEmail || !role) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc (managerEmail, role)!",
      });
    }

    // Kiểm tra channel có tồn tại không
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kênh!",
      });
    }

    // Kiểm tra email đã được thêm cho kênh này chưa
    const existingManager = await ChannelManager.findOne({
      channel: channelId,
      managerEmail,
    });

    if (existingManager) {
      return res.status(400).json({
        success: false,
        message: "Email này đã được thêm cho kênh!",
      });
    }

    const newManager = await ChannelManager.create({
      channel: channelId,
      managerEmail,
      role,
      managerPassword: managerPassword || null,
      note: note || "",
    });

    const populatedManager = await ChannelManager.findById(newManager._id)
      .populate("channel", "name link")
      .lean();

    res.status(201).json({
      success: true,
      message: "Thêm tài khoản quản lý thành công!",
      data: populatedManager,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy danh sách tài khoản quản lý của một kênh
const getChannelManagers = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const managers = await ChannelManager.find({ channel: channelId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: managers,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy thông tin một tài khoản quản lý
const getManagerById = async (req, res, next) => {
  try {
    const { managerId } = req.params;

    const manager = await ChannelManager.findById(managerId)
      .populate("channel", "name link channelEmail")
      .lean();

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản quản lý!",
      });
    }

    res.json({
      success: true,
      data: manager,
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật thông tin tài khoản quản lý
const updateManager = async (req, res, next) => {
  try {
    const { managerId } = req.params;
    const { managerEmail, role, managerPassword, status, note } = req.body;

    const manager = await ChannelManager.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản quản lý!",
      });
    }

    // Kiểm tra email mới có trùng với manager khác của cùng kênh không
    if (managerEmail && managerEmail !== manager.managerEmail) {
      const existingManager = await ChannelManager.findOne({
        channel: manager.channel,
        managerEmail,
        _id: { $ne: managerId },
      });

      if (existingManager) {
        return res.status(400).json({
          success: false,
          message: "Email này đã được sử dụng cho kênh!",
        });
      }
    }

    // Cập nhật các field
    if (managerEmail) manager.managerEmail = managerEmail;
    if (role) manager.role = role;
    if (managerPassword !== undefined)
      manager.managerPassword = managerPassword;
    if (status) manager.status = status;
    if (note !== undefined) manager.note = note;

    await manager.save();

    const updatedManager = await ChannelManager.findById(managerId)
      .populate("channel", "name link")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật tài khoản quản lý thành công!",
      data: updatedManager,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa tài khoản quản lý
const deleteManager = async (req, res, next) => {
  try {
    const { managerId } = req.params;

    const manager = await ChannelManager.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản quản lý!",
      });
    }

    // Không cho xóa PRIMARY_OWNER
    if (manager.role === "PRIMARY_OWNER") {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa PRIMARY_OWNER!",
      });
    }

    await ChannelManager.findByIdAndDelete(managerId);

    res.json({
      success: true,
      message: "Xóa tài khoản quản lý thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Thu hồi quyền (soft delete - chuyển status thành REVOKED)
const revokeManager = async (req, res, next) => {
  try {
    const { managerId } = req.params;

    const manager = await ChannelManager.findById(managerId);
    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tài khoản quản lý!",
      });
    }

    manager.status = "REVOKED";
    await manager.save();

    res.json({
      success: true,
      message: "Thu hồi quyền thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Lấy thống kê tài khoản quản lý theo role
const getManagerStats = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const stats = await ChannelManager.aggregate([
      { $match: { channel: mongoose.Types.ObjectId(channelId) } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ["$status", "ACTIVE"] }, 1, 0] },
          },
        },
      },
    ]);

    const formattedStats = {
      PRIMARY_OWNER: { count: 0, activeCount: 0 },
      OWNER: { count: 0, activeCount: 0 },
      MANAGER: { count: 0, activeCount: 0 },
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = {
        count: stat.count,
        activeCount: stat.activeCount,
      };
    });

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addManager,
  getChannelManagers,
  getManagerById,
  updateManager,
  deleteManager,
  revokeManager,
  getManagerStats,
};
