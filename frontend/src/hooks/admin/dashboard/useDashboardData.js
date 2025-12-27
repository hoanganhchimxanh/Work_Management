import { useState, useEffect } from "react";
import config from "../../../configs/api";

/**
 * Custom hook để fetch dashboard data
 * @param {Object} dateParams - { startDate, endDate }
 * @param {string} token - Auth token
 * @returns {Object} { stats, revenueData, topEmployees, topTeams, topChannels, loading, error }
 */
function useDashboardData(dateParams, token) {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalEmployees: 0,
    totalChannels: 0,
    activeNetworks: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [topTeams, setTopTeams] = useState([]);
  const [topChannels, setTopChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWithAuth = async (url) => {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  };

  // Fetch Dashboard Statistics
  const fetchDashboardStats = async () => {
    try {
      const { startDate, endDate } = dateParams;
      const data = await fetchWithAuth(
        `${config.backendBase}/dashboard/stats?startDate=${startDate}&endDate=${endDate}`
      );

      if (data.success) {
        setStats({
          totalRevenue: data.data.totalRevenue || 0,
          totalEmployees: data.data.totalEmployees || 0,
          totalChannels: data.data.totalChannels || 0,
          activeNetworks: data.data.activeNetworks || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  };

  // Fetch Daily Revenue Data
  const fetchRevenueData = async () => {
    try {
      const { startDate, endDate } = dateParams;
      const data = await fetchWithAuth(
        `${config.backendBase}/dashboard/revenue-by-day?startDate=${startDate}&endDate=${endDate}`
      );

      if (data.success) {
        setRevenueData(data.data);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      throw error;
    }
  };

  // Fetch Top Employees
  const fetchTopEmployees = async () => {
    try {
      const { startDate, endDate } = dateParams;
      const data = await fetchWithAuth(
        `${config.backendBase}/dashboard/top-employees?limit=5&startDate=${startDate}&endDate=${endDate}`
      );

      if (data.success) {
        setTopEmployees(
          data.data.map((item) => ({
            name: item.fullName || item.name,
            revenue: item.totalRevenue || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching top employees:", error);
      throw error;
    }
  };

  // Fetch Top Teams
  const fetchTopTeams = async () => {
    try {
      const { startDate, endDate } = dateParams;
      const data = await fetchWithAuth(
        `${config.backendBase}/dashboard/top-teams?limit=5&startDate=${startDate}&endDate=${endDate}`
      );

      if (data.success) {
        setTopTeams(
          data.data.map((item) => ({
            name: item.teamName || item.name,
            revenue: item.totalRevenue || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching top teams:", error);
      throw error;
    }
  };

  // Fetch Top Channels
  const fetchTopChannels = async () => {
    try {
      const { startDate, endDate } = dateParams;
      const data = await fetchWithAuth(
        `${config.backendBase}/dashboard/top-channels?limit=5&startDate=${startDate}&endDate=${endDate}`
      );

      if (data.success) {
        setTopChannels(
          data.data.map((item) => ({
            name: item.channelName || item.name,
            revenue: item.totalRevenue || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching top channels:", error);
      throw error;
    }
  };

  // Load all data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchRevenueData(),
          fetchTopEmployees(),
          fetchTopTeams(),
          fetchTopChannels(),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (token && dateParams.startDate && dateParams.endDate) {
      loadDashboardData();
    }
  }, [dateParams.startDate, dateParams.endDate, token]);

  return {
    stats,
    revenueData,
    topEmployees,
    topTeams,
    topChannels,
    loading,
    error,
    setError,
  };
}

export default useDashboardData;
