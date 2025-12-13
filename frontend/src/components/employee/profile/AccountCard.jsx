import React from "react";
import { Card, ListGroup, Row, Col, Badge, Button } from "react-bootstrap";

function AccountCard({ userData, accountId }) {
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

  const roleBadge = getRoleBadge(userData.role);
  const statusBadge = getStatusBadge(userData.status);

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className="bi bi-person-circle me-2"></i>
          Thông tin tài khoản
        </h5>
      </Card.Header>

      <Card.Body>
        <ListGroup variant="flush">
          <ListGroup.Item className="px-0 py-3">
            <Row>
              <Col sm={4} className="text-muted">
                <strong>Họ và tên:</strong>
              </Col>
              <Col sm={8} className="fw-semibold">
                {userData.fullName}
              </Col>
            </Row>
          </ListGroup.Item>

          <ListGroup.Item className="px-0 py-3">
            <Row>
              <Col sm={4} className="text-muted">
                <strong>Email cá nhân:</strong>
              </Col>
              <Col sm={8}>{userData.personalEmail}</Col>
            </Row>
          </ListGroup.Item>

          <ListGroup.Item className="px-0 py-3">
            <Row>
              <Col sm={4} className="text-muted">
                <strong>Email công ty:</strong>
              </Col>
              <Col sm={8} className="text-primary">
                {userData.loginEmail || "Chưa có"}
              </Col>
            </Row>
          </ListGroup.Item>

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

          <ListGroup.Item className="px-0 py-3">
            <Row>
              <Col sm={4} className="text-muted">
                <strong>Ngày tham gia:</strong>
              </Col>
              <Col sm={8}>{formatDate(userData.joinedAt)}</Col>
            </Row>
          </ListGroup.Item>

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
  );
}

export default AccountCard;
