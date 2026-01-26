import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để quản lý dữ liệu user profile
 * @param {string} userId - ID của user cần lấy thông tin
 * @param {string} token - JWT token
 * @returns {Object} { userData, loading, error, refetch }
 */
function useUserProfile(userId, token) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${config.backendBase}/user/get-one/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setUserData(res.data.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(
        err.response?.data?.message || "Không thể tải thông tin người dùng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userId, token]);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserData,
  };
}

export default useUserProfile;
