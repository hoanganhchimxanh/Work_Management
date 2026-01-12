import React, { useState } from "react";
import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import {
  CashStack,
  BroadcastPin,
  CheckCircleFill,
} from "react-bootstrap-icons";
import StatsCard from "../../components/employee/dashboard/StatsCard";
import TimeFilterButtons from "../../components/employee/dashboard/TimeFilterButtons";
import RevenueChart from "../../components/employee/dashboard/RevenueChart";
import { useDashboardData } from "../../hooks/employee/dashboard/useDashboardData";

function EmployeeDashboard() {
  const [timeFilter, setTimeFilter] = useState("28days");
  const { loading, error, stats, chartData, refetch } =
    useDashboardData(timeFilter);

  const formatShortCurrency = (value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value}`;
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
          <Button variant="outline-danger" onClick={refetch}>
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
          <TimeFilterButtons
            currentFilter={timeFilter}
            onFilterChange={setTimeFilter}
          />
        </Col>
      </Row>

      <Row className="g-4 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <StatsCard
            title="Doanh thu kỳ này"
            value={formatShortCurrency(stats.totalRevenue)}
            icon={CashStack}
            bgColor="primary"
            iconColor="#0d6efd"
          />
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <StatsCard
            title="Số kênh sở hữu"
            value={stats.ownedChannels}
            icon={BroadcastPin}
            bgColor="success"
            iconColor="#198754"
          />
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <StatsCard
            title="Công việc hoàn thành"
            value={stats.completedTasks}
            icon={CheckCircleFill}
            bgColor="warning"
            iconColor="#ffc107"
          />
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <StatsCard
            title="KPI hoàn thành"
            value={`${stats.completedKPI}%`}
            icon={CheckCircleFill}
            bgColor="info"
            iconColor="#0dcaf0"
          />
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          <RevenueChart data={chartData} timeFilter={timeFilter} />
        </Col>
      </Row>
    </Container>
  );
}

export default EmployeeDashboard;
