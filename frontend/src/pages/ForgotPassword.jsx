import React, { useState } from "react";
import { Button, Col, Container, Form, Row, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/login.style.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:9999/account/auto-reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra!");
      }

      setSuccessMsg(
        "Mật khẩu mới đã được gửi đến email cá nhân của bạn. Vui lòng kiểm tra hộp thư!"
      );
      setEmail("");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setErrorMsg(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
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
            <h1 className="login-title">Quên mật khẩu?</h1>
            <p className="login-subtext">
              Nhập email đăng nhập của bạn để nhận mật khẩu mới qua email cá
              nhân.
            </p>
          </Col>

          <Col xs={12} md={6}>
            <h2 className="login-form-title">Đặt lại mật khẩu</h2>

            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <Form onSubmit={handleResetPassword}>
              <Form.Group className="mb-3">
                <Form.Label>Email đăng nhập</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Nhập email đăng nhập"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || !!successMsg}
                />
              </Form.Group>

              <Button
                variant="primary"
                className="w-100 mb-3"
                type="submit"
                disabled={loading || !!successMsg}
              >
                {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </Form>

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => navigate("/login")}
                disabled={loading}
              >
                ← Quay lại đăng nhập
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ForgotPassword;
