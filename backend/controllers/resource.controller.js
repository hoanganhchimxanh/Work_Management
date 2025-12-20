// resource.controller.js
const mongoose = require("mongoose");
const db = require("../models");
const Resource = db.Resource;
const User = db.User;
const Channel = db.Channel;
const bcrypt = require("bcrypt");

// Tạo resource mới
const createNew = async (req, res, next) => {
  try {
    const {
      email,
      defaultPassword,
      recoveryEmail,
      status,
      assignedUser,
      assignedChannel,
      note,
    } = req.body;

    // Validate required fields
    if (!email || !defaultPassword || !recoveryEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu thông tin bắt buộc (email, defaultPassword, recoveryEmail)!",
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingResource = await Resource.findOne({ email });
    if (existingResource) {
      return res.status(400).json({
        success: false,
        message: "Email này đã tồn tại trong hệ thống!",
      });
    }

    // Validate assignedUser nếu có
    if (assignedUser) {
      const user = await User.findById(assignedUser);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user!",
        });
      }
    }

    // Validate assignedChannel nếu có
    if (assignedChannel) {
      const channel = await Channel.findById(assignedChannel);
      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy channel!",
        });
      }
    }

    // Hash mật khẩu mặc định
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const newResource = await Resource.create({
      email: email.toLowerCase().trim(),
      defaultPassword: hashedPassword,
      recoveryEmail: recoveryEmail.toLowerCase().trim(),
      status: status || "AVAILABLE",
      assignedUser: assignedUser || null,
      assignedChannel: assignedChannel || null,
      note: note || "",
    });

    // Populate để trả về thông tin đầy đủ
    const populatedResource = await Resource.findById(newResource._id)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("assignedChannel", "name link status")
      .lean();

    res.status(201).json({
      success: true,
      message: "Tạo resource thành công!",
      data: populatedResource,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả resources
const getAll = async (req, res, next) => {
  try {
    const { status, assignedUser } = req.query;

    // Build filter (đã bỏ type)
    const filter = {};
    if (status) filter.status = status;
    if (assignedUser) filter.assignedUser = assignedUser;

    const resources = await Resource.find(filter)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("assignedChannel", "name link status")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy resource theo ID
const getById = async (req, res, next) => {
  try {
    const resourceId = req.params.id;

    const resource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName personalEmail role team")
      .populate("assignedChannel", "name link status network")
      .lean();

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy resource!",
      });
    }

    res.json({
      success: true,
      data: resource,
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật thông tin resource
const updateResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const {
      email,
      defaultPassword,
      recoveryEmail,
      status,
      assignedUser,
      assignedChannel,
      note,
    } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy resource!",
      });
    }

    // Kiểm tra email nếu thay đổi
    if (email && email !== resource.email) {
      const existingResource = await Resource.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: resourceId },
      });

      if (existingResource) {
        return res.status(400).json({
          success: false,
          message: "Email này đã được sử dụng!",
        });
      }
      resource.email = email.toLowerCase().trim();
    }

    // Validate assignedUser nếu có
    if (assignedUser !== undefined) {
      if (assignedUser) {
        const user = await User.findById(assignedUser);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy user!",
          });
        }
      }
      resource.assignedUser = assignedUser;
    }

    // Validate assignedChannel nếu có
    if (assignedChannel !== undefined) {
      if (assignedChannel) {
        const channel = await Channel.findById(assignedChannel);
        if (!channel) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy channel!",
          });
        }
      }
      resource.assignedChannel = assignedChannel;
    }

    // Hash mật khẩu mới nếu có
    if (defaultPassword) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      resource.defaultPassword = hashedPassword;
    }

    // Cập nhật các field khác
    if (recoveryEmail)
      resource.recoveryEmail = recoveryEmail.toLowerCase().trim();
    if (status) resource.status = status;
    if (note !== undefined) resource.note = note;

    await resource.save();

    const updatedResource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("assignedChannel", "name link status")
      .lean();

    res.json({
      success: true,
      message: "Cập nhật resource thành công!",
      data: updatedResource,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa resource
const deleteResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy resource!",
      });
    }

    // Kiểm tra xem resource có đang được gán không
    if (resource.status === "ASSIGNED") {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa resource đang được gán! Vui lòng gỡ gán trước.",
      });
    }

    await Resource.findByIdAndDelete(resourceId);

    res.json({
      success: true,
      message: "Xóa resource thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Gán resource cho user
const assignToUser = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId!",
      });
    }

    const [resource, user] = await Promise.all([
      Resource.findById(resourceId),
      User.findById(userId),
    ]);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy resource!",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user!",
      });
    }

    if (resource.status !== "AVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Resource này không khả dụng để gán!",
      });
    }

    resource.assignedUser = userId;
    resource.status = "ASSIGNED";
    await resource.save();

    const updatedResource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("assignedChannel", "name link status")
      .lean();

    res.json({
      success: true,
      message: "Gán resource cho user thành công!",
      data: updatedResource,
    });
  } catch (err) {
    next(err);
  }
};

