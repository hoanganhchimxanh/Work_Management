import { useMemo } from "react";

/**
 * Custom hook để format revenue data cho chart
 * @param {Array} rawData - Raw revenue data từ API
 * @param {string} dateRange - Date range filter (7, 28, 90, 365, lifetime)
 * @returns {Array} Formatted data cho chart
 */
function useRevenueChart(rawData, dateRange) {
  const formattedData = useMemo(() => {
    if (!rawData || rawData.length === 0) return [];

    // DAILY aggregation (7 days, 28 days)
    if (dateRange === "7" || dateRange === "28") {
      return rawData.map((item) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        revenue: item.revenue || 0,
      }));
    }

    // WEEKLY aggregation (90 days)
    if (dateRange === "90") {
      const weeklyData = {};

      rawData.forEach((item) => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = 0;
        }
        weeklyData[weekKey] += item.revenue || 0;
      });

      return Object.entries(weeklyData)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, revenue]) => ({
          date: new Date(date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
          revenue,
        }));
    }

    // MONTHLY aggregation (365 days, lifetime)
    const monthlyData = {};

    rawData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += item.revenue || 0;
    });

    return Object.entries(monthlyData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({
        date: `T${parseInt(month.split("-")[1])}/${month.split("-")[0]}`,
        revenue,
      }));
  }, [rawData, dateRange]);

  return formattedData;
}

export default useRevenueChart;
