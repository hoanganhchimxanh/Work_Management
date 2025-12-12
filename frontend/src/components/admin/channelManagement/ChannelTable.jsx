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
  Badge,
  Card,
} from "react-bootstrap";
import axios from "axios";

function ChannelTable({ onSyncComplete }) {
  const [channels, setChannels] = useState([]);
  const [grandTotals, setGrandTotals] = useState(null);
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
    if (!startDate || !endDate) {
      setError("Vui lòng chọn khoảng thời gian!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `http://localhost:9999/youtube-analytics/get-all-analytics`,
        {
          params: {
            startDate,
            endDate,
          },
        }
      );

      const data = res.data.data;
      setChannels(data?.channels || []);
      setGrandTotals(data?.grandTotals || null);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Không thể tải dữ liệu Analytics!"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString("en-US");
  };

  const formatCurrency = (num) => {
    if (num === null || num === undefined) return "$0.00";
    return "$" + num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { variant: "success", text: "Hoạt động" },
      HIDDEN: { variant: "warning", text: "Ẩn" },
      LOCKED: { variant: "danger", text: "Khóa" },
      STRIKED: { variant: "dark", text: "Vi phạm" },
    };

    const config = statusMap[status] || { variant: "secondary", text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  return (
    <Container fluid>
      {/* === SUMMARY CARDS === */}
      {grandTotals && !loading && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title className="text-muted">Tổng kênh</Card.Title>
                <h2 className="mb-0">{channels.length}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title className="text-muted">Tổng doanh thu</Card.Title>
                <h2 className="mb-0 text-success">
                  {formatCurrency(grandTotals.totalRevenue)}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title className="text-muted">Subs tăng</Card.Title>
                <h2 className="mb-0 text-primary">
                  +{formatNumber(grandTotals.totalSubsGained)}
                </h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title className="text-muted">Subs giảm</Card.Title>
                <h2 className="mb-0 text-danger">
                  -{formatNumber(grandTotals.totalSubsLost)}
                </h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* === FILTER FORM === */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
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
                  <option value="28days">28 ngày qua</option>
                  <option value="year">Năm nay</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Từ ngày</Form.Label>
                <Form.Control
                  type="date"
                  disabled={filterType !== "custom"}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Đến ngày</Form.Label>
                <Form.Control
                  type="date"
                  disabled={filterType !== "custom"}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="primary"
                onClick={fetchAnalytics}
                className="w-100"
                disabled={loading}
              >
                {loading ? "Đang tải..." : "Áp dụng"}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* === LOADING === */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* === ERROR === */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {/* === TABLE === */}
      {!loading && !error && (
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Tên kênh</th>
                <th>Người quản lý kênh</th>
                <th>Email</th>
                <th>Network</th>
                <th>Trạng thái</th>
                <th className="text-end">Doanh thu</th>
                <th className="text-end">Subs tăng</th>
                <th className="text-end">Subs giảm</th>
              </tr>
            </thead>
            <tbody>
              {channels.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    Không có dữ liệu trong khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                channels.map((ch, index) => (
                  <tr key={ch.channelId}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{ch.channelName}</strong>
                      {ch.channelLink && (
                        <div className="small text-muted">
                          <td>
                            {ch.channelLink && (
                              <div className="small text-muted">
                                <a
                                  href={ch.channelLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <i className="bi bi-link-45deg"></i> Xem kênh
                                </a>
                              </div>
                            )}
                          </td>
                        </div>
                      )}
                    </td>
                    <td>
                      {ch.assignedUser ? (
                        <div>
                          <strong>{ch.assignedUserName}</strong>
                          <div className="small text-muted">
                            <i className="bi bi-person-circle"></i>{" "}
                            {ch.assignedUser.role}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">
                          <i className="bi bi-person-x"></i> Chưa gán
                        </span>
                      )}
                    </td>
                    <td>
                      {ch.assignedUser?.personalEmail ? (
                        <span className="small">
                          {ch.assignedUser.personalEmail}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {ch.network !== "N/A" ? (
                        <Badge bg="info">{ch.network}</Badge>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{getStatusBadge(ch.channelStatus)}</td>
                    <td className="text-end">
                      <strong className="text-success">
                        {formatCurrency(ch.totalRevenue)}
                      </strong>
                    </td>
                    <td className="text-end">
                      <span className="text-primary">
                        +{formatNumber(ch.totalSubsGained)}
                      </span>
                    </td>
                    <td className="text-end">
                      <span className="text-danger">
                        -{formatNumber(ch.totalSubsLost)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default ChannelTable;
