import axios from "axios";
import config from "../configs/api";

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const fetchNotifications = (page = 1, limit = 20) =>
  axios.get(
    `${config.backendBase}/notification?page=${page}&limit=${limit}`,
    getAuthHeader(),
  );

export const fetchUnreadCount = () =>
  axios.get(`${config.backendBase}/notification/unread-count`, getAuthHeader());

export const markNotificationRead = (id) =>
  axios.patch(
    `${config.backendBase}/notification/${id}/read`,
    {},
    getAuthHeader(),
  );

export const markAllRead = () =>
  axios.patch(
    `${config.backendBase}/notification/read-all`,
    {},
    getAuthHeader(),
  );

/**
 * DELETE /notification/:id
 * Xóa 1 notification
 */
export const deleteNotification = (id) =>
  axios.delete(`${config.backendBase}/notification/${id}`, getAuthHeader());
