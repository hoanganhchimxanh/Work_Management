import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để quản lý tasks của user
 * @param {string} token - JWT token
 * @returns {Object} { tasks, loading, error, refetch, updateTaskStatus }
 */
function useMyTasks(token) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${config.backendBase}/task/my-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(
        err.response?.data?.message || "Không thể tải danh sách công việc",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật trạng thái task
   * @param {string} taskId - ID của task
   * @param {string} newStatus - Trạng thái mới
   * @returns {Promise<Object>} - Response data hoặc error
   */
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.patch(
        `${config.backendBase}/task/update-status/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        // Update local state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task,
          ),
        );

        return {
          success: true,
          message: "Cập nhật trạng thái thành công",
          newStatus,
        };
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      throw new Error(
        err.response?.data?.message ||
          "Không thể cập nhật trạng thái công việc",
      );
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    updateTaskStatus,
  };
}

export default useMyTasks;
