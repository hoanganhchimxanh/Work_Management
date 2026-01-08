import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Form,
  Badge,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Card,
} from "react-bootstrap";
import { ArrowLeft, Lock, Unlock } from "react-bootstrap-icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

function ChannelRevenue() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const location = useLocation();

  // Lấy thông tin từ state nếu có
  const stateData = location.state || {};

  // State cho bộ lọc tháng/năm
  const [selectedMonth, setSelectedMonth] = useState(
    stateData.month || String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(
    stateData.year || String(new Date().getFullYear())
  );

  // State cho data
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Danh sách tháng
  const months = [
    { value: "01", label: "Tháng 1" },
    { value: "02", label: "Tháng 2" },
    { value: "03", label: "Tháng 3" },
    { value: "04", label: "Tháng 4" },
    { value: "05", label: "Tháng 5" },
    { value: "06", label: "Tháng 6" },
    { value: "07", label: "Tháng 7" },
    { value: "08", label: "Tháng 8" },
    { value: "09", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  const years = ["2024", "2025", "2026", "2027"];

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeChannelsRevenue();
    }
  }, [employeeId, selectedMonth, selectedYear]);

  const fetchEmployeeChannelsRevenue = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const monthQuery = `${selectedYear}-${selectedMonth}`;

      // Lấy thông tin nhân viên
      const userResponse = await axios.get(
        `http://localhost:9999/user/get-one/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEmployeeInfo(userResponse.data.data);

      // Lấy tất cả kênh của nhân viên
      const channelsResponse = await axios.get(
        `http://localhost:9999/channel/by-owner/${employeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userChannels = channelsResponse.data.data;

      // Lấy doanh thu cho từng kênh
      const channelsWithRevenue = await Promise.all(
        userChannels.map(async (channel) => {
          try {
            const revenueResponse = await axios.get(
              `http://localhost:9999/channel-revenue/${channel._id}/monthly`,
              {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                  startMonth: monthQuery,
                  endMonth: monthQuery,
                },
              }
            );

            const revenueData = revenueResponse.data.data;
            const monthRevenue = revenueData.revenues[0] || null;

            return {
              ...channel,
              estimatedRevenue: monthRevenue?.estimatedRevenue || 0,
              actualRevenue: monthRevenue?.actualRevenue || 0,
              locked: monthRevenue?.locked || false,
              revenueId: monthRevenue?._id || null,
              hasNetwork: !!channel.network,
              networkName: channel.network?.name || null,
            };
          } catch (err) {
            console.error(
              `Error fetching revenue for channel ${channel._id}:`,
              err
            );
            return {
              ...channel,
              estimatedRevenue: 0,
              actualRevenue: 0,
              locked: false,
              revenueId: null,
              hasNetwork: !!channel.network,
              networkName: channel.network?.name || null,
            };
          }
        })
      );

      setChannels(channelsWithRevenue);
    } catch (err) {
      console.error("Error fetching employee channels revenue:", err);
      setError(
        err.response?.data?.message ||
          "Không thể tải dữ liệu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async (channelId, currentLockStatus) => {
    try {
      const token = localStorage.getItem("token");
      const monthQuery = `${selectedYear}-${selectedMonth}`;

      await axios.patch(
        `http://localhost:9999/channel-revenue/${channelId}/monthly/${monthQuery}/toggle-lock`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refresh data
      await fetchEmployeeChannelsRevenue();
    } catch (err) {
      console.error("Error toggling lock:", err);
      alert(
        err.response?.data?.message || "Không thể thay đổi trạng thái khóa"
      );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const monthLabel =
    months.find((m) => m.value === selectedMonth)?.label || "Tháng";

  const totalEstimated = channels.reduce(
    (sum, ch) => sum + ch.estimatedRevenue,
    0
  );
  const totalActual = channels.reduce((sum, ch) => sum + ch.actualRevenue, 0);

  if (loading) {
    return (
      <Container
        fluid
        className="py-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header với nút quay lại */}
      <Row className="mb-4">
        <Col>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-3"
          >
            <ArrowLeft className="me-2" />
            Quay lại
          </Button>
          <h3>
            Doanh Thu Các Kênh -{" "}
            {employeeInfo?.fullName || stateData.employeeName || "Nhân viên"}
          </h3>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Thông tin nhân viên */}
      {employeeInfo && (
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={4}>
                <strong>Email:</strong> {employeeInfo.personalEmail}
              </Col>
              <Col md={4}>
                <strong>Team:</strong> {employeeInfo.team?.name || "—"}
              </Col>
              <Col md={4}>
                <strong>Số kênh:</strong> {channels.length}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Bộ lọc Tháng - Năm */}
      <Row className="mb-4 align-items-end">
        <Col md={6} lg={4}>
          <Form.Group>
            <Form.Label>Chọn tháng và năm</Form.Label>
            <Row>
              <Col xs={6}>
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Form.Group>
        </Col>
        <Col md={6} lg={8} className="text-md-end">
          <h5 className="mb-0 text-primary">
            {monthLabel} / {selectedYear}
          </h5>
        </Col>
      </Row>

      {/* Bảng Doanh Thu */}
      <Table
        striped
        bordered
        hover
        responsive
        className="text-center align-middle"
      >
        <thead>
          <tr>
            <th style={{ width: "60px" }}>STT</th>
            <th>Tên Kênh</th>
            <th>Network</th>
            <th>Trạng thái</th>
            <th>Doanh thu ước tính</th>
            <th>Doanh thu thực tế</th>
            <th style={{ width: "120px" }}>Khóa</th>
          </tr>
        </thead>
        <tbody>
          {channels.length > 0 ? (
            channels.map((channel, index) => (
              <tr key={channel._id}>
                <td>{index + 1}</td>
                <td className="text-start">
                  <div>{channel.name}</div>
                  {channel.link && (
                    <small className="text-muted">{channel.link}</small>
                  )}
                </td>
                <td>
                  {channel.hasNetwork ? (
                    <Badge bg="info">{channel.networkName || "Network"}</Badge>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <Badge
                    bg={
                      channel.status === "ACTIVE"
                        ? "success"
                        : channel.status === "HIDDEN"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {channel.status}
                  </Badge>
                </td>
                <td className="fw-bold text-info">
                  {formatCurrency(channel.estimatedRevenue)}
                </td>
                <td className="fw-bold text-success">
                  {formatCurrency(channel.actualRevenue)}
                </td>
                <td>
                  {channel.revenueId ? (
                    <Button
                      variant={channel.locked ? "danger" : "outline-secondary"}
                      size="sm"
                      onClick={() =>
                        handleToggleLock(channel._id, channel.locked)
                      }
                    >
                      {channel.locked ? (
                        <>
                          <Lock className="me-1" />
                          Đã khóa
                        </>
                      ) : (
                        <>
                          <Unlock className="me-1" />
                          Mở khóa
                        </>
                      )}
                    </Button>
                  ) : (
                    <span className="text-muted">Chưa có dữ liệu</span>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-muted py-4">
                Không có dữ liệu cho tháng này
              </td>
            </tr>
          )}
        </tbody>
        {channels.length > 0 && (
          <tfoot>
            <tr className="table-info fw-bold">
              <td colSpan={4} className="text-end">
                Tổng cộng:
              </td>
              <td className="text-info">{formatCurrency(totalEstimated)}</td>
              <td className="text-success">{formatCurrency(totalActual)}</td>
              <td></td>
            </tr>
          </tfoot>
        )}
      </Table>
    </Container>
  );
}

export default ChannelRevenue;
