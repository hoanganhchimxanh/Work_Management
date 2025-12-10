import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CashStack,
  PeopleFill,
  BroadcastPin,
  Diagram3Fill,
} from "react-bootstrap-icons";

function Dashboard() {
  // Mock data - thay thế bằng API call thực tế
  const [stats, setStats] = useState({
    totalRevenue: 2450000000,
    totalEmployees: 156,
    totalChannels: 89,
    activeNetworks: 12,
  });

  // Dữ liệu doanh thu theo tháng
  const revenueData = [
    { month: "T1", revenue: 180000000 },
    { month: "T2", revenue: 195000000 },
    { month: "T3", revenue: 210000000 },
    { month: "T4", revenue: 198000000 },
    { month: "T5", revenue: 225000000 },
    { month: "T6", revenue: 240000000 },
    { month: "T7", revenue: 235000000 },
    { month: "T8", revenue: 258000000 },
    { month: "T9", revenue: 270000000 },
    { month: "T10", revenue: 285000000 },
    { month: "T11", revenue: 295000000 },
    { month: "T12", revenue: 310000000 },
  ];

  // Top 5 nhân viên
  const topEmployees = [
    { name: "Nguyễn Văn A", revenue: 85000000 },
    { name: "Trần Thị B", revenue: 78000000 },
    { name: "Lê Văn C", revenue: 72000000 },
    { name: "Phạm Thị D", revenue: 68000000 },
    { name: "Hoàng Văn E", revenue: 65000000 },
  ];

  // Top 5 team
  const topTeams = [
    { name: "Team Marketing", revenue: 450000000 },
    { name: "Team Sales", revenue: 420000000 },
    { name: "Team Digital", revenue: 380000000 },
    { name: "Team Content", revenue: 350000000 },
    { name: "Team Operations", revenue: 320000000 },
  ];

  // Top 5 kênh
  const topChannels = [
    { name: "Facebook Ads", revenue: 520000000 },
    { name: "Google Ads", revenue: 480000000 },
    { name: "TikTok Ads", revenue: 425000000 },
    { name: "Instagram", revenue: 380000000 },
    { name: "YouTube", revenue: 350000000 },
  ];

  // Format tiền VND
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Format số rút gọn cho biểu đồ
  const formatShortCurrency = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    }
    return value;
  };

  // Custom tooltip cho biểu đồ
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
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted">Tổng quan hoạt động kinh doanh</p>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1">Tổng doanh thu tháng</p>
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

      {/* Revenue Line Chart */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h5 className="fw-bold mb-4">Tăng trưởng doanh thu theo tháng</h5>
              <ResponsiveContainer width="100%" height={350}>
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

      {/* Top 5 Charts */}
      <Row className="g-4">
        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-4">
                Top 5 Nhân viên - Doanh thu cao nhất
              </h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topEmployees}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickFormatter={formatShortCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#0d6efd" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-4">Top 5 Team - Doanh thu cao nhất</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topTeams}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickFormatter={formatShortCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#198754" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <h6 className="fw-bold mb-4">Top 5 Kênh - Doanh thu cao nhất</h6>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topChannels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickFormatter={formatShortCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#ffc107" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
