import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để quản lý KPIs của user với progress
 * @param {string} token - JWT token
 * @returns {Object} { kpis, loading, error, refetch }
 */
function useMyKPIs(token) {
  const [kpis, setKPIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKPIs = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${config.backendBase}/kpi/my-kpis-with-progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setKPIs(response.data.data);
    } catch (err) {
      console.error("Error fetching KPIs:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách KPI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, [token]);

  return {
    kpis,
    loading,
    error,
    refetch: fetchKPIs,
  };
}

export default useMyKPIs;
