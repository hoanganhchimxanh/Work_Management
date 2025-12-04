import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

function Unauthorized() {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Row>
        <Col md={12}>
          <Card
            className="text-center shadow p-4"
            style={{ maxWidth: "450px" }}
          >
            <Card.Body>
              <ExclamationTriangleFill size={80} className="text-danger mb-3" />

              <Card.Title as="h1" className="text-danger mb-3">
                Truy Cập Bị Từ Chối!!!
              </Card.Title>

              <Card.Text className="lead mb-4">
                Bạn không có quyền truy cập vào trang này. Vui lòng đăng nhập
                bằng tài khoản có thẩm quyền.
              </Card.Text>

              <Button
                variant="primary"
                onClick={handleGoToLogin}
                className="w-100"
              >
                Quay về Trang Đăng Nhập
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Unauthorized;
