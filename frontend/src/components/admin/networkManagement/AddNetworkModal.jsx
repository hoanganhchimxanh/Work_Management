import React, { useState } from "react";
// Thêm InputGroup vào phần import
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";

const AddNetworkModal = ({ show, onHide, onSubmit }) => {
  const [formData, setFormData] = useState({
    pubId: "",
    employment: "",
    profileAdsenseId: "",
    emailAddress: "",
    password: "",
    recoveryEmail: "",
    twoFA: false,
    creationDate: "",
    taxForm: "",
    location: "OFFICE",
    linkedChannelUrl: "",
    status: "ACTIVE",
    reminderDate: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Thêm state để quản lý việc hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.profileAdsenseId.trim()) {
      setError("Profile AdSense ID là bắt buộc!");
      return;
    }
    if (!formData.emailAddress.trim()) {
      setError("Email Address là bắt buộc!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        pubId: formData.pubId || undefined,
        reminderDate: formData.reminderDate || null,
        creationDate: formData.creationDate || null,
      };

      await onSubmit(payload);
      handleClose();
    } catch (err) {
      setError(err.message || "Lỗi khi tạo network!");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    // 2. Reset lại trạng thái ẩn mật khẩu khi đóng modal
    setShowPassword(false);
    setFormData({
      pubId: "",
      employment: "",
      profileAdsenseId: "",
      emailAddress: "",
      password: "",
      recoveryEmail: "",
      twoFA: false,
      creationDate: "",
      taxForm: "",
      location: "OFFICE",
      linkedChannelUrl: "",
      status: "ACTIVE",
      reminderDate: "",
      note: "",
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Thêm Network mới</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>PUB-ID</Form.Label>
                <Form.Control
                  type="text"
                  name="pubId"
                  value={formData.pubId}
                  onChange={handleChange}
                  placeholder="pub-1234567890123456"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Profile AdSense ID</Form.Label>
                <Form.Control
                  type="text"
                  name="profileAdsenseId"
                  value={formData.profileAdsenseId}
                  onChange={handleChange}
                  placeholder="pub-1234567890123456"
                />
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Employment (Nhân viên phụ trách)</Form.Label>
                <Form.Control
                  type="text"
                  name="employment"
                  value={formData.employment}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="email@gmail.com"
                />
              </Form.Group>
            </Col>

            {/* PHẦN THAY ĐỔI: Password với nút Hiện/Ẩn */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    // 3. Thay đổi type dựa trên state showPassword
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>

            {/* ... Các trường còn lại giữ nguyên ... */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Recovery Email</Form.Label>
                <Form.Control
                  type="email"
                  name="recoveryEmail"
                  value={formData.recoveryEmail}
                  onChange={handleChange}
                  placeholder="recovery@gmail.com"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3 d-flex align-items-center">
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="twoFA"
                  label="Bật xác thực 2 yếu tố (2FA)"
                  checked={formData.twoFA}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Ngày tạo Profile AdSense</Form.Label>
                <Form.Control
                  type="date"
                  name="creationDate"
                  value={formData.creationDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Tax Form</Form.Label>
                <Form.Control
                  type="text"
                  name="taxForm"
                  value={formData.taxForm}
                  onChange={handleChange}
                  placeholder="W-8BEN, W-9, etc."
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Vị trí làm việc</Form.Label>
                <Form.Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="HOME">HOME</option>
                  <option value="OFFICE">OFFICE</option>
                  <option value="OTHER">OTHER</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Linked Channel URL</Form.Label>
                <Form.Control
                  type="url"
                  name="linkedChannelUrl"
                  value={formData.linkedChannelUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@channelname"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="LOCKED">LOCKED</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Ngày kiểm tra (Reminder)</Form.Label>
                <Form.Control
                  type="date"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Đang tạo...
              </>
            ) : (
              "Tạo Network"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddNetworkModal;
