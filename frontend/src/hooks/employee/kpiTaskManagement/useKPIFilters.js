import { useState, useMemo } from "react";

/**
 * Custom hook để quản lý filter và sort cho KPIs
 * @param {Array} kpis - Danh sách KPIs
 * @returns {Object} {
 *   filterStatus,
 *   setFilterStatus,
 *   filterSort,
 *   setFilterSort,
 *   filteredKPIs
 * }
 */
function useKPIFilters(kpis) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");

  const filteredKPIs = useMemo(() => {
    let filtered = [...kpis];

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((kpi) => kpi.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filterSort) {
        case "NEWEST":
          return new Date(b.startDate) - new Date(a.startDate);

        case "OLDEST":
          return new Date(a.startDate) - new Date(b.startDate);

        case "REVENUE_DESC":
          return b.revenueTarget - a.revenueTarget;

        case "REVENUE_ASC":
          return a.revenueTarget - b.revenueTarget;

        case "PROGRESS_DESC":
          return (b.revenueProgress || 0) - (a.revenueProgress || 0);

        case "PROGRESS_ASC":
          return (a.revenueProgress || 0) - (b.revenueProgress || 0);

        default:
          return 0;
      }
    });

    return filtered;
  }, [kpis, filterStatus, filterSort]);

  return {
    filterStatus,
    setFilterStatus,
    filterSort,
    setFilterSort,
    filteredKPIs,
  };
}

export default useKPIFilters;
