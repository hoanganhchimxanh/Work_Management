import React from "react";
import { Container, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center vh-100 bg-light"
    >
      <Row>
        <Col>
          <Card className="text-center shadow-lg p-4">
            <Card.Body>
              <h1 className="display-3 fw-bold text-danger">404</h1>
              <h4 className="mb-3">Trang không tồn tại</h4>

              <p className="text-muted mb-4">
                URL bạn nhập không đúng hoặc trang này đã bị xóa.
              </p>

              <div className="d-flex justify-content-center gap-3">
                <Button variant="primary" onClick={() => navigate("/")}>
                  Về trang chủ
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() => navigate(-1)}
                >
                  Quay lại
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default NotFound;
