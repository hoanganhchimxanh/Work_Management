// src/pages/AccountantDashboard.jsx
import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  ButtonGroup,
  Button,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CashStack,
  PeopleFill,
  BroadcastPin,
  Diagram3Fill,
} from "react-bootstrap-icons";

function AccountantDashboard() {
  const [timeFilter, setTimeFilter] = useState("lifetime");

  // Fake data toàn công ty theo thời gian (USD)
  const revenueDataByPeriod = {
    "7days": [
      { date: "12/13", revenue: 420000 },
      { date: "12/14", revenue: 485000 },
      { date: "12/15", revenue: 410000 },
      { date: "12/16", revenue: 520000 },
      { date: "12/17", revenue: 480000 },
      { date: "12/18", revenue: 510000 },
      { date: "12/19", revenue: 535000 },
    ],
    "28days": [
      { date: "11/22", revenue: 420000 },
      { date: "11/29", revenue: 465000 },
      { date: "12/06", revenue: 490000 },
      { date: "12/13", revenue: 510000 },
      { date: "12/19", revenue: 535000 },
    ],
    "90days": [
      { month: "Sep", revenue: 480000 },
      { month: "Oct", revenue: 510000 },
      { month: "Nov", revenue: 495000 },
      { month: "Dec", revenue: 535000 },
    ],
    "365days": [
      { month: "Jan", revenue: 380000 },
      { month: "Feb", revenue: 410000 },
      { month: "Mar", revenue: 425000 },
      { month: "Apr", revenue: 460000 },
      { month: "May", revenue: 445000 },
      { month: "Jun", revenue: 490000 },
      { month: "Jul", revenue: 510000 },
      { month: "Aug", revenue: 520000 },
      { month: "Sep", revenue: 505000 },
      { month: "Oct", revenue: 515000 },
      { month: "Nov", revenue: 500000 },
      { month: "Dec", revenue: 535000 },
    ],
    lifetime: [
      { year: "2021", revenue: 280000 },
      { year: "2022", revenue: 380000 },
      { year: "2023", revenue: 445000 },
      { year: "2024", revenue: 490000 },
      { year: "2025", revenue: 535000 },
    ],
  };

  const topEmployees = [
    { name: "John Smith", revenue: 78000 },
    { name: "Emma Wilson", revenue: 72000 },
    { name: "Michael Chen", revenue: 68000 },
    { name: "Sarah Davis", revenue: 62000 },
    { name: "David Lee", revenue: 58000 },
  ];

  const topTeams = [
    { name: "Team Alpha", revenue: 185000 },
    { name: "Team Beta", revenue: 168000 },
    { name: "Team Gamma", revenue: 152000 },
    { name: "Team Delta", revenue: 138000 },
    { name: "Team Omega", revenue: 125000 },
  ];

  const topChannels = [
    { name: "Facebook Premium", revenue: 220000 },
    { name: "TikTok Pro", revenue: 198000 },
    { name: "YouTube Gold", revenue: 175000 },
    { name: "Zalo OA", revenue: 148000 },
    { name: "Shopee Affiliate", revenue: 132000 },
  ];

  const totalRevenueThisPeriod =
    timeFilter === "7days"
      ? 3360000
      : timeFilter === "28days"
      ? 13200000
      : timeFilter === "90days"
      ? 45000000
      : timeFilter === "365days"
      ? 535000
      : 535000; // monthly avg for year & lifetime

  const stats = {
    totalRevenue: totalRevenueThisPeriod,
    totalEmployees: 156,
    totalChannels: 42,
    activeNetworks: 38,
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatShortCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }) =>
    active && payload && payload.length ? (
      <div
        style={{
          background: "#fff",
          padding: 10,
          border: "1px solid #ddd",
          borderRadius: 4,
        }}
      >
        <strong>{label}</strong>
        <p className="m-0">{formatCurrency(payload[0].value)}</p>
      </div>
    ) : null;

  return (
    <Container fluid className="p-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="fw-bold">Dashboard Kế toán</h2>
          <p className="text-muted">
            Tổng quan hoạt động kinh doanh toàn công ty
          </p>
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
                  <p className="text-muted mb-1">Tổng doanh thu kỳ này</p>
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
        {/* Các card còn lại giữ nguyên */}
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Số nhân viên</p>
                  <h3 className="fw-bold mb-0">{stats.totalEmployees}</h3>
                </div>
                <div
                  className="bg-success bg-opacity-10 p-3 rounded-3"
                  style={{ color: "#198754" }}
                >
                  <PeopleFill size={24} />
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
                  <p className="text-muted mb-1">Số kênh BKT</p>
                  <h3 className="fw-bold mb-0">{stats.totalChannels}</h3>
                </div>
                <div
                  className="bg-warning bg-opacity-10 p-3 rounded-3"
                  style={{ color: "#ffc107" }}
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
                  <p className="text-muted mb-1">Network hoạt động</p>
                  <h3 className="fw-bold mb-0">{stats.activeNetworks}</h3>
                </div>
                <div
                  className="bg-info bg-opacity-10 p-3 rounded-3"
                  style={{ color: "#0dcaf0" }}
                >
                  <Diagram3Fill size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Revenue Chart */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-4">Tăng trưởng doanh thu</h5>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueDataByPeriod[timeFilter]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={
                      timeFilter === "lifetime"
                        ? "year"
                        : timeFilter.includes("days")
                        ? "date"
                        : "month"
                    }
                  />
                  <YAxis tickFormatter={formatShortCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Doanh thu"
                    stroke="#0d6efd"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Top Ranking - giữ nguyên vì không phụ thuộc thời gian */}
      <Row className="g-4">
        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-4">Top 5 Nhân viên</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topEmployees}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                    height={80}
                  />
                  <YAxis tickFormatter={formatShortCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#0d6efd" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-4">Top 5 Team</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topTeams}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis tickFormatter={formatShortCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#198754" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-4">Top 5 Kênh</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topChannels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis tickFormatter={formatShortCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#ffc107" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AccountantDashboard;
