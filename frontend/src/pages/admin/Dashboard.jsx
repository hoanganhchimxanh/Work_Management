import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  ButtonGroup,
  Button,
} from "react-bootstrap";

import Overview from "../../components/admin/dashboard/Overview";
import TopRanking from "../../components/admin/dashboard/TopRanking";

import config from "../../configs/api";

function Dashboard() {
  // Date filter state - CHANGED: Mặc định là 7 ngày
  const [dateRange, setDateRange] = useState("7");

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

  // Calculate date range based on selection
  const getDateParams = () => {
    const endDate = new Date();
    let startDate;

    if (dateRange === "lifetime") {
      startDate = new Date("2015-01-01");
    } else {
      const days = parseInt(dateRange);
      startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Fetch Dashboard Statistics
  const fetchDashboardStats = async () => {
    try {
      const { startDate, endDate } = getDateParams();
      const response = await fetch(
        `${config.backendBase}/dashboard/stats?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

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

  // Fetch Daily Revenue Data
  const fetchRevenueData = async () => {
    try {
      const { startDate, endDate } = getDateParams();
      const response = await fetch(
        `${config.backendBase}/dashboard/revenue-by-day?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        const formattedData = formatRevenueData(data.data);
        setRevenueData(formattedData);
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
    }
  };

  // Format revenue data based on date range
  const formatRevenueData = (data) => {
    if (dateRange === "7" || dateRange === "28") {
      return data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        revenue: item.revenue || 0,
      }));
    } else if (dateRange === "90") {
      const weeklyData = {};
      data.forEach((item) => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = 0;
        }
        weeklyData[weekKey] += item.revenue || 0;
      });

      return Object.entries(weeklyData).map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        }),
        revenue,
      }));
    } else {
      const monthlyData = {};
      data.forEach((item) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += item.revenue || 0;
      });

      return Object.entries(monthlyData)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, revenue]) => ({
          date: `T${parseInt(month.split("-")[1])}/${month.split("-")[0]}`,
          revenue,
        }));
    }
  };

  // Fetch Top Employees
  const fetchTopEmployees = async () => {
    try {
      const { startDate, endDate } = getDateParams();
      const response = await fetch(
        `${config.backendBase}/dashboard/top-employees?limit=5&startDate=${startDate}&endDate=${endDate}`,
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
      const { startDate, endDate } = getDateParams();
      const response = await fetch(
        `${config.backendBase}/dashboard/top-teams?limit=5&startDate=${startDate}&endDate=${endDate}`,
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
      const { startDate, endDate } = getDateParams();
      const response = await fetch(
        `${config.backendBase}/dashboard/top-channels?limit=5&startDate=${startDate}&endDate=${endDate}`,
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

  // Load all data when dateRange changes
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
  }, [dateRange]);

  // CHANGED: Format với 2 số thập phân
  const formatCurrency = (value) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
    return `$${formatted}`;
  };

  // CHANGED: Format short currency với 2 số thập phân
  const formatShortCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
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

      {/* Date Range Filter */}
      <Row className="mb-4">
        <Col>
          <ButtonGroup>
            <Button
              variant={dateRange === "7" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("7")}
            >
              7 ngày
            </Button>
            <Button
              variant={dateRange === "28" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("28")}
            >
              28 ngày
            </Button>
            <Button
              variant={dateRange === "90" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("90")}
            >
              90 ngày
            </Button>
            <Button
              variant={dateRange === "365" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("365")}
            >
              365 ngày
            </Button>
            <Button
              variant={dateRange === "lifetime" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("lifetime")}
            >
              Toàn thời gian
            </Button>
          </ButtonGroup>
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
        dateRange={dateRange}
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
