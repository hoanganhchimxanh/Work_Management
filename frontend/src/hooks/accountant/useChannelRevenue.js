import { useState, useEffect, useCallback } from "react";
import axios from "axios";

/**
 * Custom hook for Channel Revenue logic
 * @param {string} employeeId - ID of the employee
 * @param {string} month - selected month (MM)
 * @param {string} year - selected year (YYYY)
 * @returns {Object} { employeeInfo, channels, loading, error, setError, totals, refetch }
 */
function useChannelRevenue(employeeId, month, year) {
    const [employeeInfo, setEmployeeInfo] = useState(null);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEmployeeChannelsRevenue = useCallback(async () => {
        if (!employeeId) return;

        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem("token");
            const monthQuery = `${year}-${month}`;

            // 1. Fetch employee info
            const userResponse = await axios.get(
                `http://localhost:9999/user/get-one/${employeeId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            setEmployeeInfo(userResponse.data.data);

            // 2. Fetch all channels for employee
            const channelsResponse = await axios.get(
                `http://localhost:9999/channel/by-owner/${employeeId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
            const userChannels = channelsResponse.data.data;

            // 3. Fetch revenue for each channel
            const channelsWithRevenue = await Promise.all(
                userChannels.map(async (channel) => {
                    try {
                        const revenueResponse = await axios.get(
                            `http://localhost:9999/channel-revenue/${channel._id}/monthly`,
                            {
                                headers: { Authorization: `Bearer ${token}` },
                                params: {
                                    startMonth: monthQuery,
                                    endMonth: monthQuery,
                                },
                            },
                        );

                        const revenueData = revenueResponse.data.data;
                        const monthRevenue = revenueData.revenues[0] || null;

                        return {
                            ...channel,
                            estimatedRevenue: monthRevenue?.estimatedRevenue || 0,
                            actualRevenue: monthRevenue?.actualRevenue || 0,
                            locked: monthRevenue?.locked || false,
                            revenueId: monthRevenue?._id || null,
                            hasNetwork: !!channel.network,
                            networkName: channel.network?.name || null,
                        };
                    } catch (err) {
                        console.error(`Error fetching revenue for channel ${channel._id}:`, err);
                        return {
                            ...channel,
                            estimatedRevenue: 0,
                            actualRevenue: 0,
                            locked: false,
                            revenueId: null,
                            hasNetwork: !!channel.network,
                            networkName: channel.network?.name || null,
                        };
                    }
                }),
            );

            setChannels(channelsWithRevenue);
        } catch (err) {
            console.error("Error fetching employee channels revenue:", err);
            setError(
                err.response?.data?.message || "Không thể tải dữ liệu. Vui lòng thử lại.",
            );
        } finally {
            setLoading(false);
        }
    }, [employeeId, month, year]);

    useEffect(() => {
        fetchEmployeeChannelsRevenue();
    }, [fetchEmployeeChannelsRevenue]);

    // Calculate totals
    const totalEstimated = channels.reduce((sum, ch) => sum + ch.estimatedRevenue, 0);
    const totalActual = channels.reduce((sum, ch) => sum + ch.actualRevenue, 0);

    return {
        employeeInfo,
        channels,
        loading,
        error,
        setError,
        totals: {
            totalEstimated,
            totalActual,
        },
        refetch: fetchEmployeeChannelsRevenue,
    };
}

export default useChannelRevenue;
