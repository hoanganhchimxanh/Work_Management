import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để xử lý các actions liên quan đến account
 * @param {string} token - JWT token
 * @returns {Object} { deleteAccount, isDeleting, deleteError }
 */
function useAccountActions(token) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const deleteAccount = async () => {
    // Xác nhận lần 1
    const confirmText = window.prompt(
      'Nhập "XÓA TÀI KHOẢN" để xác nhận (viết hoa):',
    );

    if (confirmText !== "XÓA TÀI KHOẢN") {
      alert("Xác nhận không đúng. Hủy thao tác.");
      return false;
    }

    // Xác nhận lần 2
    const confirmDelete = window.confirm(
      "⚠️ CẢNH BÁO: Hành động này không thể hoàn tác!\n\n" +
        "Tất cả dữ liệu liên quan sẽ bị xóa:\n" +
        "- Tài khoản đăng nhập\n" +
        "- KPI cá nhân\n" +
        "- Thông báo\n" +
        "- Quyền quản lý kênh\n\n" +
        "Bạn có chắc chắn muốn xóa tài khoản?",
    );

    if (!confirmDelete) {
      return false;
    }

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await axios.delete(
        `${config.backendBase}/user/delete-self-account`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        alert("✅ Tài khoản đã được xóa thành công!");
        localStorage.removeItem("token");
        navigate("/login");
        return true;
      }
    } catch (error) {
      console.error("Lỗi xóa tài khoản:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi xóa tài khoản!";
      setDeleteError(errorMessage);
      alert("❌ " + errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteAccount,
    isDeleting,
    deleteError,
  };
}

export default useAccountActions;
