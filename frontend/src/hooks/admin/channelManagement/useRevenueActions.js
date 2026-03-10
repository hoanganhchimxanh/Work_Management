// hooks/admin/channelManagement/useRevenueActions.js
import axios from "axios";
import config from "../../../configs/api";

export const useRevenueActions = (
  channelId,
  revenues,
  setRevenues,
  fetchRevenueData,
) => {
  const getToken = () => localStorage.getItem("token");

  const handleSyncAnalytics = async () => {
    if (
      !window.confirm(
        "Đồng bộ doanh thu và views từ YouTube Analytics?\n\nDữ liệu sẽ bao gồm: Doanh thu ước tính, Tổng views, và Views từ Mỹ.\n\n⚠️ Lưu ý: Các tháng trong quá khứ sẽ tự động bị khóa sau khi đồng bộ.",
      )
    ) {
      return;
    }

    try {
      const token = getToken();

      // ✅ Sync 12 tháng gần nhất (bao gồm cả tháng hiện tại)
      const now = new Date();

      // endMonth = tháng hiện tại
      const endMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1,
      ).padStart(2, "0")}`;

      // startMonth = 11 tháng trước
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11);
      const startMonth = `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1,
      ).padStart(2, "0")}`;

      console.log(`📅 Syncing from ${startMonth} to ${endMonth}`);

      const response = await axios.post(
        `${config.backendBase}/channel-revenue/${channelId}/sync-analytics`,
        { startMonth, endMonth },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const syncedCount = response.data.data.synced?.length || 0;
      const errorCount = response.data.data.errors?.length || 0;

      let message = `Đã đồng bộ thành công ${syncedCount} tháng!`;
      if (errorCount > 0) {
        message += `\n\nCó ${errorCount} tháng gặp lỗi hoặc đã bị khóa.`;
      }

      alert(message);
      fetchRevenueData();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi khi đồng bộ";
      alert(
        `Lỗi: ${errorMsg}\n\nVui lòng kiểm tra:\n- Kênh đã được authorize chưa?\n- Token có hết hạn không?`,
      );
    }
  };

  const handleUpdateRevenue = async (month, field, value) => {
    try {
      const token = getToken();

      // Validate input
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        alert("Giá trị không hợp lệ!");
        return;
      }

      // Validate percentage fields
      if (["taxUS", "netNetwork", "taxPIT"].includes(field)) {
        if (numValue > 100) {
          alert("Tỷ lệ phần trăm không được vượt quá 100%!");
          return;
        }
      }

      const updateData = { month, [field]: numValue };

      await axios.post(
        `${config.backendBase}/channel-revenue/${channelId}/monthly`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local state optimistically
      const updatedRevenues = revenues.map((rev) => {
        if (rev.month === month) {
          return { ...rev, [field]: numValue };
        }
        return rev;
      });
      setRevenues(updatedRevenues);

      // Refresh to get recalculated values
      setTimeout(() => fetchRevenueData(), 300);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi cập nhật");
      fetchRevenueData(); // Revert changes
    }
  };

  const handleToggleLock = async (month) => {
    const revenue = revenues.find((r) => r.month === month);
    const action = revenue?.locked ? "mở khóa" : "khóa";

    if (
      !window.confirm(
        `Bạn có chắc muốn ${action} tháng ${month}?\n\n${revenue?.locked ? "Sau khi mở khóa, bạn có thể chỉnh sửa dữ liệu." : "Sau khi khóa, bạn sẽ không thể chỉnh sửa dữ liệu."}`,
      )
    ) {
      return;
    }

    try {
      const token = getToken();
      await axios.patch(
        `${config.backendBase}/channel-revenue/${channelId}/monthly/${month}/toggle-lock`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      fetchRevenueData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi khóa/mở khóa");
    }
  };

  const handleDeleteRevenue = async (month) => {
    if (
      !window.confirm(
        `Xóa dữ liệu doanh thu tháng ${month}?\n\nHành động này không thể hoàn tác!`,
      )
    ) {
      return;
    }

    try {
      const token = getToken();
      await axios.delete(
        `${config.backendBase}/channel-revenue/${channelId}/monthly/${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      alert("Đã xóa thành công!");
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
