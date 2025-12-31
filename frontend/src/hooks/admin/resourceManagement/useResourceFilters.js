import { useState, useMemo } from "react";

/**
 * Custom hook để quản lý filters và search
 * @param {Array} resources - Danh sách resources
 * @returns {Object} { filters, setters, filteredResources }
 */
function useResourceFilters(resources) {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("");

  /**
   * Filter resources theo search query
   */
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchSearch =
        searchQuery === "" ||
        resource.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.recoveryEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [resources, searchQuery]);

  /**
   * Reset tất cả filters
   */
  const resetFilters = () => {
    setStatusFilter("");
    setSearchQuery("");
    setUserFilter("");
  };

  return {
    // Filter values
    statusFilter,
    searchQuery,
    userFilter,

    // Setters
    setStatusFilter,
    setSearchQuery,
    setUserFilter,

    // Filtered data
    filteredResources,

    // Utilities
    resetFilters,
  };
}

export default useResourceFilters;
