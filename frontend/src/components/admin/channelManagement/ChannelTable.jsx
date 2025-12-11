import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Button,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import axios from "axios";

function ChannelTable() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter values
  const [startDate, setStartDate] = useState("2025-08-01");
  const [endDate, setEndDate] = useState("2025-12-10");

  const [filterType, setFilterType] = useState("custom");

  const applyQuickFilter = (type) => {
    const today = new Date();

    if (type === "today") {
      const d = today.toISOString().split("T")[0];
      setStartDate(d);
      setEndDate(d);
    } else if (type === "7days") {
      const d = new Date(today);
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (type === "28days") {
      const d = new Date(today);
      d.setDate(d.getDate() - 28);
      setStartDate(d.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    } else if (type === "year") {
      const y = today.getFullYear();
      setStartDate(`${y}-01-01`);
      setEndDate(today.toISOString().split("T")[0]);
    }

    setFilterType(type);
  };

  const fetchAnalytics = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `http://localhost:9999/youtube-analytics/get-all-analytics?startDate=${startDate}&endDate=${endDate}`
      );

      setChannels(res.data.data?.channels || []);
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu Analytics!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatNumber = (num) => (num ? num.toLocaleString("en-US") : 0);

  return (
    <Container fluid>
      <h4 className="mb-3">Thống kê kênh Youtube</h4>

      {/* === FILTER FORM === */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Lọc nhanh</Form.Label>
          <Form.Select
            value={filterType}
            onChange={(e) => {
              const v = e.target.value;
              setFilterType(v);
              applyQuickFilter(v);
            }}
          >
            <option value="custom">Tuỳ chọn ngày</option>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="28days">28 ngày</option>
            <option value="year">Năm nay</option>
          </Form.Select>
        </Col>

        <Col md={3}>
          <Form.Label>Từ ngày</Form.Label>
          <Form.Control
            type="date"
            disabled={filterType !== "custom"}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Col>

        <Col md={3}>
          <Form.Label>Đến ngày</Form.Label>
          <Form.Control
            type="date"
            disabled={filterType !== "custom"}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Col>

        <Col md={3} className="d-flex align-items-end">
          <Button variant="primary" onClick={fetchAnalytics} className="w-100">
            Áp dụng
          </Button>
        </Col>
      </Row>

      {/* === LOADING + ERROR === */}
      {loading && (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {/* === TABLE === */}
      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Tên kênh</th>
              <th>Chủ kênh</th>
              <th>Doanh thu</th>
              <th>Subs tăng</th>
              <th>Subs giảm</th>
              <th>Số record</th>
            </tr>
          </thead>
          <tbody>
            {channels.map((ch) => (
              <tr key={ch._id}>
                <td>{ch.channelName}</td>
                <td>{ch.channelOwner}</td>
                <td>${formatNumber(ch.totalRevenue)}</td>
                <td>{formatNumber(ch.totalSubsGained)}</td>
                <td>{formatNumber(ch.totalSubsLost)}</td>
                <td>{formatNumber(ch.recordCount)}</td>
              </tr>
            ))}

            {channels.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-3">
                  Không có dữ liệu trong khoảng thời gian này.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default ChannelTable;
