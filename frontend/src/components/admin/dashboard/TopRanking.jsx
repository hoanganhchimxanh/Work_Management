import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ExclamationCircle } from "react-bootstrap-icons";

function TopRanking({
  topEmployees,
  topTeams,
  topChannels,
  formatShortCurrency,
  formatCurrency,
}) {
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

  // Empty state component
  const EmptyChartState = ({ message = "Không có dữ liệu" }) => (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-muted"
      style={{ height: 300 }}
    >
      <ExclamationCircle size={40} className="mb-3 opacity-50" />
      <h6 className="mb-2">{message}</h6>
      <p className="text-center small mb-0">
        Yêu cầu cập nhật số liệu từ người dùng
      </p>
    </div>
  );

  // Kiểm tra dữ liệu có tồn tại và có giá trị không
  const hasEmployeeData =
    topEmployees &&
    topEmployees.length > 0 &&
    topEmployees.some((item) => item.revenue > 0);

  const hasTeamData =
    topTeams &&
    topTeams.length > 0 &&
    topTeams.some((item) => item.revenue > 0);

  const hasChannelData =
    topChannels &&
    topChannels.length > 0 &&
    topChannels.some((item) => item.revenue > 0);

  return (
    <Row className="g-4">
      {/* Employees */}
      <Col xs={12} lg={4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body>
            <h6 className="fw-bold mb-4">
              Top 5 Nhân viên - Doanh thu cao nhất
            </h6>
            {hasEmployeeData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topEmployees}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatShortCurrency}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#0d6efd" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Không có dữ liệu nhân viên" />
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Teams */}
      <Col xs={12} lg={4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body>
            <h6 className="fw-bold mb-4">Top 5 Team - Doanh thu cao nhất</h6>
            {hasTeamData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topTeams}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatShortCurrency}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#198754" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Không có dữ liệu team" />
            )}
          </Card.Body>
        </Card>
      </Col>

      {/* Channels */}
      <Col xs={12} lg={4}>
        <Card className="border-0 shadow-sm h-100">
          <Card.Body>
            <h6 className="fw-bold mb-4">Top 5 Kênh - Doanh thu cao nhất</h6>
            {hasChannelData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topChannels}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-15}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatShortCurrency}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#ffc107" name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Không có dữ liệu kênh" />
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default TopRanking;
