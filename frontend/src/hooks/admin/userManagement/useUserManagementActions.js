import { useState } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để xử lý các actions của User Management
 * @param {Function} getAuthConfig - Function to get auth config
 * @param {Function} refetchUsers - Function to refetch users
 * @param {Function} refetchTeams - Function to refetch teams
 * @param {Function} refetchAll - Function to refetch both
 * @returns {Object} { handlers, success, error }
 */
function useUserManagementActions(
  getAuthConfig,
  refetchUsers,
  refetchTeams,
  refetchAll
) {
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
   * Show error message
   */
  const showError = (message) => {
    setError(message);
  };

  /**
   * User Import
   */
  const handleUserImport = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `${config.backendBase}/excel/import-user-excel`,
        formData,
        {
          headers: {
            ...getAuthConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showSuccess("Import người dùng thành công!");
      refetchUsers();
      return true;
    } catch (err) {
      showError(
        "Import thất bại: " + (err.response?.data?.message || err.message)
      );
      console.error("Error importing users:", err);
      return false;
    }
  };

  /**
   * User Export
   */
  const handleUserExport = async () => {
    try {
      const response = await axios.get(
        `${config.backendBase}/excel/export-user-excel`,
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
        `users_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSuccess("Export người dùng thành công!");
      return true;
    } catch (err) {
      showError(
        "Export thất bại: " + (err.response?.data?.message || err.message)
      );
      console.error("Error exporting users:", err);
      return false;
    }
  };

  /**
   * Team Import
   */
  const handleTeamImport = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(
        `${config.backendBase}/excel/import-team-excel`,
        formData,
        {
          headers: {
            ...getAuthConfig().headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showSuccess("Import team thành công!");
      refetchAll(); // Refetch both users and teams
      return true;
    } catch (err) {
      showError(
        "Import thất bại: " + (err.response?.data?.message || err.message)
      );
      console.error("Error importing teams:", err);
      return false;
    }
  };

  /**
   * Team Export
   */
  const handleTeamExport = async () => {
    try {
      const response = await axios.get(
        `${config.backendBase}/excel/export-team-excel`,
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
        `teams_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      showSuccess("Export team thành công!");
      return true;
    } catch (err) {
      showError(
        "Export thất bại: " + (err.response?.data?.message || err.message)
      );
      console.error("Error exporting teams:", err);
      return false;
    }
  };

  return {
    // Handlers
    handleUserImport,
    handleUserExport,
    handleTeamImport,
    handleTeamExport,

    // Messages
    success,
    error,

    // Setters
    setSuccess,
    setError,
    showSuccess,
    showError,
  };
}

export default useUserManagementActions;
