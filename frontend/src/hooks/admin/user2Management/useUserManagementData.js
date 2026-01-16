import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để fetch users và teams data
 * @param {Function} getAuthConfig - Function to get auth config
 * @returns {Object} { users, teams, loading, error, refetch }
 */
function useUserManagementData(getAuthConfig) {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch users
   */
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(
        `${config.backendBase}/user2/get-all`,
        getAuthConfig()
      );
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách người dùng");
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  /**
   * Fetch teams
   */
  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await axios.get(
        `${config.backendBase}/team/get-all-team`,
        getAuthConfig()
      );
      setTeams(response.data.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách đội nhóm");
      console.error("Error fetching teams:", err);
    } finally {
      setLoadingTeams(false);
    }
  };

  /**
   * Fetch both users and teams in parallel
   */
  const fetchAll = async () => {
    await Promise.all([fetchUsers(), fetchTeams()]);
  };

  /**
   * Initial load - CHỈ CHẠY 1 LẦN
   */
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = chỉ chạy khi mount

  return {
    // Data
    users,
    teams,

    // Loading states
    loading: loadingUsers || loadingTeams,
    loadingUsers,
    loadingTeams,

    // Error
    error,
    setError,

    // Refetch functions
    refetchUsers: fetchUsers,
    refetchTeams: fetchTeams,
    refetchAll: fetchAll,
  };
}

export default useUserManagementData;
