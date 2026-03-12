const mongoose = require("mongoose");
const db = require("../models");
const User = db.User;
const Team = db.Team;
const Task = db.Task;

const {
  sendNotification,
  sendBulkNotification,
} = require("../services/notification.service");

// Thêm công việc mới
const createNew = async (req, res, next) => {
  try {
    const {
      title,
      description,
      assignedToUser,
      assignedToTeam,
      status,
      deadline,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tiêu đề công việc!",
      });
    }

    if (!assignedToUser && !assignedToTeam) {
      return res.status(400).json({
        success: false,
        message: "Phải gán công việc cho ít nhất một user hoặc team!",
      });
    }

    // Kiểm tra user có tồn tại không (nếu có)
    if (assignedToUser) {
      const user = await User.findById(assignedToUser);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user!",
        });
      }
    }

    // Kiểm tra team có tồn tại không (nếu có)
    if (assignedToTeam) {
      const team = await Team.findById(assignedToTeam);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy team!",
        });
      }
    }

    const newTask = await Task.create({
      title,
      description: description || "",
      assignedToUser: assignedToUser || null,
      assignedToTeam: assignedToTeam || null,
      status: status || "PENDING",
      deadline: deadline || null,
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedToUser", "fullName phoneNumber role")
      .populate("assignedToTeam", "name")
      .lean();

    // 🔔 SEND NOTIFICATION
    let userIds = [];

    if (assignedToUser) {
      userIds = [assignedToUser];
    } else if (assignedToTeam) {
      const teamMembers = await User.find({ team: assignedToTeam }).select(
        "_id",
      );
      userIds = teamMembers.map((m) => m._id);
    }

    const deadlineText = deadline
      ? ` - Deadline: ${new Date(deadline).toLocaleDateString("vi-VN")}`
      : "";

    if (userIds.length === 1) {
      await sendNotification({
        userId: userIds[0],
        title: "Bạn được gán công việc mới",
        message: `Bạn đã được gán công việc: "${title}"${deadlineText}`,
        // type: "TASK_ASSIGNED",
        metadata: {
          taskId: newTask._id,
          taskTitle: title,
          deadline: deadline || null,
        },
      });
    } else if (userIds.length > 1) {
      await sendBulkNotification({
        userIds,
        title: "Team của bạn được gán công việc mới",
        message: `Team của bạn đã được gán công việc: "${title}"${deadlineText}`,
        // type: "TASK_ASSIGNED",
        metadata: {
          taskId: newTask._id,
          taskTitle: title,
          deadline: deadline || null,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Tạo công việc thành công!",
      data: populatedTask,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy tất cả công việc
const getAll = async (req, res, next) => {
  try {
    const { assignedToUser, assignedToTeam, status } = req.query;

    // Build filter
    const filter = {};
    if (assignedToUser) filter.assignedToUser = assignedToUser;
    if (assignedToTeam) filter.assignedToTeam = assignedToTeam;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate("assignedToUser", "fullName phoneNumber role")
      .populate("assignedToTeam", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy công việc theo ID
const getById = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId)
      .populate("assignedToUser", "fullName phoneNumber role")
      .populate("assignedToTeam", "name")
      .lean();

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc!",
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật công việc
const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { title, description, status, deadline } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc!",
      });
    }

    // Lưu giá trị cũ để so sánh
    const oldTitle = task.title;
    const oldStatus = task.status;
    const oldDeadline = task.deadline;

    // Cập nhật các field
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (deadline !== undefined) task.deadline = deadline;

    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("assignedToUser", "fullName phoneNumber role")
      .populate("assignedToTeam", "name")
      .lean();

    // 🔔 SEND NOTIFICATION nếu có thay đổi quan trọng
    let hasImportantChange = false;
    let changeDetails = [];

    if (title && title !== oldTitle) {
      hasImportantChange = true;
      changeDetails.push(`Tiêu đề: "${oldTitle}" → "${title}"`);
    }

    if (status && status !== oldStatus) {
      hasImportantChange = true;
      changeDetails.push(`Trạng thái: ${oldStatus} → ${status}`);
    }

    if (deadline !== undefined && deadline !== oldDeadline) {
      hasImportantChange = true;
      const oldDeadlineText = oldDeadline
        ? new Date(oldDeadline).toLocaleDateString("vi-VN")
        : "Không có";
      const newDeadlineText = deadline
        ? new Date(deadline).toLocaleDateString("vi-VN")
        : "Không có";
      changeDetails.push(`Deadline: ${oldDeadlineText} → ${newDeadlineText}`);
    }

    if (hasImportantChange) {
      let userIds = [];

      if (task.assignedToUser) {
        userIds = [task.assignedToUser];
      } else if (task.assignedToTeam) {
        const teamMembers = await User.find({
          team: task.assignedToTeam,
        }).select("_id");
        userIds = teamMembers.map((m) => m._id);
      }

      const notificationMessage = `Công việc "${
        title || oldTitle
      }" đã được cập nhật:\n${changeDetails.join("\n")}`;

      if (userIds.length === 1) {
        await sendNotification({
          userId: userIds[0],
          title: "Công việc được cập nhật",
          message: notificationMessage,
          // type: "TASK_UPDATED",
          metadata: {
            taskId: task._id,
            taskTitle: title || oldTitle,
            changes: changeDetails,
          },
        });
      } else if (userIds.length > 1) {
        await sendBulkNotification({
          userIds,
          title: "Công việc của team được cập nhật",
          message: notificationMessage,
          // type: "TASK_UPDATED",
          metadata: {
            taskId: task._id,
            taskTitle: title || oldTitle,
            changes: changeDetails,
          },
        });
      }
    }

    res.json({
      success: true,
      message: "Cập nhật công việc thành công!",
      data: updatedTask,
    });
  } catch (err) {
    next(err);
  }
};

// Cập nhật trạng thái công việc
const updateStatus = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Thiếu trạng thái!",
      });
    }

    const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "WAITING"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ!",
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc!",
      });
    }

    const oldStatus = task.status;

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("assignedToUser", "fullName phoneNumber role")
      .populate("assignedToTeam", "name")
      .lean();

    // 🔔 SEND NOTIFICATION khi thay đổi trạng thái
    if (oldStatus !== status) {
      let userIds = [];

      if (task.assignedToUser) {
        userIds = [task.assignedToUser];
      } else if (task.assignedToTeam) {
        const teamMembers = await User.find({
          team: task.assignedToTeam,
        }).select("_id");
        userIds = teamMembers.map((m) => m._id);
      }

      const statusNames = {
        PENDING: "Chờ xử lý",
        IN_PROGRESS: "Đang thực hiện",
        COMPLETED: "Hoàn thành",
        WAITING: "Đang chờ",
      };

      const notificationMessage = `Trạng thái công việc "${task.title}" đã thay đổi: ${statusNames[oldStatus]} → ${statusNames[status]}`;

      if (userIds.length === 1) {
        await sendNotification({
          userId: userIds[0],
          title: "Trạng thái công việc đã thay đổi",
          message: notificationMessage,
          // type: "TASK_UPDATED",
          metadata: {
            taskId: task._id,
            taskTitle: task.title,
            oldStatus,
            newStatus: status,
          },
        });
      } else if (userIds.length > 1) {
        await sendBulkNotification({
          userIds,
          title: "Trạng thái công việc của team đã thay đổi",
          message: notificationMessage,
          // type: "TASK_UPDATED",
          metadata: {
            taskId: task._id,
            taskTitle: task.title,
            oldStatus,
            newStatus: status,
          },
        });
      }
    }

    res.json({
      success: true,
      message: "Cập nhật trạng thái thành công!",
      data: updatedTask,
    });
  } catch (err) {
    next(err);
  }
};

