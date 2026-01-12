import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import config from "../../../configs/api";
import { parse, isValid, format } from "date-fns";

/**
 * Custom hook để quản lý channels
 * @param {string} userId - ID của user hiện tại
 * @returns {Object} { channels, loading, error, operations }
 */
function useChannels(userId) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  /**
   * Fetch channels assigned to current user
   */
  const fetchMyChannels = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${config.backendBase}/channel/by-owner/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setChannels(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách kênh");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Add new channel
   */
  const addChannel = useCallback(
    async (channelData) => {
      try {
        const response = await axios.post(
          `${config.backendBase}/channel/add-new`,
          {
            ...channelData,
            assignedUser: userId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          await fetchMyChannels();
          return { success: true, message: "Thêm kênh thành công!" };
        }
      } catch (err) {
        console.error("Error adding channel:", err);
        return {
          success: false,
          message: err.response?.data?.message || "Không thể thêm kênh",
        };
      }
    },
    [userId, fetchMyChannels]
  );

  /**
   * Update channel
   */
  const updateChannel = useCallback(
    async (channelId, data) => {
      try {
        const response = await axios.put(
          `${config.backendBase}/channel/edit/${channelId}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          await fetchMyChannels();
          return { success: true, message: "Cập nhật kênh thành công!" };
        }
      } catch (err) {
        console.error("Error updating channel:", err);
        return {
          success: false,
          message: err.response?.data?.message || "Không thể cập nhật kênh",
        };
      }
    },
    [fetchMyChannels]
  );

  /**
   * Delete channel
   */
  const deleteChannel = useCallback(
    async (channelId) => {
      try {
        const response = await axios.delete(
          `${config.backendBase}/channel/delete/${channelId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          await fetchMyChannels();
          return { success: true, message: "Xóa kênh thành công!" };
        }
      } catch (err) {
        console.error("Error deleting channel:", err);
        return {
          success: false,
          message: err.response?.data?.message || "Không thể xóa kênh",
        };
      }
    },
    [fetchMyChannels]
  );

  /**
   * Convert date format
   */
  const convertToISODate = (input) => {
    const parsedDate = parse(input, "dd-MM-yyyy", new Date());
    if (!isValid(parsedDate)) return null;
    return format(parsedDate, "yyyy-MM-dd");
  };

  /**
   * Sync channel analytics
   */
  const syncChannel = useCallback(async (channelId, startInput, endInput) => {
    if (!startInput || !endInput) {
      return {
        success: false,
        message: "Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc!",
      };
    }

    const startDate = convertToISODate(startInput);
    const endDate = convertToISODate(endInput);

    if (!startDate || !endDate) {
      return {
        success: false,
        message: "Ngày không hợp lệ! Vui lòng nhập theo định dạng dd-MM-yyyy",
      };
    }

    if (new Date(startDate) > new Date(endDate)) {
      return {
        success: false,
        message: "Ngày bắt đầu không được lớn hơn ngày kết thúc!",
      };
    }

    try {
      setSyncing(true);

      const response = await axios.post(
        `${config.backendBase}/youtube-analytics/sync/${channelId}`,
        null,
        {
          params: { startDate, endDate },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        return {
          success: true,
          message: `Đồng bộ thành công!\n${response.data.message}`,
        };
      }
    } catch (err) {
      console.error("Error syncing channel:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Không thể đồng bộ dữ liệu",
      };
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchMyChannels();
  }, [fetchMyChannels]);

  return {
    channels,
    loading,
    error,
    syncing,
    operations: {
      refresh: fetchMyChannels,
      add: addChannel,
      update: updateChannel,
      delete: deleteChannel,
      sync: syncChannel,
    },
    setError,
  };
}

export default useChannels;
