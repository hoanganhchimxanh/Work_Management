import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { ArrowLeft, Calendar } from "react-bootstrap-icons";
import RevenueChart from "../../components/employee/channelDetail/RevenueChart";
import SubscribersChart from "../../components/employee/channelDetail/SubscribersChart";
import StatsCards from "../../components/employee/channelDetail/StatsCards";
import TimeRangeFilter from "../../components/employee/channelDetail/TimeRangeFilter";
import ChannelInfoCard from "../../components/employee/channelDetail/ChannelInfoCard";

import config from "../../configs/api";

function ChannelDetail() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [selectedDays, setSelectedDays] = useState(7);

  // Fetch channel analytics
  const fetchChannelAnalytics = async (days) => {
    try {
      setLoading(true);
      setError(null);

      let startDate;
      const endDate = new Date();

      if (days === "lifetime") {
        startDate = new Date(0);
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
      }

      const formatDate = (date) => date.toISOString().split("T")[0];

      const response = await fetch(
        `${
          config.backendBase
        }/youtube-analytics/get-analytics/${channelId}?startDate=${formatDate(
          startDate,
        )}&endDate=${formatDate(endDate)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        setChannelData(data.data);
      } else {
        setError(data.message || "Không thể tải dữ liệu");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channelId) {
      fetchChannelAnalytics(selectedDays);
    }
  }, [channelId, selectedDays]);

  // Format chart data
  const getChartData = () => {
    if (!channelData?.analytics) return [];

    return channelData.analytics.map((item) => ({
      date: new Date(item.date).toLocaleDateString("vi-VN", {
        month: "short",
        day: "numeric",
      }),
      revenue: item.estimatedRevenue || 0,
      subsGained: item.subscribersGained || 0,
      subsLost: item.subscribersLost || 0,
      netSubs: (item.subscribersGained || 0) - (item.subscribersLost || 0),
    }));
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="danger" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const chartData = getChartData();
  const totals = channelData?.totals || {};

  return (
    <Container fluid className="py-4">
      {/* Back Button */}
      <Button
        variant="link"
        onClick={() => navigate(-1)}
        className="mb-3 text-decoration-none"
      >
        <ArrowLeft className="me-2" />
        Quay lại danh sách kênh
      </Button>

      {/* Channel Info Header */}
      <ChannelInfoCard
        channel={channelData?.channel}
        network={channelData?.network}
      />

      {/* Time Range Filter */}
      <TimeRangeFilter
        selectedDays={selectedDays}
        onSelectDays={setSelectedDays}
      />

      {/* Stats Cards */}
      <StatsCards totals={totals} />

      {/* Charts */}
      <Row className="mt-4">
        <Col xs={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Biểu đồ doanh thu ước tính</Card.Title>
              <RevenueChart data={chartData} />
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Biểu đồ thay đổi subscribers</Card.Title>
              <SubscribersChart data={chartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Info */}
      {channelData?.assignedUser && (
        <Card className="mt-4">
          <Card.Body>
            <Card.Title>Thông tin quản lý</Card.Title>
            <Row>
              <Col md={6}>
                <p className="text-muted mb-1">Nhân viên phụ trách</p>
                <p className="fw-bold">{channelData.assignedUser.fullName}</p>
              </Col>
              <Col md={6}>
                <p className="text-muted mb-1">Email cá nhân</p>
                <p className="fw-bold">
                  {channelData.assignedUser.phoneNumber}
                </p>
              </Col>
              {channelData.team && (
                <Col md={6} className="mt-3">
                  <p className="text-muted mb-1">Team trực thuộc</p>
                  <p className="fw-bold">{channelData.team.teamName}</p>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Data Info */}
      <div className="text-center text-muted mt-4 mb-3">
        <Calendar className="me-2" />
        Dữ liệu từ {channelData?.dateRange?.startDate} đến{" "}
        {channelData?.dateRange?.endDate}
        {" • "}
        Tổng {channelData?.recordCount || 0} bản ghi
      </div>
    </Container>
  );
}

export default ChannelDetail;
