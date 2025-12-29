import { useState } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để xử lý các actions của Network
 * @param {Function} getAuthConfig - Function to get auth config
 * @param {Object} filters - Current filters for export
 * @param {Function} refetch - Function to refetch networks
 * @returns {Object} { handlers, alert, setAlert }
 */
function useNetworkActions(getAuthConfig, filters, refetch) {
  const [alert, setAlert] = useState(null);

  /**
   * Show alert với auto dismiss
   */
  const showAlert = (message, variant = "success") => {
    setAlert({ message, variant });
    setTimeout(() => setAlert(null), 3000);
  };

  /**
   * Export networks to Excel
   */
  const handleExport = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.country) params.country = filters.country;

      const response = await axios.get(
        `${config.backendBase}/network/export-excel`,
        {
          params,
          responseType: "blob",
          ...getAuthConfig(),
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `networks_${new Date().toISOString().split("T")[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showAlert("Xuất Excel thành công!");
      return true;
    } catch (error) {
      console.error("Export error:", error);
      showAlert("Lỗi khi xuất Excel", "danger");
      return false;
    }
  };

  /**
   * Import networks from Excel
   */
  const handleImport = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`${config.backendBase}/network/import-excel`, formData, {
        headers: {
          ...getAuthConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      showAlert("Import network thành công!");
      refetch();
      return true;
    } catch (error) {
      console.error("Import error:", error);
      showAlert("Lỗi khi import network", "danger");
      return false;
    }
  };

  /**
   * Update network
   */
  const handleUpdate = async (networkId, data) => {
    try {
      const response = await axios.put(
        `${config.backendBase}/network/update/${networkId}`,
        data,
        getAuthConfig()
      );

      if (response.data.success) {
        showAlert("Cập nhật network thành công!");
        refetch();
        return true;
      } else {
        showAlert("Cập nhật thất bại!", "danger");
        return false;
      }
    } catch (error) {
      console.error("Update error:", error);
      const errorMsg =
        error.response?.data?.message || "Lỗi khi cập nhật network!";
      showAlert(errorMsg, "danger");
      return false;
    }
  };

  /**
   * Delete network
   */
  const handleDelete = async (network) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa network "${network.profileAdsenseId}"?\n\nLưu ý: Không thể xóa network nếu còn kênh đang thuộc network này!`
    );

    if (!confirmDelete) return false;

    try {
      const { data } = await axios.delete(
        `${config.backendBase}/network/delete/${network._id}`,
        getAuthConfig()
      );

      if (data.success) {
        showAlert("Xóa network thành công!");
        refetch();
        return true;
      } else {
        showAlert(data.message || "Xóa thất bại!", "danger");
        return false;
      }
    } catch (error) {
      console.error("Delete error:", error);
      const errorMsg = error.response?.data?.message || "Lỗi khi xóa network!";
      showAlert(errorMsg, "danger");
      return false;
    }
  };

  return {
    // Handlers
    handleExport,
    handleImport,
    handleUpdate,
    handleDelete,

    // Alert
    alert,
    setAlert,
    showAlert,
  };
}

export default useNetworkActions;
