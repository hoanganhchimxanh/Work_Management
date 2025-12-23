import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Unauthorized() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Hàm xử lý chuyển hướng theo quyền
  const handleRedirectBasedOnRole = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const userRole = decoded.role;

      switch (userRole) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "ACCOUNTANT":
          navigate("/accountant/dashboard");
          break;
        case "EMPLOYEE":
          navigate("/employee/dashboard");
          break;
        default:
          navigate("/login");
          break;
      }
    } catch (err) {
      console.error("Lỗi giải mã token:", err);
      navigate("/login");
    }
  };

  useEffect(() => {
    // Nếu countdown về 0 thì tự động chuyển hướng
    if (countdown === 0) {
      handleRedirectBasedOnRole();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

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
                Quyền truy cập của bạn không được xác nhận. Hệ thống sẽ tự động
                chuyển hướng bạn đến trang phù hợp với quyền của bạn trong{" "}
                <strong className="text-primary">{countdown}</strong> giây.
              </Card.Text>

              <Button
                variant="primary"
                onClick={handleRedirectBasedOnRole}
                className="w-100"
              >
                Chuyển hướng ngay
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Unauthorized;
