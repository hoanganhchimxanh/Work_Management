import { useState, useMemo } from "react";

/**
 * Custom hook để quản lý filters và search
 * @param {Array} resources - Danh sách resources
 * @param {String} statusFilter - Filter theo status
 * @param {String} userFilter - Filter theo user
 * @returns {Object} { filters, setters, filteredResources }
 */
function useResourceFilters(resources, statusFilter = "", userFilter = "") {
  const [searchQuery, setSearchQuery] = useState("");

  /**
   * Filter resources theo tất cả các điều kiện
   */
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // 1. Filter theo search query (email hoặc recovery email)
      const matchSearch =
        searchQuery === "" ||
        resource.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.recoveryEmail
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      // 2. Filter theo status
      const matchStatus =
        statusFilter === "" || resource.status === statusFilter;

      // 3. Filter theo user
      const matchUser =
        userFilter === "" ||
        resource.assignedUser?._id === userFilter ||
        resource.assignedUser?.userId === userFilter;

      // Phải thỏa mãn tất cả các điều kiện
      return matchSearch && matchStatus && matchUser;
    });
  }, [resources, searchQuery, statusFilter, userFilter]);

  /**
   * Reset search query
   */
  const resetSearch = () => {
    setSearchQuery("");
  };

  return {
    // Search value
    searchQuery,

    // Setter
    setSearchQuery,

    // Filtered data
    filteredResources,

    // Utilities
    resetSearch,
  };
}

export default useResourceFilters;
