import React, { useState, useContext } from "react";
import { Button, Col, Container, Form, Row, Alert } from "react-bootstrap";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/login.style.css";

function Login() {
  const [companyEmail, setCompanyEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await login(companyEmail, password);
    } catch (err) {
      setErrorMsg(err || "Đăng nhập thất bại. Vui lòng thử lại.");
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
          </Col>

          <Col xs={12} md={6}>
            <h2 className="login-form-title">Đăng nhập</h2>

            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Email công ty</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập email công ty"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                variant="primary"
                className="w-100 mb-3"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
