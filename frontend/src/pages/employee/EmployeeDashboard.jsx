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

function EmployeeDashboard() {
  const [timeFilter, setTimeFilter] = useState("lifetime");

  // Fake data theo các khoảng thời gian (USD)
  const dataByPeriod = {
    "7days": [
      { date: "12/13", revenue: 8500 },
      { date: "12/14", revenue: 9200 },
      { date: "12/15", revenue: 7800 },
      { date: "12/16", revenue: 11000 },
      { date: "12/17", revenue: 9500 },
      { date: "12/18", revenue: 10200 },
      { date: "12/19", revenue: 11800 },
    ],
    "28days": [
      { date: "11/22", revenue: 7800 },
      { date: "11/29", revenue: 9200 },
      { date: "12/06", revenue: 10500 },
      { date: "12/13", revenue: 11800 },
      { date: "12/19", revenue: 12200 },
    ],
    "90days": [
      { date: "Sep", revenue: 28500 },
      { date: "Oct", revenue: 31200 },
      { date: "Nov", revenue: 29800 },
      { date: "Dec", revenue: 33500 },
    ],
    "365days": [
      { month: "Jan", revenue: 9500 },
      { month: "Feb", revenue: 8800 },
      { month: "Mar", revenue: 10200 },
      { month: "Apr", revenue: 11500 },
      { month: "May", revenue: 10800 },
      { month: "Jun", revenue: 12500 },
      { month: "Jul", revenue: 13200 },
      { month: "Aug", revenue: 13800 },
      { month: "Sep", revenue: 14200 },
      { month: "Oct", revenue: 14500 },
      { month: "Nov", revenue: 13800 },
      { month: "Dec", revenue: 14200 },
    ],
    lifetime: [
      { month: "2021", revenue: 5200 },
      { month: "2022", revenue: 8800 },
      { month: "2023", revenue: 11200 },
      { month: "2024", revenue: 12800 },
      { month: "2025", revenue: 14200 },
    ],
  };

  const currentData = dataByPeriod[timeFilter];

  // Doanh thu tháng hiện tại (USD) - thay đổi theo filter
  const revenueThisPeriod =
    timeFilter === "7days"
      ? 77000
      : timeFilter === "28days"
      ? 315000
      : timeFilter === "90days"
      ? 1230000
      : timeFilter === "365days"
      ? 1420000
      : 1420000; // lifetime

  const stats = {
    totalRevenueThisPeriod: revenueThisPeriod,
    ownedChannels: 8,
    completedTasks: timeFilter === "lifetime" ? 528 : 42,
    completedKPI: timeFilter === "lifetime" ? 92 : 87,
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
                    {formatShortCurrency(stats.totalRevenueThisPeriod)}
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
                Doanh thu cá nhân (
                {timeFilter === "lifetime"
                  ? "Toàn thời gian"
                  : timeFilter === "365days"
                  ? "Năm 2025"
                  : "Gần đây"}
                )
              </h5>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={
                      timeFilter === "7days"
                        ? "date"
                        : timeFilter === "28days"
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
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeeDashboard;
