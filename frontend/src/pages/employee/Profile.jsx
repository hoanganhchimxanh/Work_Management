import React, { useState, useEffect } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Badge,
  ListGroup,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [teamData, setTeamData] = useState(null);

  // Get user ID and token from localStorage
  const token = localStorage.getItem("token");
  let userId = null;
  let accountId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
      accountId = decoded.accountId;
    } catch (err) {
      console.error("Token không hợp lệ:", err);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user personal data
      const userResponse = await axios.get(
        `http://localhost:9999/user/get-one/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData(userResponse.data.data);

      // If user has a team, fetch team details
      if (userResponse.data.data.team) {
        // You'll need to get the team ID and fetch team data
        // For now, we'll display the team name from user data
        // If you need full team details, you'll need another API call
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(
        err.response?.data?.message || "Không thể tải thông tin người dùng"
      );
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      ADMIN: { variant: "danger", text: "Quản trị viên" },
      ACCOUNTANT: { variant: "info", text: "Kế toán" },
      EMPLOYEE: { variant: "primary", text: "Nhân viên" },
    };
    return roleMap[role] || { variant: "secondary", text: role };
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { variant: "success", text: "Đang hoạt động" },
      PENDING: { variant: "warning", text: "Chờ duyệt" },
      QUIT: { variant: "secondary", text: "Đã nghỉ" },
    };
    return statusMap[status] || { variant: "secondary", text: status };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid>
        <Alert variant="danger" className="mt-3">
          <Alert.Heading>Lỗi!</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchUserData}>
            Thử lại
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container fluid>
        <Alert variant="warning" className="mt-3">
          Không tìm thấy thông tin người dùng
        </Alert>
      </Container>
    );
  }

  const roleBadge = getRoleBadge(userData.role);
  const statusBadge = getStatusBadge(userData.status);

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="h2 mb-2">Thông tin cá nhân</h1>
        <p className="text-muted">Xem thông tin tài khoản và nhóm của bạn</p>
      </div>

      <Row>
        {/* Account Information Card */}
        <Col lg={7} md={12} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Thông tin tài khoản
              </h5>
            </Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                {/* Full Name */}
                <ListGroup.Item className="px-0 py-3">
                  <Row>
                    <Col sm={4} className="text-muted">
                      <strong>Họ và tên:</strong>
                    </Col>
                    <Col sm={8}>
                      <span className="fw-semibold">{userData.fullName}</span>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* Personal Email */}
                <ListGroup.Item className="px-0 py-3">
                  <Row>
                    <Col sm={4} className="text-muted">
                      <strong>Email cá nhân:</strong>
                    </Col>
                    <Col sm={8}>
                      <span>{userData.personalEmail}</span>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* Login Email */}
                <ListGroup.Item className="px-0 py-3">
                  <Row>
                    <Col sm={4} className="text-muted">
                      <strong>Email công ty:</strong>
                    </Col>
                    <Col sm={8}>
                      <span className="text-primary">
                        {userData.loginEmail || "Chưa có"}
                      </span>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* Role */}
                <ListGroup.Item className="px-0 py-3">
                  <Row>
                    <Col sm={4} className="text-muted">
                      <strong>Vai trò:</strong>
                    </Col>
                    <Col sm={8}>
                      <Badge bg={roleBadge.variant} className="px-3 py-2">
                        {roleBadge.text}
                      </Badge>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* Status */}
                <ListGroup.Item className="px-0 py-3">
                  <Row>
                    <Col sm={4} className="text-muted">
                      <strong>Trạng thái:</strong>
                    </Col>
                    <Col sm={8}>
                      <Badge bg={statusBadge.variant} className="px-3 py-2">
                        {statusBadge.text}
                      </Badge>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* Account Status */}
                <ListGroup.Item className="px-0 py-3">
                  <Row>
                    <Col sm={4} className="text-muted">
                      <strong>Tài khoản:</strong>
                    </Col>
                    <Col sm={8}>
                      {userData.hasAccount ? (
                        <span>
                          <Badge
                            bg={
                              userData.accountIsActive ? "success" : "warning"
                            }
                          >
                            {userData.accountIsActive
                              ? "Đã kích hoạt"
                              : "Chưa kích hoạt"}
                          </Badge>
                          {userData.isFirstLogin && (
                            <Badge bg="info" className="ms-2">
                              Chưa đổi mật khẩu lần đầu
                            </Badge>
                          )}
                        </span>
                      ) : (
                        <Badge bg="secondary">Chưa có tài khoản</Badge>
                      )}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* Join Date */}
                <ListGroup.Item className="px-0 py-3">
                  <Row>
                    <Col sm={4} className="text-muted">
                      <strong>Ngày tham gia:</strong>
                    </Col>
                    <Col sm={8}>
                      <span>{formatDate(userData.joinedAt)}</span>
                    </Col>
                  </Row>
                </ListGroup.Item>

                {/* Channel Count */}
                <ListGroup.Item className="px-0 py-3">
                  <Row>
                    <Col sm={4} className="text-muted">
                      <strong>Số kênh quản lý:</strong>
                    </Col>
                    <Col sm={8}>
                      <Badge bg="info" className="px-3 py-2">
                        {userData.channelCount} kênh
                      </Badge>
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>

              {/* Change Password Button */}
              {userData.hasAccount && (
                <div className="mt-3">
                  <Button
                    variant="outline-primary"
                    href={`/change-password/${accountId}`}
                    className="w-100"
                  >
                    <i className="bi bi-key me-2"></i>
                    Đổi mật khẩu
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Team Information Card */}
        <Col lg={5} md={12} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-people-fill me-2"></i>
                Thông tin nhóm
              </h5>
            </Card.Header>
            <Card.Body>
              {userData.team ? (
                <>
                  <div className="text-center mb-4">
                    <div
                      className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "80px", height: "80px" }}
                    >
                      <i
                        className="bi bi-diagram-3 text-success"
                        style={{ fontSize: "2rem" }}
                      ></i>
                    </div>
                    <h4 className="text-success mb-2">{userData.team}</h4>
                    <Badge bg="success" className="px-3 py-2">
                      Thành viên
                    </Badge>
                  </div>

                  <Alert variant="success" className="mb-3">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <div>
                        <strong>Bạn đang là thành viên của nhóm này</strong>
                      </div>
                    </div>
                  </Alert>

                  <div className="bg-light rounded p-3 mb-3">
                    <h6 className="text-muted mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Thông tin nhóm
                    </h6>
                    <ListGroup variant="flush" className="bg-light">
                      <ListGroup.Item className="bg-light px-0 py-2 border-0">
                        <Row className="align-items-center">
                          <Col xs={2} className="text-center">
                            <i className="bi bi-people text-muted"></i>
                          </Col>
                          <Col xs={10}>
                            <small className="text-muted">
                              Làm việc theo nhóm
                            </small>
                            <div className="fw-semibold">
                              Hỗ trợ và phối hợp công việc
                            </div>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                      <ListGroup.Item className="bg-light px-0 py-2 border-0">
                        <Row className="align-items-center">
                          <Col xs={2} className="text-center">
                            <i className="bi bi-youtube text-danger"></i>
                          </Col>
                          <Col xs={10}>
                            <small className="text-muted">Kênh quản lý</small>
                            <div className="fw-semibold">
                              {userData.channelCount} kênh
                            </div>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    </ListGroup>
                  </div>

                  <Button
                    variant="outline-success"
                    href="/teams"
                    className="w-100"
                  >
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Xem chi tiết nhóm
                  </Button>
                </>
              ) : (
                <div className="text-center py-5">
                  <div
                    className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "80px", height: "80px" }}
                  >
                    <i
                      className="bi bi-people text-muted"
                      style={{ fontSize: "2rem" }}
                    ></i>
                  </div>
                  <Alert variant="secondary" className="mb-0">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    <div>
                      <strong>Chưa tham gia nhóm</strong>
                      <p className="mb-0 mt-2 small">
                        Bạn chưa được thêm vào nhóm nào. Liên hệ quản trị viên
                        để được phân nhóm.
                      </p>
                    </div>
                  </Alert>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
