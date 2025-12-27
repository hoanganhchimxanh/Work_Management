import { useState, useMemo } from "react";

/**
 * Custom hook để quản lý date range filter
 * @param {string} defaultRange - Default range (7, 28, 90, 365, lifetime)
 * @returns {Object} { dateRange, setDateRange, startDate, endDate, getDateParams }
 */
function useDateRange(defaultRange = "7") {
  const [dateRange, setDateRange] = useState(defaultRange);

  /**
   * Tính toán startDate và endDate dựa trên dateRange
   */
  const dateParams = useMemo(() => {
    const endDate = new Date();
    let startDate;

    if (dateRange === "lifetime") {
      startDate = new Date("2015-01-01");
    } else {
      const days = parseInt(dateRange);
      startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, [dateRange]);

  /**
   * Trả về object với startDate và endDate
   */
  const getDateParams = () => dateParams;

  /**
   * Format date cho chart display
   */
  const formatDateForChart = (dateString) => {
    const date = new Date(dateString);

    if (dateRange === "365" || dateRange === "lifetime") {
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        year: "numeric",
      });
    } else if (dateRange === "90") {
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  return {
    dateRange,
    setDateRange,
    startDate: dateParams.startDate,
    endDate: dateParams.endDate,
    getDateParams,
    formatDateForChart,
  };
}

export default useDateRange;
