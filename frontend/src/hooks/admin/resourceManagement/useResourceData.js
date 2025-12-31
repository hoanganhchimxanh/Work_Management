import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để fetch resource data
 * @param {Object} filters - { statusFilter, userFilter }
 * @param {Function} getAuthConfig - Function to get auth config
 * @returns {Object} { resources, stats, users, channels, loading, error }
 */
function useResourceData(filters, getAuthConfig) {
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const { statusFilter, userFilter } = filters;

      const [resourcesRes, statsRes, usersRes, channelsRes] = await Promise.all(
        [
          axios.get(
            `${config.backendBase}/resource/get-all?status=${statusFilter}&assignedUser=${userFilter}`,
            getAuthConfig()
          ),
          axios.get(`${config.backendBase}/resource/stats`, getAuthConfig()),
          axios.get(`${config.backendBase}/user/get-all`, getAuthConfig()),
          axios.get(`${config.backendBase}/channel/get-all`, getAuthConfig()),
        ]
      );

      setResources(resourcesRes.data.data);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setChannels(channelsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.statusFilter, filters.userFilter]);

  return {
    resources,
    stats,
    users,
    channels,
    loading,
    error,
    setError,
    refetch: fetchData,
  };
}

export default useResourceData;
