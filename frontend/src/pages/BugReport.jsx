import React, { useEffect, useState } from "react";
import { Card, Form, Button, Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import config from "../configs/api";
import "../styles/bugReport.style.css";

function BugReport() {
  const navigate = useNavigate();

  const [bugType, setBugType] = useState("");
  const [description, setDescription] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [image, setImage] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [countdown, setCountdown] = useState(5);

  // 🔁 Redirect theo role
  const redirectByRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const { role } = jwtDecode(token);

      if (role === "ADMIN") navigate("/admin/dashboard");
      else if (role === "ACCOUNTANT") navigate("/accountant/dashboard");
      else if (role === "EMPLOYEE") navigate("/employee/dashboard");
      else navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  // ⏳ Countdown chỉ chạy khi gửi thành công
  useEffect(() => {
    if (!success) return;

    if (countdown === 0) {
      redirectByRole();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [success, countdown]);

  // 📤 Submit bug report
  const handleSubmit = async () => {
    if (!bugType || !description) {
      setError("Vui lòng chọn loại lỗi và nhập mô tả.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();
      formData.append("bugType", bugType);
      formData.append("description", description);
      formData.append("page", pageUrl);
      if (image) formData.append("image", image);

      await axios.post(`${config.backendBase}/bug-report`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Không thể gửi báo cáo. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container
      fluid
      className="bug-report-container"
      style={{ backgroundImage: "url(/images/background.jpg)" }}
    >
      <Card style={{ width: "100%", maxWidth: "600px" }} className="shadow-lg">
        <Card.Body>
          <Card.Title className="mb-4 text-center">🐞 Báo cáo lỗi</Card.Title>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              Gửi báo cáo thành công! <br />
              Hệ thống sẽ chuyển hướng bạn sau <strong>{countdown}</strong>{" "}
              giây.
            </Alert>
          )}

          {!success && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Loại lỗi</Form.Label>
                <Form.Select
                  value={bugType}
                  onChange={(e) => setBugType(e.target.value)}
                >
                  <option value="">-- Chọn loại lỗi --</option>
                  <option value="ui">Lỗi hiển thị</option>
                  <option value="data">Lỗi dữ liệu</option>
                  <option value="function">Lỗi chức năng</option>
                  <option value="other">Khác</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mô tả chi tiết</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Đường link trang xảy ra lỗi</Form.Label>
                <Form.Control
                  type="url"
                  placeholder="https://example.com/admin/channels"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Link trang bạn đang gặp lỗi (có thể copy từ thanh địa chỉ)
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Ảnh minh họa (không bắt buộc)</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </Form.Group>
            </>
          )}

          <div className="d-flex justify-content-end gap-2">
            {!success ? (
              <>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Đang gửi..." : "Gửi báo cáo"}
                </Button>
                <Button variant="secondary" onClick={handleGoBack}>
                  ← Quay lại
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={redirectByRole}
                className="w-100"
              >
                Chuyển hướng ngay
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default BugReport;
