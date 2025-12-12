// src/components/Dashboard/TopRanking.jsx
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

  return (
    <Row className="g-4">
      {/* Employees */}
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

      {/* Teams */}
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

      {/* Channels */}
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
  );
}

export default TopRanking;
