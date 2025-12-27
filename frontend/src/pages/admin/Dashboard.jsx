import React from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  ButtonGroup,
  Button,
} from "react-bootstrap";

import Overview from "../../components/admin/dashboard/Overview";
import TopRanking from "../../components/admin/dashboard/TopRanking";

// Custom hooks
import useAuth from "../../hooks/admin/dashboard/useAuth";
import useDateRange from "../../hooks/admin/dashboard/useDateRange";
import useCurrency from "../../hooks/admin/dashboard/useCurrency";
import useDashboardData from "../../hooks/admin/dashboard/useDashboardData";
import useRevenueChart from "../../hooks/admin/dashboard/useRevenueChart";

function Dashboard() {
  // 1. Authentication
  const { getAuthToken } = useAuth();

  // 2. Date Range Filter
  const { dateRange, setDateRange, getDateParams } = useDateRange("7");

  // 3. Currency Formatting
  const { formatCurrency, formatShortCurrency } = useCurrency();

  // 4. Fetch Dashboard Data
  const {
    stats,
    revenueData: rawRevenueData,
    topEmployees,
    topTeams,
    topChannels,
    loading,
    error,
    setError,
  } = useDashboardData(getDateParams(), getAuthToken());

  // 5. Format Revenue Data cho Chart
  const revenueData = useRevenueChart(rawRevenueData, dateRange);

  // Loading state
  if (loading) {
    return (
      <Container
        fluid
        className="p-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải dữ liệu dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted">Tổng quan hoạt động kinh doanh</p>
        </Col>
      </Row>

      {/* Date Range Filter */}
      <Row className="mb-4">
        <Col>
          <ButtonGroup>
            <Button
              variant={dateRange === "7" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("7")}
            >
              7 ngày
            </Button>
            <Button
              variant={dateRange === "28" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("28")}
            >
              28 ngày
            </Button>
            <Button
              variant={dateRange === "90" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("90")}
            >
              90 ngày
            </Button>
            <Button
              variant={dateRange === "365" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("365")}
            >
              365 ngày
            </Button>
            <Button
              variant={dateRange === "lifetime" ? "primary" : "outline-primary"}
              onClick={() => setDateRange("lifetime")}
            >
              Toàn thời gian
            </Button>
          </ButtonGroup>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Overview Section */}
      <Overview
        stats={stats}
        revenueData={revenueData}
        formatCurrency={formatCurrency}
        formatShortCurrency={formatShortCurrency}
        dateRange={dateRange}
      />

      {/* Top Ranking Section */}
      <TopRanking
        topEmployees={topEmployees}
        topTeams={topTeams}
        topChannels={topChannels}
        formatCurrency={formatCurrency}
        formatShortCurrency={formatShortCurrency}
      />
    </Container>
  );
}

export default Dashboard;
