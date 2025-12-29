import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để fetch KPIs, Tasks, Users và Teams data
 * @param {Function} getAuthConfig - Function to get auth config
 * @returns {Object} { kpis, tasks, users, teams, loading, error, refetch }
 */
function useKPITaskData(getAuthConfig) {
  const [kpis, setKPIs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const [loadingKPIs, setLoadingKPIs] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [error, setError] = useState(null);

  /**
   * Fetch KPIs with progress
   */
  const fetchKPIs = async () => {
    try {
      setLoadingKPIs(true);
      const response = await axios.get(
        `${config.backendBase}/kpi/get-all-with-progress`,
        getAuthConfig()
      );
      setKPIs(response.data.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách KPI");
      console.error("Error fetching KPIs:", err);
    } finally {
      setLoadingKPIs(false);
    }
  };

  /**
   * Fetch Tasks
   */
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await axios.get(
        `${config.backendBase}/task/get-all`,
        getAuthConfig()
      );
      setTasks(response.data.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách công việc");
      console.error("Error fetching tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  /**
   * Fetch Users
   */
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get(
        `${config.backendBase}/user/get-all`,
        getAuthConfig()
      );

      // Normalize users data (userId -> _id)
      const normalizedUsers = response.data.data.map((user) => ({
        ...user,
        _id: user.userId,
      }));

      setUsers(normalizedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  /**
   * Fetch Teams
   */
  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await axios.get(
        `${config.backendBase}/team/get-all-team`,
        getAuthConfig()
      );
      setTeams(response.data.data);
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setLoadingTeams(false);
    }
  };

  /**
   * Fetch all data in parallel
   */
  const fetchAll = async () => {
    await Promise.all([fetchKPIs(), fetchTasks(), fetchUsers(), fetchTeams()]);
  };

  /**
   * Initial load - CHỈ CHẠY 1 LẦN
   */
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // Data
    kpis,
    tasks,
    users,
    teams,

    // Loading states
    loading: loadingKPIs || loadingTasks || loadingUsers || loadingTeams,
    loadingKPIs,
    loadingTasks,
    loadingUsers,
    loadingTeams,

    // Error
    error,
    setError,

    // Refetch functions
    refetchKPIs: fetchKPIs,
    refetchTasks: fetchTasks,
    refetchUsers: fetchUsers,
    refetchTeams: fetchTeams,
    refetchAll: fetchAll,
  };
}

export default useKPITaskData;
