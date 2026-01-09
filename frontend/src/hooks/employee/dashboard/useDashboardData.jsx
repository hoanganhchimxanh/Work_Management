import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "../../../configs/api";

export function useDashboardData(timeFilter) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ownedChannels: 0,
    completedTasks: 0,
    completedKPI: 0,
  });
  const [chartData, setChartData] = useState([]);

  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch {}
  }

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const getDateRange = (filter) => {
    const endDate = new Date();
    let startDate = new Date();

    const days = {
      "7days": 7,
      "28days": 28,
      "90days": 90,
      "365days": 365,
    };

    if (filter === "lifetime") {
      startDate = new Date("2020-01-01");
    } else {
      startDate.setDate(endDate.getDate() - (days[filter] || 28));
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  const formatDateForChart = (dateString, filter) => {
    const date = new Date(dateString);

    if (filter === "365days" || filter === "lifetime") {
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        year: "numeric",
      });
    } else if (filter === "90days") {
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        month: "numeric",
        day: "numeric",
      });
    }
  };

  const aggregateDataByPeriod = (analytics, filter) => {
    if (!analytics || analytics.length === 0) return [];

    const sorted = [...analytics].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    if (filter === "7days" || filter === "28days") {
      const dailyData = {};
      sorted.forEach((item) => {
        const dateKey = new Date(item.date).toISOString().split("T")[0];
        if (!dailyData[dateKey]) dailyData[dateKey] = 0;
        dailyData[dateKey] += item.estimatedRevenue || 0;
      });

      return Object.entries(dailyData).map(([date, revenue]) => ({
        date: formatDateForChart(date, filter),
        revenue,
      }));
    }

    if (filter === "90days") {
      const weeklyData = {};
      sorted.forEach((item) => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyData[weekKey]) weeklyData[weekKey] = 0;
        weeklyData[weekKey] += item.estimatedRevenue || 0;
      });

      return Object.entries(weeklyData).map(([date, revenue]) => ({
        date: formatDateForChart(date, filter),
        revenue,
      }));
    }

    const monthlyData = {};
    sorted.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) monthlyData[monthKey] = 0;
      monthlyData[monthKey] += item.estimatedRevenue || 0;
    });

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      date: formatDateForChart(`${month}-01`, filter),
      revenue,
    }));
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(timeFilter);

      const userResponse = await axios.get(
        `${config.backendBase}/user/get-one/${userId}`,
        axiosConfig
      );
      const userChannels = userResponse.data.data.channels || [];
      const ownedChannels = userChannels.length;

      let totalRevenue = 0;
      let allAnalytics = [];

      for (const channel of userChannels) {
        try {
          const analyticsResponse = await axios.get(
            `${config.backendBase}/youtube-analytics/get-analytics/${channel.channelId}`,
            { ...axiosConfig, params: { startDate, endDate } }
          );

          const channelAnalytics = analyticsResponse.data.data;
          totalRevenue += channelAnalytics.totals?.totalRevenue || 0;
          allAnalytics.push(...(channelAnalytics.analytics || []));
        } catch (err) {
          console.error(
            `Failed to fetch analytics for channel ${channel.channelId}:`,
            err
          );
        }
      }

      const tasksResponse = await axios.get(
        `${config.backendBase}/task/my-tasks`,
        axiosConfig
      );
      const completedTasks = tasksResponse.data.data.filter(
        (task) => task.status === "COMPLETED"
      ).length;

      const kpiResponse = await axios.get(
        `${config.backendBase}/kpi/my-kpis-with-progress`,
        axiosConfig
      );
      const userKPIs = kpiResponse.data.data || [];

      let avgKPICompletion = 0;
      if (userKPIs.length > 0) {
        const totalCompletion = userKPIs.reduce((sum, kpi) => {
          const revenueProgress = kpi.revenueProgress || 0;
          const bktProgress = kpi.bktProgress || 0;
          return sum + (revenueProgress + bktProgress) / 2;
        }, 0);

        avgKPICompletion = Math.round(totalCompletion / userKPIs.length);
      }

      const aggregatedData = aggregateDataByPeriod(allAnalytics, timeFilter);

      setStats({
        totalRevenue: Number(totalRevenue.toFixed(2)),
        ownedChannels,
        completedTasks,
        completedKPI: avgKPICompletion,
      });
      setChartData(aggregatedData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  return { loading, error, stats, chartData, refetch: fetchDashboardData };
}
