import { useState, useMemo } from "react";

/**
 * Custom hook để quản lý filter và sort cho Tasks
 * @param {Array} tasks - Danh sách tasks
 * @returns {Object} {
 *   filterStatus,
 *   setFilterStatus,
 *   filterSort,
 *   setFilterSort,
 *   searchTerm,
 *   setSearchTerm,
 *   filteredTasks
 * }
 */
function useTaskFilters(tasks) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filterSort) {
        case "NEWEST":
          return new Date(b.createdAt) - new Date(a.createdAt);

        case "OLDEST":
          return new Date(a.createdAt) - new Date(b.createdAt);

        case "DEADLINE_ASC":
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);

        case "DEADLINE_DESC":
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(b.deadline) - new Date(a.deadline);

        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, filterStatus, filterSort, searchTerm]);

  return {
    filterStatus,
    setFilterStatus,
    filterSort,
    setFilterSort,
    searchTerm,
    setSearchTerm,
    filteredTasks,
  };
}

export default useTaskFilters;
