import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Col,
  Container,
  Form,
  Row,
  Alert,
  Card,
  InputGroup,
} from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/login.style.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-bg"
      style={{ backgroundImage: "url(/images/background.jpg)" }}
    >
      <Container className="login-container">
        <Row className="align-items-center">
          <Col
            xs={12}
            md={6}
            className="mb-4 mb-md-0 text-center text-md-start"
          >
            <h1 className="login-title">
              Chào mừng <br /> nhân viên!
            </h1>
            <p className="login-subtext">
              Xin mời đăng nhập để truy cập vào hệ thống.
            </p>

            <Card className="mt-4 shadow-sm">
              <Card.Body>
                <Card.Title className="mb-2">Giới thiệu hệ thống</Card.Title>
                <Card.Text className="text-muted">
                  <strong>Work Management</strong> là hệ thống nội bộ dùng để
                  quản lý nhân viên và theo dõi hoạt động kênh YouTube trong
                  công ty truyền thông. Hệ thống hỗ trợ tổng hợp dữ liệu kênh,
                  doanh thu và hiệu suất làm việc nhằm phục vụ báo cáo và vận
                  hành nội bộ.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <h2 className="login-form-title">Đăng nhập</h2>

            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email đăng nhập</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Nhập email đăng nhập"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    className="bg-white border-start-0"
                    style={{ borderColor: "#ced4da" }}
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button
                variant="primary"
                className="w-100 mb-3"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <Form.Text className="text-muted text-center d-block">
                Khi đăng nhập, bạn đồng ý với{" "}
                <Link to="/terms-of-service">Điều khoản sử dụng</Link> và{" "}
                <Link to="/policies">Chính sách bảo mật</Link>.
              </Form.Text>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
