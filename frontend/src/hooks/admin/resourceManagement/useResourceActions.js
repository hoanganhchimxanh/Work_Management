import { useState } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để xử lý các actions của resources
 * @param {Function} getAuthConfig - Function to get auth config
 * @param {Function} refetchData - Function to refetch data
 * @returns {Object} { handlers, success, error, setters }
 */
function useResourceActions(getAuthConfig, refetchData) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /**
   * Show success message với auto clear
   */
  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  /**
   * Create resource
   */
  const handleCreate = async (data) => {
    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/create-new`,
        data,
        getAuthConfig()
      );
      showSuccess("Tạo resource thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo resource");
      console.error("Error creating resource:", err);
      return false;
    }
  };

  /**
   * Update resource
   */
  const handleUpdate = async (id, data) => {
    try {
      setError("");
      await axios.put(
        `${config.backendBase}/resource/update/${id}`,
        data,
        getAuthConfig()
      );
      showSuccess("Cập nhật resource thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật resource"
      );
      console.error("Error updating resource:", err);
      return false;
    }
  };

  /**
   * Delete resource
   */
  const handleDelete = async (resource) => {
    if (resource.status === "ASSIGNED") {
      setError("Không thể xóa resource đang được gán! Vui lòng gỡ gán trước.");
      return false;
    }

    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa resource "${resource.email}"?`)
    ) {
      return false;
    }

    try {
      setError("");
      await axios.delete(
        `${config.backendBase}/resource/delete/${resource._id}`,
        getAuthConfig()
      );
      showSuccess("Xóa resource thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi xóa resource");
      console.error("Error deleting resource:", err);
      return false;
    }
  };

  /**
   * Assign to user
   */
  const handleAssignToUser = async (resourceId, userId) => {
    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/assign-to-user/${resourceId}`,
        { userId },
        getAuthConfig()
      );
      showSuccess("Gán resource cho nhân viên thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gán resource");
      console.error("Error assigning resource:", err);
      return false;
    }
  };

  /**
   * Assign to channel
   */
  const handleAssignToChannel = async (resourceId, channelId) => {
    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/assign-to-channel/${resourceId}`,
        { channelId },
        getAuthConfig()
      );
      showSuccess("Gán resource cho kênh thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gán resource");
      console.error("Error assigning resource:", err);
      return false;
    }
  };

  /**
   * Bulk assign to user
   */
  const handleBulkAssignToUser = async (resourceIds, userId) => {
    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/bulk-assign-to-user`,
        { resourceIds, userId },
        getAuthConfig()
      );
      showSuccess(`Đã gán ${resourceIds.length} resources thành công!`);
      refetchData();
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi gán hàng loạt"
      );
      console.error("Error bulk assigning:", err);
      return false;
    }
  };

  /**
   * Unassign resource
   */
  const handleUnassign = async (resource) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn gỡ gán resource "${resource.email}"?`
      )
    ) {
      return false;
    }

    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/unassign/${resource._id}`,
        {},
        getAuthConfig()
      );
      showSuccess("Gỡ gán resource thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi gỡ gán resource"
      );
      console.error("Error unassigning resource:", err);
      return false;
    }
  };

  /**
   * Disable resource
   */
  const handleDisable = async (resource) => {
    const note = window.prompt(
      "Nhập lý do vô hiệu hóa (tùy chọn):",
      resource.note || ""
    );

    if (note === null) return false;

    try {
      setError("");
      await axios.patch(
        `${config.backendBase}/resource/disable/${resource._id}`,
        { note },
        getAuthConfig()
      );
      showSuccess("Vô hiệu hóa resource thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi vô hiệu hóa resource"
      );
      console.error("Error disabling resource:", err);
      return false;
    }
  };

  /**
   * Enable resource
   */
  const handleEnable = async (resource) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn kích hoạt lại resource "${resource.email}"?`
      )
    ) {
      return false;
    }

    try {
      setError("");
      await axios.patch(
        `${config.backendBase}/resource/enable/${resource._id}`,
        {},
        getAuthConfig()
      );
      showSuccess("Kích hoạt resource thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi kích hoạt resource"
      );
      console.error("Error enabling resource:", err);
      return false;
    }
  };

  /**
   * Export to Excel
   */
  const handleExport = async () => {
    try {
      const response = await axios.get(
        `${config.backendBase}/excel/export-resource-excel`,
        {
          responseType: "blob",
          ...getAuthConfig(),
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `resources_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSuccess("Export thành công!");
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi export");
      console.error("Error exporting:", err);
      return false;
    }
  };

  /**
   * Import from Excel
   */
  const handleImport = async (file) => {
    try {
      setError("");
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `${config.backendBase}/excel/import-resource-excel`,
        formData,
        {
          headers: {
            ...getAuthConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showSuccess("Import resource từ Excel thành công!");
      refetchData();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi import Excel");
      console.error("Error importing resource:", err);
      return false;
    }
  };

  return {
    // Handlers
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAssignToUser,
    handleAssignToChannel,
    handleBulkAssignToUser,
    handleUnassign,
    handleDisable,
    handleEnable,
    handleExport,
    handleImport,

    // Messages
    success,
    error,

    // Setters
    setSuccess,
    setError,
  };
}

export default useResourceActions;
