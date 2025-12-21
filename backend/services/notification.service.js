const db = require("../models");
const Notification = db.Notification;
const { getIO } = require("../socket");

/**
 * Gửi notification cho 1 user
 */
const sendNotification = async ({
  userId,
  title,
  message,
  type = "SYSTEM",
  metadata = {},
}) => {
  try {
    // 1. Lưu DB
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      metadata,
    });

    // 2. Emit realtime
    const io = getIO();
    io.to(userId.toString()).emit("notification:new", notification);

    return notification;
  } catch (error) {
    console.error("sendNotification error:", error);
    throw error;
  }
};

/**
 * Gửi notification cho nhiều user
 */
const sendBulkNotification = async ({
  userIds = [],
  title,
  message,
  type = "SYSTEM",
  metadata = {},
}) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  try {
    // 1. Chuẩn bị payload
    const payload = userIds.map((userId) => ({
      user: userId,
      title,
      message,
      type,
      metadata,
    }));

    // 2. Lưu DB hàng loạt
    const notifications = await Notification.insertMany(payload);

    // 3. Emit realtime
    const io = getIO();
    notifications.forEach((notification) => {
      io.to(notification.user.toString()).emit(
        "notification:new",
        notification
      );
    });

    return notifications;
  } catch (error) {
    console.error("sendBulkNotification error:", error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  sendBulkNotification,
};
