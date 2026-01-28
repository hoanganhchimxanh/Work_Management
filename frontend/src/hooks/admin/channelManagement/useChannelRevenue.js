// hooks/admin/channelManagement/useChannelRevenue.js
import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

export const useChannelRevenue = (channelId, show) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [revenues, setRevenues] = useState([]);
  const [totals, setTotals] = useState({
    totalEstimated: 0,
    totalActual: 0,
    totalUsRevenue: 0,
    totalNonUsRevenue: 0,
  });

  const getToken = () => localStorage.getItem("token");

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      const response = await axios.get(
        `${config.backendBase}/channel-revenue/${channelId}/monthly`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setChannelData(response.data.data.channel);
      setRevenues(response.data.data.revenues);
      setTotals(response.data.data.totals);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && channelId) {
      fetchRevenueData();
    }
  }, [show, channelId]);

  return {
    loading,
    error,
    channelData,
    revenues,
    totals,
    setRevenues,
    fetchRevenueData,
  };
};
