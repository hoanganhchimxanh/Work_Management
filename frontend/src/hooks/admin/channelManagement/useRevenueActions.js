// hooks/admin/channelManagement/useRevenueActions.js
import axios from "axios";
import config from "../../../configs/api";

export const useRevenueActions = (
  channelId,
  revenues,
  setRevenues,
  fetchRevenueData
) => {
  const getToken = () => localStorage.getItem("token");

  const handleSyncAnalytics = async () => {
    if (!window.confirm("Đồng bộ doanh thu từ YouTube Analytics?")) return;

    try {
      const token = getToken();

      const now = new Date();
      const endMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11);
      const startMonth = `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}`;

      await axios.post(
        `${config.backendBase}/channel-revenue/${channelId}/sync-analytics`,
        { startMonth, endMonth },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Đồng bộ thành công!");
      fetchRevenueData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi đồng bộ");
    }
  };

  const handleUpdateRevenue = async (month, field, value) => {
    try {
      const token = getToken();
      const updateData = { month, [field]: parseFloat(value) || 0 };

      await axios.post(
        `${config.backendBase}/channel-revenue/${channelId}/monthly`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedRevenues = revenues.map((rev) => {
        if (rev.month === month) {
          return { ...rev, [field]: parseFloat(value) || 0 };
        }
        return rev;
      });
      setRevenues(updatedRevenues);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  const handleToggleLock = async (month) => {
    try {
      const token = getToken();
      await axios.patch(
        `${config.backendBase}/channel-revenue/${channelId}/monthly/${month}/toggle-lock`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchRevenueData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi khóa/mở khóa");
    }
  };

  const handleDeleteRevenue = async (month) => {
    if (!window.confirm(`Xóa dữ liệu tháng ${month}?`)) return;

    try {
      const token = getToken();
      await axios.delete(
        `${config.backendBase}/channel-revenue/${channelId}/monthly/${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchRevenueData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi xóa");
    }
  };

  return {
    handleSyncAnalytics,
    handleUpdateRevenue,
    handleToggleLock,
    handleDeleteRevenue,
  };
};