// Xóa công việc
const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy công việc!",
      });
    }

    // Lưu thông tin trước khi xóa để gửi notification
    const taskTitle = task.title;
    const assignedToUser = task.assignedToUser;
    const assignedToTeam = task.assignedToTeam;

    await Task.findByIdAndDelete(taskId);

    // 🔔 SEND NOTIFICATION khi xóa task
    let userIds = [];

    if (assignedToUser) {
      userIds = [assignedToUser];
    } else if (assignedToTeam) {
      const teamMembers = await User.find({ team: assignedToTeam }).select(
        "_id",
      );
      userIds = teamMembers.map((m) => m._id);
    }

    if (userIds.length === 1) {
      await sendNotification({
        userId: userIds[0],
        title: "Công việc đã bị xóa",
        message: `Công việc "${taskTitle}" đã bị xóa khỏi hệ thống.`,
        // type: "TASK_UPDATED",
        metadata: {
          taskTitle,
          action: "deleted",
        },
      });
    } else if (userIds.length > 1) {
      await sendBulkNotification({
        userIds,
        title: "Công việc của team đã bị xóa",
        message: `Công việc "${taskTitle}" đã bị xóa khỏi hệ thống.`,
        // type: "TASK_UPDATED",
        metadata: {
          taskTitle,
          action: "deleted",
        },
      });
    }

    res.json({
      success: true,
      message: "Xóa công việc thành công!",
    });
  } catch (err) {
    next(err);
  }
};

// Lấy công việc của user hiện tại
const getMyTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Từ JWT token

    // Lấy thông tin user để biết team
    const user = await User.findById(userId).select("team").lean();

    // Tìm tasks được gán cho user HOẶC team của user
    const filter = {
      $or: [{ assignedToUser: userId }],
    };

    // Nếu user thuộc team nào thì thêm điều kiện tìm theo team
    if (user && user.team) {
      filter.$or.push({ assignedToTeam: user.team });
    }

    const tasks = await Task.find(filter)
      .populate("assignedToUser", "fullName phoneNumber role")
      .populate("assignedToTeam", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

// Lấy công việc của team
const getTeamTasks = async (req, res, next) => {
  try {
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy team!",
      });
    }

    const tasks = await Task.find({ assignedToTeam: teamId })
      .populate("assignedToUser", "fullName phoneNumber")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

// Thống kê công việc theo trạng thái
const getTaskStats = async (req, res, next) => {
  try {
    const { assignedToUser, assignedToTeam } = req.query;

    const filter = {};
    if (assignedToUser) {
      filter.assignedToUser = new mongoose.Types.ObjectId(assignedToUser);
    }
    if (assignedToTeam) {
      filter.assignedToTeam = new mongoose.Types.ObjectId(assignedToTeam);
    }

    const stats = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedStats = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      WAITING: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
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
  createNew,
  getAll,
  getById,
  updateTask,
  updateStatus,
  deleteTask,
  getMyTasks,
  getTeamTasks,
  getTaskStats,
};
