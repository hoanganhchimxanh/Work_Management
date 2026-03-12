import api from "./api.service";

export const fetchNotifications = (page = 1, limit = 20) =>
  api.get("/notification", {
    params: { page, limit },
  });

export const fetchUnreadCount = () =>
  api.get("/notification/unread-count");

export const markNotificationRead = (id) =>
  api.patch(`/notification/${id}/read`);

export const markAllRead = () =>
  api.patch("/notification/read-all");

/**
 * DELETE /notification/:id
 * Xóa 1 notification
 */
export const deleteNotification = (id) =>
  api.delete(`/notification/${id}`);
