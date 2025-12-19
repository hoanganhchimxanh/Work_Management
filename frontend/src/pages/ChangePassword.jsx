import React, { useState, useContext } from "react";
import { Button, Container, Form, Row, Col, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/changePassword.style.css";
import config from "../configs/api";

function ChangePassword() {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password1 !== password2) {
      return setError("Mật khẩu nhập lại không khớp!");
    }
    if (password1.length < 6) {
      return setError("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.patch(
        `${config.backendBase}/account/change-password/${accountId}`,
        { newPassword: password1 },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Đổi mật khẩu thành công! Đang chuyển về trang đăng nhập...");

      setTimeout(() => {
        logout(); // Xóa token và chuyển về /login
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Đổi mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="cp-bg"
      style={{ backgroundImage: "url(/images/background.jpg)" }}
    >
      <Container className="cp-container">
        <Row className="justify-content-center">
          <Col xs={12} md={6}>
            <h2 className="cp-title">Đổi mật khẩu lần đầu</h2>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={password1}
                  onChange={(e) => setPassword1(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading || success}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  disabled={loading || success}
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100 cp-btn"
                disabled={loading || success}
              >
                {loading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ChangePassword;
