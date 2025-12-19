// src/pages/EmployeeDashboard.jsx
import React from "react";
import { Container, Row, Col, Card, Spinner, Table } from "react-bootstrap";
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
  Legend,
  ResponsiveContainer,
} from "recharts";

function EmployeeDashboard() {
  // Fake data
  const stats = {
    totalRevenueThisMonth: 285000000, // ~285M VND
    ownedChannels: 8,
    completedTasks: 42,
    completedKPI: 87, // %
  };

  const revenueData = [
    { month: "T1", revenue: 120000000 },
    { month: "T2", revenue: 180000000 },
    { month: "T3", revenue: 150000000 },
    { month: "T4", revenue: 220000000 },
    { month: "T5", revenue: 195000000 },
    { month: "T6", revenue: 260000000 },
    { month: "T7", revenue: 280000000 },
    { month: "T8", revenue: 310000000 },
    { month: "T9", revenue: 290000000 },
    { month: "T10", revenue: 305000000 },
    { month: "T11", revenue: 270000000 },
    { month: "T12", revenue: 285000000 },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);

  const formatShortCurrency = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)} tỷ`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)} tr`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(0)} nghìn`;
    return value;
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
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Dashboard Nhân viên</h2>
          <p className="text-muted">Tổng quan hiệu suất cá nhân</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Doanh thu tháng này</p>
                  <h3 className="fw-bold mb-0">
                    {formatShortCurrency(stats.totalRevenueThisMonth)}
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
                Doanh thu cá nhân theo tháng (năm 2025)
              </h5>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatShortCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
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
