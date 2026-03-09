import React from "react";
import { Card, Form, Button, Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useBugReport from "../hooks/useBugReport";
import "../styles/bugReport.style.css";

function BugReport() {
  const navigate = useNavigate();
  const {
    bugType,
    setBugType,
    description,
    setDescription,
    pageUrl,
    setPageUrl,
    image,
    setImage,
    submitting,
    success,
    error,
    countdown,
    handleSubmit,
    redirectByRole,
  } = useBugReport();

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
