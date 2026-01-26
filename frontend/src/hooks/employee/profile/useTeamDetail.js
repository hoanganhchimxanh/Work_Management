import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

/**
 * Custom hook để lấy chi tiết team
 * @param {string} teamId - ID của team
 * @param {string} token - JWT token
 * @param {boolean} shouldFetch - Flag để quyết định có fetch hay không (dùng cho modal)
 * @returns {Object} { team, loading, error, refetch }
 */
function useTeamDetail(teamId, token, shouldFetch = true) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTeam = async () => {
    if (!teamId || !token || !shouldFetch) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${config.backendBase}/team/get-team/${teamId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setTeam(res.data.data);
    } catch (err) {
      console.error("Error fetching team:", err);
      setError(err.response?.data?.message || "Không thể tải thông tin nhóm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [teamId, token, shouldFetch]);

  return {
    team,
    loading,
    error,
    refetch: fetchTeam,
  };
}

export default useTeamDetail;
