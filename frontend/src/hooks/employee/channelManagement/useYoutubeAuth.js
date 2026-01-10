import { useCallback } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để quản lý YouTube authentication
 * @returns {Object} { authOperations }
 */
function useYouTubeAuth() {
  /**
   * Get authorization URL for a channel
   */
  const getAuthUrl = useCallback(async (channelId) => {
    try {
      const response = await axios.get(
        `${config.backendBase}/youtube-auth/get-auth-url`,
        {
          params: { channelId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        window.location.href = response.data.authUrl;
        return { success: true };
      }
    } catch (err) {
      console.error("Error getting auth URL:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Không thể lấy URL xác thực",
      };
    }
  }, []);

  /**
   * Check authorization status
   */
  const checkAuthStatus = useCallback(async (channelId) => {
    try {
      const response = await axios.get(
        `${config.backendBase}/youtube-auth/check-status/${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const { data } = response.data;
        const statusMessage = data.isAuthorized
          ? `✅ Đã xác thực\nTrạng thái: ${data.status}\nHết hạn: ${new Date(
              data.expiresAt
            ).toLocaleString("vi-VN")}`
          : `❌ Chưa xác thực\nLý do: ${data.reason}\n${data.message}`;

        return {
          success: true,
          message: statusMessage,
          data,
        };
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Không thể kiểm tra trạng thái",
      };
    }
  }, []);

  /**
   * Revoke authorization
   */
  const revokeAuth = useCallback(async (channelId) => {
    try {
      const response = await axios.delete(
        `${config.backendBase}/youtube-auth/revoke/${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        return {
          success: true,
          message: "Thu hồi quyền thành công!",
        };
      }
    } catch (err) {
      console.error("Error revoking auth:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Không thể thu hồi quyền",
      };
    }
  }, []);

  return {
    authOperations: {
      getAuthUrl,
      checkAuthStatus,
      revokeAuth,
    },
  };
}

export default useYouTubeAuth;
