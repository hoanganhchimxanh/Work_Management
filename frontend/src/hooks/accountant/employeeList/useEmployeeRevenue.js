import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Custom hook để quản lý dữ liệu doanh thu nhân viên
 * @param {string} selectedMonth - Tháng được chọn (01-12)
 * @param {string} selectedYear - Năm được chọn
 * @returns {Object} { employees, loading, error, refreshData }
 */
function useEmployeeRevenue(selectedMonth, selectedYear) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployeesRevenue();
  }, [selectedMonth, selectedYear]);

  const fetchEmployeesRevenue = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const monthQuery = `${selectedYear}-${selectedMonth}`;

      // Lấy danh sách employees
      const usersResponse = await axios.get(
        `http://localhost:9999/user/get-all`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: "ACTIVE" },
        },
      );

      const employees = usersResponse.data.data.filter(
        (user) => user.role === "EMPLOYEE",
      );

      // Lấy tổng quan doanh thu
      const revenueResponse = await axios.get(
        `http://localhost:9999/channel-revenue/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { month: monthQuery },
        },
      );

      const revenueData = revenueResponse.data.data.channels;

      console.log("🔍 Debug - Revenue Data Sample:", revenueData[0]); // Debug log

      // ✅ FIX: Tạo map với userId - Lấy đúng từ assignedUser.userId
      const revenueByUserId = {};

      revenueData.forEach((channel) => {
        // ✅ FIX: assignedUser.userId nằm trong nested object
        const assignedUserId = channel.assignedUser?.userId?.toString();

        console.log(
          "🔍 Channel:",
          channel.channelName,
          "User ID:",
          assignedUserId,
        ); // Debug log

        if (assignedUserId) {
          if (!revenueByUserId[assignedUserId]) {
            revenueByUserId[assignedUserId] = {
              totalRevenue: 0,
              channelCount: 0,
            };
          }

          revenueByUserId[assignedUserId].totalRevenue +=
            channel.totalActual || 0;
          revenueByUserId[assignedUserId].channelCount += 1;
        }
      });

      console.log("🔍 Debug - Revenue Map:", revenueByUserId); // Debug log

      // Merge employee data với revenue data
      const employeesWithRevenue = employees.map((user) => {
        // ✅ FIX: So sánh string với string
        const userIdString = user.userId?.toString();
        const userRevenue = revenueByUserId[userIdString] || {
          totalRevenue: 0,
          channelCount: 0,
        };

        console.log(`🔍 User: ${user.fullName} (${userIdString})`, userRevenue); // Debug log

        return {
          ...user,
          totalRevenue: userRevenue.totalRevenue,
          channelCount: userRevenue.channelCount,
        };
      });

      setEmployees(employeesWithRevenue);
    } catch (err) {
      console.error("Error fetching employees revenue:", err);
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách nhân viên. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    employees,
    loading,
    error,
    refreshData: fetchEmployeesRevenue,
    clearError: () => setError(null),
  };
}

export default useEmployeeRevenue;
