import React, { useState } from "react";
import { Button, Col, Container, Form, Row, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/register.style.css";

function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:9999/user/register", {
        fullName,
        personalEmail,
      });

      setSuccessMsg(response.data.message);
      setFullName("");
      setPersonalEmail("");

      // Redirect về login sau 3 giây
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-bg"
      style={{ backgroundImage: "url(/images/background.jpg)" }}
    >
      <Container className="register-container">
        <Row className="align-items-center">
          <Col
            xs={12}
            md={6}
            className="mb-4 mb-md-0 text-center text-md-start"
          >
            <h1 className="register-title">
              Chào mừng <br /> đến với công ty!
            </h1>
            <p className="register-subtext">
              Đăng ký tài khoản để bắt đầu làm việc cùng chúng tôi.
            </p>
          </Col>

          <Col xs={12} md={6}>
            <h2 className="register-form-title">Đăng ký</h2>

            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <Form onSubmit={handleRegister}>
              <Form.Group className="mb-3">
                <Form.Label>Họ và tên</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email cá nhân</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Nhập email cá nhân"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Chúng tôi sẽ gửi thông tin đăng nhập đến email này sau khi
                  admin phê duyệt.
                </Form.Text>
              </Form.Group>

              <Button
                variant="primary"
                className="w-100 mb-3"
                type="submit"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng ký"}
              </Button>

              <div className="text-center">
                <span className="text-muted">Đã có tài khoản? </span>
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="p-0"
                >
                  Đăng nhập ngay
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RegisterPage;
