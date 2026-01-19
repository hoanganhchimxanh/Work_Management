const mongoose = require("mongoose");
const db = require("../models");
const Resource = db.Resource;
const User = db.User;
const Channel = db.Channel;
const bcrypt = require("bcrypt");

const { sendNotification } = require("../services/notification.service");

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
      .populate("assignedUser", "fullName phoneNumber role")
      .populate("assignedChannel", "name link status")
      .lean();

    // 🔔 SEND NOTIFICATION
    if (assignedUser) {
      await sendNotification({
        userId: assignedUser,
        title: "Bạn được giao tài khoản tài nguyên mới",
        message: `Bạn vừa được giao tài khoản tài nguyên: ${email}. Vui lòng kiểm tra và sử dụng đúng mục đích.`,
        metadata: {
          resourceId: newResource._id,
        },
      });
    }

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
      .populate("assignedUser", "fullName phoneNumber role")
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
      .populate("assignedUser", "fullName phoneNumber role team")
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

    // 🔒 KHÓA TUYỆT ĐỐI assignedUser
    if ("assignedUser" in req.body) {
      return res.status(403).json({
        success: false,
        message:
          "Không được phép thay đổi người quản lý resource. Hãy sử dụng Batch Assign.",
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
      resource.defaultPassword = await bcrypt.hash(defaultPassword, 10);
    }

    if (recoveryEmail)
      resource.recoveryEmail = recoveryEmail.toLowerCase().trim();
    if (status) resource.status = status;
    if (note !== undefined) resource.note = note;

    await resource.save();

    const updatedResource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName phoneNumber role")
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

    const assignedUserId = resource.assignedUser;

    // 🔔 SEND NOTIFICATION
    if (assignedUserId) {
      await sendNotification({
        userId: assignedUserId,
        title: "Admin đã xóa tài nguyên của bạn",
        message: `Tài nguyên ${resource.email} đã bị admin xóa khỏi hệ thống.`,
        metadata: {
          resourceId: resourceId,
        },
      });
    }

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
      .populate("assignedUser", "fullName phoneNumber role")
      .populate("assignedChannel", "name link status")
      .lean();

    // 🔔 SEND NOTIFICATION
    if (userId) {
      await sendNotification({
        userId: userId,
        title: "Admin đã giao tài nguyên cho bạn",
        message: `Admin đã giao cho bạn tài nguyên ${resource.email}.`,
        metadata: {
          resourceId: resourceId,
        },
      });
    }

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
      .populate("assignedUser", "fullName phoneNumber role")
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

// Gán nhiều resources cho một user
const bulkAssignToUser = async (req, res, next) => {
  try {
    const { resourceIds, userId } = req.body;

    if (
      !resourceIds ||
      !Array.isArray(resourceIds) ||
      resourceIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ít nhất một resource!",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId!",
      });
    }

    // Kiểm tra user tồn tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user!",
      });
    }

    // Kiểm tra tất cả resources
    const resources = await Resource.find({
      _id: { $in: resourceIds },
    });

    if (resources.length !== resourceIds.length) {
      return res.status(404).json({
        success: false,
        message: "Một số resource không tồn tại!",
      });
    }

    // Kiểm tra trạng thái resources
    const unavailableResources = resources.filter(
      (r) => r.status !== "AVAILABLE",
    );

    if (unavailableResources.length > 0) {
      return res.status(400).json({
        success: false,
        message: `${unavailableResources.length} resource không khả dụng để gán!`,
        unavailableResources: unavailableResources.map((r) => ({
          email: r.email,
          status: r.status,
        })),
      });
    }

    // Cập nhật tất cả resources
    await Resource.updateMany(
      { _id: { $in: resourceIds } },
      {
        assignedUser: userId,
        status: "ASSIGNED",
      },
    );

    // Lấy lại resources đã cập nhật
    const updatedResources = await Resource.find({
      _id: { $in: resourceIds },
    })
      .populate("assignedUser", "fullName phoneNumber role")
      .lean();

    res.json({
      success: true,
      message: `Đã gán ${updatedResources.length} resources cho ${user.fullName}!`,
      data: updatedResources,
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

    const previousUserId = resource.assignedUser;

    resource.assignedUser = null;
    resource.assignedChannel = null;
    resource.status = "AVAILABLE";
    await resource.save();

    const updatedResource = await Resource.findById(resourceId)
      .populate("assignedUser", "fullName phoneNumber role")
      .populate("assignedChannel", "name link status")
      .lean();

    // 🔔 SEND NOTIFICATION
    if (previousUserId) {
      await sendNotification({
        userId: previousUserId,
        title: "Admin đã gỡ tài nguyên cho bạn",
        message: `Tài nguyên ${resource.email} đã được thu hồi và không còn thuộc quyền sử dụng của bạn.`,
        metadata: {
          resourceId: resourceId,
        },
      });
    }

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
      .populate("assignedUser", "fullName phoneNumber role")
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
      .populate("assignedUser", "fullName phoneNumber role")
      .populate("assignedChannel", "name link status")
      .lean();

    // 🔔 SEND NOTIFICATION
    if (resource.assignedUser) {
      await sendNotification({
        userId: notifyUserIds[0],
        title: "Admin đã kích hoạt lại tài nguyên",
        message: `Tài nguyên ${resource.email} đã được admin kích hoạt lại.`,
        metadata: {
          resourceId: resourceId,
        },
      });
    }

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
  bulkAssignToUser,
  unassign,
  getMyResources,
  getResourceStats,
  disableResource,
  enableResource,
};
