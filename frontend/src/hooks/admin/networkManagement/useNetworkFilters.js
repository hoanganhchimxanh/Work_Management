import { useState, useMemo } from "react";

/**
 * Custom hook để quản lý network filters
 * @param {Array} networks - Danh sách networks
 * @returns {Object} { filters, serverFilters, clientFilters, filteredNetworks, handlers }
 */
function useNetworkFilters(networks) {
  // Server-side filters (gửi lên API)
  const [status, setStatus] = useState("");
  const [location, setLocation] = useState("");

  // Client-side filter (filter ở frontend)
  const [search, setSearch] = useState("");

  /**
   * Filter networks theo search query (client-side)
   */
  const filteredNetworks = useMemo(() => {
    if (!search) return networks;

    const keyword = search.toLowerCase();

    return networks.filter((network) => {
      return (
        network.pubId?.toLowerCase().includes(keyword) ||
        network.profileAdsenseId?.toLowerCase().includes(keyword) ||
        network.emailAddress?.toLowerCase().includes(keyword) ||
        network.employment?.toLowerCase().includes(keyword)
      );
    });
  }, [networks, search]);

  /**
   * Update filter value
   */
  const handleFilterChange = (field, value) => {
    switch (field) {
      case "search":
        setSearch(value);
        break;
      case "status":
        setStatus(value);
        break;
      case "location":
        setLocation(value);
        break;
      default:
        break;
    }
  };

  /**
   * Reset all filters
   */
  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setLocation("");
  };

  return {
    // All filters combined (for backward compatibility)
    filters: {
      search,
      status,
      location,
    },

    // Server-side filters (for API)
    serverFilters: {
      status,
      location,
    },

    // Client-side filters
    clientFilters: {
      search,
    },

    // Filtered data
    filteredNetworks,

    // Handlers
    handleFilterChange,
    setSearch,
    setStatus,
    setLocation,
    resetFilters,
  };
}

export default useNetworkFilters;
