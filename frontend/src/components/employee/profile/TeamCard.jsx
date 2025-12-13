import React from "react";
import {
  Card,
  Alert,
  Badge,
  Button,
  ListGroup,
  Row,
  Col,
} from "react-bootstrap";

function TeamCard({ userData, onOpenDetail }) {
  return (
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

            <Alert variant="success">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong>Bạn đang là thành viên của nhóm này</strong>
            </Alert>

            <div className="bg-light rounded p-3 mb-3">
              <h6 className="text-muted mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Thông tin nhóm
              </h6>

              <ListGroup variant="flush">
                <ListGroup.Item className="bg-light px-0 py-2 border-0">
                  <Row>
                    <Col xs={2} className="text-center">
                      <i className="bi bi-people text-muted"></i>
                    </Col>
                    <Col xs={10}>
                      <small className="text-muted">Làm việc theo nhóm</small>
                      <div className="fw-semibold">
                        Hỗ trợ và phối hợp công việc
                      </div>
                    </Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item className="bg-light px-0 py-2 border-0">
                  <Row>
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

            {/* Nút xem chi tiết nhóm */}
            <Button
              variant="outline-success"
              className="w-100"
              onClick={onOpenDetail}
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

            <Alert variant="secondary">
              <i className="bi bi-exclamation-circle me-2"></i>
              <strong>Chưa tham gia nhóm</strong>
              <p className="mt-2 mb-0 small">
                Liên hệ quản trị viên để được phân nhóm.
              </p>
            </Alert>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default TeamCard;
