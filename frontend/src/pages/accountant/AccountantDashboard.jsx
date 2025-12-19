import React from "react";
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
  ResponsiveContainer,
} from "recharts";
import {
  CashStack,
  PeopleFill,
  BroadcastPin,
  Diagram3Fill,
} from "react-bootstrap-icons";

// Fake data giống admin
const stats = {
  totalRevenue: 12500000000, // 12.5 tỷ
  totalEmployees: 156,
  totalChannels: 42,
  activeNetworks: 38,
};

const revenueData = [
  { month: "T1", revenue: 8500000000 },
  { month: "T2", revenue: 9200000000 },
  { month: "T3", revenue: 8800000000 },
  { month: "T4", revenue: 10500000000 },
  { month: "T5", revenue: 9800000000 },
  { month: "T6", revenue: 11200000000 },
  { month: "T7", revenue: 11800000000 },
  { month: "T8", revenue: 12500000000 },
  { month: "T9", revenue: 12000000000 },
  { month: "T10", revenue: 12200000000 },
  { month: "T11", revenue: 11900000000 },
  { month: "T12", revenue: 12500000000 },
];

const topEmployees = [
  { name: "Nguyễn Văn A", revenue: 1850000000 },
  { name: "Trần Thị B", revenue: 1720000000 },
  { name: "Lê Văn C", revenue: 1580000000 },
  { name: "Phạm Thị D", revenue: 1450000000 },
  { name: "Hoàng Văn E", revenue: 1320000000 },
];

const topTeams = [
  { name: "Team Alpha", revenue: 4200000000 },
  { name: "Team Beta", revenue: 3800000000 },
  { name: "Team Gamma", revenue: 3500000000 },
  { name: "Team Delta", revenue: 3100000000 },
  { name: "Team Omega", revenue: 2800000000 },
];

const topChannels = [
  { name: "Kênh Facebook Premium", revenue: 5100000000 },
  { name: "Kênh TikTok Pro", revenue: 4800000000 },
  { name: "Kênh YouTube Gold", revenue: 4200000000 },
  { name: "Kênh Zalo OA", revenue: 3500000000 },
  { name: "Kênh Shopee Affiliate", revenue: 3100000000 },
];

function AccountantDashboard() {
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
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Dashboard Kế toán</h2>
          <p className="text-muted">
            Tổng quan hoạt động kinh doanh toàn công ty
          </p>
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

      {/* Top Ranking */}
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
                    interval={0}
                    height={80}
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

export default AccountantDashboard;
