import React, { useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Unauthorized() {
  const navigate = useNavigate();

  // Hàm xử lý chuyển hướng theo quyền
  const handleRedirectBasedOnRole = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Nếu không có token, chuyển hướng đến trang đăng nhập
      navigate("/login");
      return;
    }

    try {
      // Giải mã JWT để lấy thông tin role
      const decoded = jwtDecode(token);
      const userRole = decoded.role;

      // Thực hiện chuyển hướng dựa trên vai trò
      switch (userRole) {
        case "ADMIN":
          navigate("/admin/dashboard"); // Trang admin
          break;
        case "ACCOUNTANT":
          navigate("/accountant/dashboard"); // Trang kế toán
          break;
        case "EMPLOYEE":
          navigate("/employee/dashboard"); // Trang nhân viên
          break;
        default:
          navigate("/login"); // Quay về login nếu không xác định
          break;
      }
    } catch (err) {
      console.error("Lỗi giải mã token:", err);
      // Nếu lỗi khi giải mã token, quay về trang login
      navigate("/login");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRedirectBasedOnRole();
    }, 3000); // 3s

    return () => clearTimeout(timer); // cleanup khi unmount
  }, []);

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
                chuyển hướng bạn đến trang phù hợp với quyền của bạn trong 3
                giây.
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
