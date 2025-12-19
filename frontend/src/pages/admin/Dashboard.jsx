import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";

import Overview from "../../components/admin/dashboard/Overview";
import TopRanking from "../../components/admin/dashboard/TopRanking";

import config from "../../configs/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalEmployees: 0,
    totalChannels: 0,
    activeNetworks: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [topTeams, setTopTeams] = useState([]);
  const [topChannels, setTopChannels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("token") || "";
  };

  // Fetch Dashboard Statistics
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${config.backendBase}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setStats({
          totalRevenue: data.data.totalRevenue || 0,
          totalEmployees: data.data.totalEmployees || 0,
          totalChannels: data.data.totalChannels || 0,
          activeNetworks: data.data.activeNetworks || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError("Không thể tải thống kê tổng quan");
    }
  };

  // Fetch Monthly Revenue Data
  const fetchRevenueData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${config.backendBase}/dashboard/revenue-by-month?year=${currentYear}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        // Format data for chart
        const formattedData = data.data.map((item) => ({
          month: `T${item.month}`,
          revenue: item.revenue || 0,
        }));
        setRevenueData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };

  // Fetch Top Employees
  const fetchTopEmployees = async () => {
    try {
      const response = await fetch(
        `${config.backendBase}/dashboard/top-employees?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTopEmployees(
          data.data.map((item) => ({
            name: item.fullName || item.name,
            revenue: item.totalRevenue || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching top employees:", error);
    }
  };

  // Fetch Top Teams
  const fetchTopTeams = async () => {
    try {
      const response = await fetch(
        `${config.backendBase}/dashboard/top-teams?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTopTeams(
          data.data.map((item) => ({
            name: item.teamName || item.name,
            revenue: item.totalRevenue || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching top teams:", error);
    }
  };

  // Fetch Top Channels
  const fetchTopChannels = async () => {
    try {
      const response = await fetch(
        `${config.backendBase}/dashboard/top-channels?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTopChannels(
          data.data.map((item) => ({
            name: item.channelName || item.name,
            revenue: item.totalRevenue || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching top channels:", error);
    }
  };

  // Load all data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchRevenueData(),
          fetchTopEmployees(),
          fetchTopTeams(),
          fetchTopChannels(),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError("Có lỗi xảy ra khi tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatShortCurrency = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return value;
  };

  if (loading) {
    return (
      <Container
        fluid
        className="p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted">Tổng quan hoạt động kinh doanh</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Overview
        stats={stats}
        revenueData={revenueData}
        formatCurrency={formatCurrency}
        formatShortCurrency={formatShortCurrency}
      />

      <TopRanking
        topEmployees={topEmployees}
        topTeams={topTeams}
        topChannels={topChannels}
        formatCurrency={formatCurrency}
        formatShortCurrency={formatShortCurrency}
      />
    </Container>
  );
}

export default Dashboard;
