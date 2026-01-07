import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ButtonGroup,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  CashStack,
  BroadcastPin,
  CheckCircleFill,
} from "react-bootstrap-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import config from "../../configs/api";

function EmployeeDashboard() {
  const [timeFilter, setTimeFilter] = useState("28days");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ownedChannels: 0,
    completedTasks: 0,
    completedKPI: 0,
  });
  const [chartData, setChartData] = useState([]);

  // Get token from localStorage
  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch {}
  }

  // Configure axios with auth header
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Calculate date ranges based on filter
  const getDateRange = (filter) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (filter) {
      case "7days":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "28days":
        startDate.setDate(endDate.getDate() - 28);
        break;
      case "90days":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "365days":
        startDate.setDate(endDate.getDate() - 365);
        break;
      case "lifetime":
        startDate = new Date("2020-01-01");
        break;
      default:
        startDate.setDate(endDate.getDate() - 28);
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  };

  // Format date for display
  const formatDateForChart = (dateString, filter) => {
    const date = new Date(dateString);

    if (filter === "365days" || filter === "lifetime") {
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        year: "numeric",
      });
    } else if (filter === "90days") {
      return date.toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        month: "numeric",
        day: "numeric",
      });
    }
  };

  // Aggregate data by period
  const aggregateDataByPeriod = (analytics, filter) => {
    if (!analytics || analytics.length === 0) return [];

    // Sort by date
    const sorted = [...analytics].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    /** =========================
     * DAILY (7days, 28days)
     * ========================= */
    if (filter === "7days" || filter === "28days") {
      // Bước 1: Gộp revenue theo ngày
      const dailyData = {};
      sorted.forEach((item) => {
        const dateKey = new Date(item.date).toISOString().split("T")[0];
        if (!dailyData[dateKey]) {
          dailyData[dateKey] = 0;
        }
        dailyData[dateKey] += item.estimatedRevenue || 0;
      });

      // Bước 2: Convert sang array cho chart
      return Object.entries(dailyData).map(([date, revenue]) => ({
        date: formatDateForChart(date, filter),
        revenue,
      }));
    }

    /** =========================
     * WEEKLY (90days)
     * ========================= */
    if (filter === "90days") {
      const weeklyData = {};

      sorted.forEach((item) => {
        const date = new Date(item.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Chủ nhật
        const weekKey = weekStart.toISOString().split("T")[0];

        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = 0;
        }
        weeklyData[weekKey] += item.estimatedRevenue || 0;
      });

      return Object.entries(weeklyData).map(([date, revenue]) => ({
        date: formatDateForChart(date, filter),
        revenue,
      }));
    }

    /** =========================
     * MONTHLY (365days, lifetime)
     * ========================= */
    const monthlyData = {};

    sorted.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }
      monthlyData[monthKey] += item.estimatedRevenue || 0;
    });

    return Object.entries(monthlyData).map(([month, revenue]) => ({
      date: formatDateForChart(`${month}-01`, filter),
      revenue,
    }));
  };

  // Fetch all data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(timeFilter);

      // Fetch user's channels
      const userResponse = await axios.get(
        `${config.backendBase}/user/get-one/${userId}`,
        axiosConfig
      );
      const userChannels = userResponse.data.data.channels || [];
      const ownedChannels = userChannels.length;

      // Fetch analytics for all user's channels
      let totalRevenue = 0;
      let allAnalytics = [];

      for (const channel of userChannels) {
        try {
          const analyticsResponse = await axios.get(
            `${config.backendBase}/youtube-analytics/get-analytics/${channel.channelId}`,
            {
              ...axiosConfig,
              params: { startDate, endDate },
            }
          );

          const channelAnalytics = analyticsResponse.data.data;
          totalRevenue += channelAnalytics.totals?.totalRevenue || 0;
          allAnalytics.push(...(channelAnalytics.analytics || []));
        } catch (err) {
          console.error(
            `Failed to fetch analytics for channel ${channel.channelId}:`,
            err
          );
        }
      }

      // Fetch user's tasks
      const tasksResponse = await axios.get(
        `${config.backendBase}/task/my-tasks`,
        axiosConfig
      );
      const completedTasks = tasksResponse.data.data.filter(
        (task) => task.status === "COMPLETED"
      ).length;

      // Dùng my-kpis-with-progress (chỉ trả về KPI của user hiện tại)
      const kpiResponse = await axios.get(
        `${config.backendBase}/kpi/my-kpis-with-progress`,
        axiosConfig
      );
      const userKPIs = kpiResponse.data.data || [];

      // Tính % KPI completion trung bình
      let avgKPICompletion = 0;
      if (userKPIs.length > 0) {
        const totalCompletion = userKPIs.reduce((sum, kpi) => {
          const revenueProgress = kpi.revenueProgress || 0;
          const bktProgress = kpi.bktProgress || 0;
          // Trung bình của 2 progress
          return sum + (revenueProgress + bktProgress) / 2;
        }, 0);

        avgKPICompletion = Math.round(totalCompletion / userKPIs.length);
      }

      // Aggregate chart data
      const aggregatedData = aggregateDataByPeriod(allAnalytics, timeFilter);

      setStats({
        totalRevenue: Number(totalRevenue.toFixed(2)),
        ownedChannels,
        completedTasks,
        completedKPI: avgKPICompletion,
      });
      setChartData(aggregatedData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatShortCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{label}</p>
          <p style={{ margin: 0, color: "#0d6efd" }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case "7days":
        return "7 ngày qua";
      case "28days":
        return "28 ngày qua";
      case "90days":
        return "90 ngày qua";
      case "365days":
        return "365 ngày qua";
      case "lifetime":
        return "Toàn thời gian";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <Container
        fluid
        className="p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Dashboard</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchDashboardData}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">Dashboard Nhân viên</h2>
          <p className="text-muted">Tổng quan hiệu suất cá nhân</p>
        </Col>
        <Col xs="auto">
          <ButtonGroup size="sm">
            <Button
              variant={timeFilter === "7days" ? "primary" : "outline-primary"}
              onClick={() => setTimeFilter("7days")}
            >
              7 ngày
            </Button>
            <Button
              variant={timeFilter === "28days" ? "primary" : "outline-primary"}
              onClick={() => setTimeFilter("28days")}
            >
              28 ngày
            </Button>
            <Button
              variant={timeFilter === "90days" ? "primary" : "outline-primary"}
              onClick={() => setTimeFilter("90days")}
            >
              90 ngày
            </Button>
            <Button
              variant={timeFilter === "365days" ? "primary" : "outline-primary"}
              onClick={() => setTimeFilter("365days")}
            >
              365 ngày
            </Button>
            <Button
              variant={
                timeFilter === "lifetime" ? "primary" : "outline-primary"
              }
              onClick={() => setTimeFilter("lifetime")}
            >
              Toàn thời gian
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Doanh thu kỳ này</p>
                  <h3 className="fw-bold mb-0">
                    {formatShortCurrency(stats.totalRevenue)}
                  </h3>
                </div>
                <div
                  className="bg-primary bg-opacity-10 p-3 rounded-3"
                  style={{ color: "#0d6efd" }}
                >
                  <CashStack size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Số kênh sở hữu</p>
                  <h3 className="fw-bold mb-0">{stats.ownedChannels}</h3>
                </div>
                <div
                  className="bg-success bg-opacity-10 p-3 rounded-3"
                  style={{ color: "#198754" }}
                >
                  <BroadcastPin size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Công việc hoàn thành</p>
                  <h3 className="fw-bold mb-0">{stats.completedTasks}</h3>
                </div>
                <div
                  className="bg-warning bg-opacity-10 p-3 rounded-3"
                  style={{ color: "#ffc107" }}
                >
                  <CheckCircleFill size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">KPI hoàn thành</p>
                  <h3 className="fw-bold mb-0">{stats.completedKPI}%</h3>
                </div>
                <div
                  className="bg-info bg-opacity-10 p-3 rounded-3"
                  style={{ color: "#0dcaf0" }}
                >
                  <CheckCircleFill size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-4">
                Doanh thu cá nhân ({getTimeFilterLabel()})
              </h5>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={chartData}
                    margin={{
                      right: 20,
                      left: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={formatShortCurrency}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke="#0d6efd"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>Không có dữ liệu doanh thu trong khoảng thời gian này</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeeDashboard;