// Gán resource cho channel
const assignToChannel = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu channelId!",
      });
    }

    const [resource, channel] = await Promise.all([
      Resource.findById(resourceId),
      Channel.findById(channelId),
    ]);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy resource!",
      });
    }

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy channel!",
      });
    }

    resource.assignedChannel = channelId;
    resource.status = "ASSIGNED";
    await resource.save();

    const updatedResource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("assignedChannel", "name link status")
      .lean();

    res.json({
      success: true,
      message: "Gán resource cho channel thành công!",
      data: updatedResource,
    });
  } catch (err) {
    next(err);
  }
};

// Gỡ gán resource
const unassign = async (req, res, next) => {
  try {
    const resourceId = req.params.id;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy resource!",
      });
    }

    resource.assignedUser = null;
    resource.assignedChannel = null;
    resource.status = "AVAILABLE";
    await resource.save();

    const updatedResource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("assignedChannel", "name link status")
      .lean();

    res.json({
      success: true,
      message: "Gỡ gán resource thành công!",
      data: updatedResource,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy resources của user hiện tại
const getMyResources = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const resources = await Resource.find({ assignedUser: userId })
      .populate("assignedChannel", "name link status")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (err) {
    next(err);
  }
};

// Thống kê resources (chỉ còn theo status)
const getResourceStats = async (req, res, next) => {
  try {
    const stats = await Resource.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      byStatus: {
        AVAILABLE: 0,
        ASSIGNED: 0,
        DISABLED: 0,
      },
      total: 0,
    };

    stats.forEach((stat) => {
      if (formattedStats.byStatus.hasOwnProperty(stat._id)) {
        formattedStats.byStatus[stat._id] = stat.count;
      }
      formattedStats.total += stat.count;
    });

    res.json({
      success: true,
      data: formattedStats,
    });
  } catch (err) {
    next(err);
  }
};

// Vô hiệu hóa resource
const disableResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;
    const { note } = req.body;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy resource!",
      });
    }

    resource.status = "DISABLED";
    if (note) {
      resource.note = note;
    }
    await resource.save();

    const updatedResource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("assignedChannel", "name link status")
      .lean();

    res.json({
      success: true,
      message: "Vô hiệu hóa resource thành công!",
      data: updatedResource,
    });
  } catch (err) {
    next(err);
  }
};

// Kích hoạt lại resource
const enableResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy resource!",
      });
    }

    resource.status =
      resource.assignedUser || resource.assignedChannel
        ? "ASSIGNED"
        : "AVAILABLE";
    await resource.save();

    const updatedResource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName personalEmail role")
      .populate("assignedChannel", "name link status")
      .lean();

    res.json({
      success: true,
      message: "Kích hoạt resource thành công!",
      data: updatedResource,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createNew,
  getAll,
  getById,
  updateResource,
  deleteResource,
  assignToUser,
  assignToChannel,
  unassign,
  getMyResources,
  getResourceStats,
  disableResource,
  enableResource,
};
