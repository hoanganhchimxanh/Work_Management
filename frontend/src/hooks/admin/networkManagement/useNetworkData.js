import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để fetch network data
 * @param {Object} serverFilters - Server-side filters { status, location, country }
 * @param {Function} getAuthConfig - Function to get auth config
 * @returns {Object} { networks, loading, error, refetch }
 */
function useNetworkData(serverFilters, getAuthConfig) {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch networks với filters
   */
  const fetchNetworks = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {};
      if (serverFilters.status) params.status = serverFilters.status;
      if (serverFilters.location) params.location = serverFilters.location;
      if (serverFilters.country) params.country = serverFilters.country;

      const { data } = await axios.get(
        `${config.backendBase}/network/get-all`,
        {
          params,
          ...getAuthConfig(),
        }
      );

      if (data.success) {
        setNetworks(data.data);
      } else {
        setError("Lỗi khi tải dữ liệu networks");
      }
    } catch (err) {
      console.error("Fetch networks error:", err);
      setError("Lỗi khi tải dữ liệu networks");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refetch khi server filters thay đổi
   */
  useEffect(() => {
    fetchNetworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverFilters.status, serverFilters.location, serverFilters.country]);

  return {
    // Data
    networks,

    // Loading & Error
    loading,
    error,
    setError,

    // Refetch
    refetch: fetchNetworks,
  };
}

export default useNetworkData;
