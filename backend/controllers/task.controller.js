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

    let notifyUserIds = [];

    // Kiểm tra user
    if (assignedToUser) {
      const user = await User.findById(assignedToUser);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user!",
        });
      }
      notifyUserIds = [assignedToUser];
    }

    // Kiểm tra team
    if (assignedToTeam) {
      const team = await Team.findById(assignedToTeam).populate(
        "members",
        "_id"
      );
      if (!team) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy team!",
        });
      }
      notifyUserIds = team.members.map((m) => m._id);
    }

    // Tạo task
    const newTask = await Task.create({
      title,
      description: description || "",
      assignedToUser: assignedToUser || null,
      assignedToTeam: assignedToTeam || null,
      status: status || "PENDING",
      deadline: deadline || null,
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedToUser", "fullName personalEmail role")
      .populate("assignedToTeam", "name")
      .lean();

    // 🔔 SEND NOTIFICATION
    if (notifyUserIds.length === 1) {
      await sendNotification({
        userId: notifyUserIds[0],
        title: "Bạn được giao công việc mới",
        message: `Công việc "${title}" vừa được giao cho bạn.`,
        // type: "TASK",
        metadata: {
          taskId: newTask._id,
          deadline,
        },
      });
    } else if (notifyUserIds.length > 1) {
      await sendBulkNotification({
        userIds: notifyUserIds,
        title: "Team bạn có công việc mới",
        message: `Công việc "${title}" vừa được giao cho team của bạn.`,
        // type: "TASK",
        metadata: {
          taskId: newTask._id,
          deadline,
        },
      });
    }

    return res.status(201).json({
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
      .populate("assignedToUser", "fullName personalEmail role")
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
      .populate("assignedToUser", "fullName personalEmail role")
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

    // Cập nhật các field
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (status) task.status = status;
    if (deadline !== undefined) task.deadline = deadline;

    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("assignedToUser", "fullName personalEmail role")
      .populate("assignedToTeam", "name")
      .lean();

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

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(taskId)
      .populate("assignedToUser", "fullName personalEmail role")
      .populate("assignedToTeam", "name")
      .lean();

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

    await Task.findByIdAndDelete(taskId);

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
      .populate("assignedToUser", "fullName personalEmail role")
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
      .populate("assignedToUser", "fullName personalEmail")
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
    if (assignedToUser) filter.assignedToUser = assignedToUser;
    if (assignedToTeam) filter.assignedToTeam = assignedToTeam;

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
