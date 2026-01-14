// src/components/Dashboard/Overview.jsx
import React from "react";
import { Row, Col, Card } from "react-bootstrap";
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
import {
  CashStack,
  PeopleFill,
  BroadcastPin,
  Diagram3Fill,
  ExclamationCircle,
} from "react-bootstrap-icons";

function Overview({
  stats,
  revenueData,
  formatShortCurrency,
  formatCurrency,
  dateRange,
}) {
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

  const getChartTitle = () => {
    switch (dateRange) {
      case "7":
        return "Tăng trưởng doanh thu 7 ngày gần nhất";
      case "28":
        return "Tăng trưởng doanh thu 28 ngày gần nhất";
      case "90":
        return "Tăng trưởng doanh thu theo tuần (90 ngày)";
      case "365":
        return "Tăng trưởng doanh thu theo tháng (365 ngày)";
      case "lifetime":
        return "Tăng trưởng doanh thu toàn thời gian";
      default:
        return "Tăng trưởng doanh thu";
    }
  };

  const getPeriodLabel = () => {
    switch (dateRange) {
      case "7":
        return "7 ngày qua";
      case "28":
        return "28 ngày qua";
      case "90":
        return "90 ngày qua";
      case "365":
        return "365 ngày qua";
      case "lifetime":
        return "Toàn thời gian";
      default:
        return "";
    }
  };

  // Kiểm tra xem có dữ liệu doanh thu không
  const hasRevenueData =
    revenueData &&
    revenueData.length > 0 &&
    revenueData.some((item) => item.revenue > 0);

  // Empty state component cho biểu đồ
  const EmptyChartState = () => (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-muted"
      style={{ height: 350 }}
    >
      <ExclamationCircle size={48} className="mb-3 opacity-50" />
      <h6 className="mb-2">Không có dữ liệu</h6>
      <p className="text-center small mb-0">
        Yêu cầu cập nhật số liệu từ người dùng
      </p>
    </div>
  );

  return (
    <>
      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <p className="text-muted mb-2 small">
                    Tổng doanh thu ({getPeriodLabel()})
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    <h3 className="fw-bold mb-0">
                      {formatShortCurrency(stats.totalRevenue)}
                    </h3>
                  </div>
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
                  <p className="text-muted mb-2 small">Số nhân viên</p>
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
                  <p className="text-muted mb-2 small">Số kênh BKT</p>
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
                  <p className="text-muted mb-2 small">Network hoạt động</p>
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
              <h5 className="fw-bold mb-4">{getChartTitle()}</h5>

              {hasRevenueData ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={revenueData}
                    margin={{
                      right: 20,
                      left: 10,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      angle={dateRange === "lifetime" ? -45 : 0}
                      textAnchor={dateRange === "lifetime" ? "end" : "middle"}
                      height={dateRange === "lifetime" ? 80 : 60}
                      interval={
                        dateRange === "lifetime" ? "preserveStartEnd" : 0
                      }
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      tickFormatter={formatShortCurrency}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      name="Doanh thu"
                      stroke="#0d6efd"
                      strokeWidth={2}
                      dot={{
                        r: dateRange === "7" || dateRange === "28" ? 4 : 0,
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartState />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Overview;
