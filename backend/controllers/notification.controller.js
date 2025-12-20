const db = require("../models");
const Notification = db.Notification;

/**
 * GET /notification
 * Lấy danh sách thông báo của user (có phân trang)
 */
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách thông báo",
    });
  }
};

/**
 * GET /notification/unread-count
 * Đếm số thông báo chưa đọc
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Không thể lấy số thông báo chưa đọc",
    });
  }
};

/**
 * PATCH /notification/:id/read
 * Đánh dấu 1 thông báo đã đọc
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Thông báo không tồn tại",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật thông báo",
    });
  }
};

/**
 * PATCH /notification/read-all
 * Đánh dấu tất cả thông báo đã đọc
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({
      success: true,
      message: "Đã đánh dấu tất cả thông báo là đã đọc",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật thông báo",
    });
  }
};

/**
 * DELETE /notification/:id
 * Xóa 1 thông báo
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await Notification.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Thông báo không tồn tại",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Đã xóa thông báo",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Không thể xóa thông báo",
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
