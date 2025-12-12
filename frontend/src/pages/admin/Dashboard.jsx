import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";

import Overview from "../../components/admin/dashboard/Overview";
import TopRanking from "../../components/admin/dashboard/TopRanking";

function Dashboard() {
  const [stats] = useState({
    totalRevenue: 2450000000,
    totalEmployees: 156,
    totalChannels: 89,
    activeNetworks: 12,
  });

  const revenueData = [
    { month: "T1", revenue: 1800000 },
    { month: "T2", revenue: 1950000 },
    { month: "T3", revenue: 2100000 },
    { month: "T4", revenue: 1980000 },
    { month: "T5", revenue: 2250000 },
    { month: "T6", revenue: 2400000 },
    { month: "T7", revenue: 2350000 },
    { month: "T8", revenue: 2580000 },
    { month: "T9", revenue: 2700000 },
    { month: "T10", revenue: 2850000 },
    { month: "T11", revenue: 2950000 },
    { month: "T12", revenue: 3100000 },
  ];

  const topEmployees = [
    { name: "Nguyễn Văn A", revenue: 850000 },
    { name: "Trần Thị B", revenue: 780000 },
    { name: "Lê Văn C", revenue: 720000 },
    { name: "Phạm Thị D", revenue: 680000 },
    { name: "Hoàng Văn E", revenue: 650000 },
  ];

  const topTeams = [
    { name: "Team Marketing", revenue: 4500000 },
    { name: "Team Sales", revenue: 4200000 },
    { name: "Team Digital", revenue: 3800000 },
    { name: "Team Content", revenue: 3500000 },
    { name: "Team Operations", revenue: 3200000 },
  ];

  const topChannels = [
    { name: "Facebook Ads", revenue: 52000 },
    { name: "Google Ads", revenue: 48000 },
    { name: "TikTok Ads", revenue: 42500 },
    { name: "Instagram", revenue: 38000 },
    { name: "YouTube", revenue: 35000 },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const formatShortCurrency = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
    return value;
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Dashboard</h2>
          <p className="text-muted">Tổng quan hoạt động kinh doanh</p>
        </Col>
      </Row>

      <Overview
        stats={stats}
        revenueData={revenueData}
        formatCurrency={formatCurrency}
        formatShortCurrency={formatShortCurrency}
      />

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
