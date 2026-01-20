import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

function CreateResourceModal({ show, onHide, onCreate, users, channels }) {
  const [formData, setFormData] = useState({
    email: "",
    defaultPassword: "",
    recoveryEmail: "",
    status: "AVAILABLE",
    assignedUser: "",
    assignedChannel: "",
    note: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error khi user nhập lại
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.defaultPassword.trim()) {
      newErrors.defaultPassword = "Mật khẩu là bắt buộc";
    } else if (formData.defaultPassword.length < 6) {
      newErrors.defaultPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.recoveryEmail.trim()) {
      newErrors.recoveryEmail = "Recovery Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recoveryEmail)) {
      newErrors.recoveryEmail = "Recovery Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Chuyển đổi empty string thành null cho assignedUser và assignedChannel
    const dataToSubmit = {
      ...formData,
      assignedUser: formData.assignedUser || null,
      assignedChannel: formData.assignedChannel || null,
    };

    onCreate(dataToSubmit);
  };

  const handleClose = () => {
    setFormData({
      email: "",
      defaultPassword: "",
      recoveryEmail: "",
      status: "AVAILABLE",
      assignedUser: "",
      assignedChannel: "",
      note: "",
    });
    setErrors({});
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Tạo Resource mới</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              placeholder="example@gmail.com"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Mật khẩu mặc định <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="password"
              name="defaultPassword"
              value={formData.defaultPassword}
              onChange={handleChange}
              isInvalid={!!errors.defaultPassword}
              placeholder="Nhập mật khẩu"
            />
            <Form.Control.Feedback type="invalid">
              {errors.defaultPassword}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Mật khẩu này sẽ được mã hóa và lưu trữ an toàn
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Recovery Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="recoveryEmail"
              value={formData.recoveryEmail}
              onChange={handleChange}
              isInvalid={!!errors.recoveryEmail}
              placeholder="recovery@gmail.com"
            />
            <Form.Control.Feedback type="invalid">
              {errors.recoveryEmail}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="AVAILABLE">Khả dụng</option>
              <option value="ASSIGNED">Đang sử dụng</option>
              <option value="DISABLED">Vô hiệu hóa</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gán cho nhân viên</Form.Label>
            <Form.Select
              name="assignedUser"
              value={formData.assignedUser}
              onChange={handleChange}
            >
              <option value="">-- Chọn nhân viên --</option>
              {users?.map((user) => (
                <option
                  key={user.userId || user._id}
                  value={user.userId || user._id}
                >
                  {user.fullName} ({user.phoneNumber})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gán cho kênh</Form.Label>
            <Form.Select
              name="assignedChannel"
              value={formData.assignedChannel}
              onChange={handleChange}
            >
              <option value="">-- Chọn kênh --</option>
              {channels?.map((channel) => (
                <option key={channel._id} value={channel._id}>
                  {channel.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Nhập ghi chú (nếu có)"
            />
          </Form.Group>

          {(formData.assignedUser || formData.assignedChannel) && (
            <Alert variant="info" className="mb-0">
              <small>
                Nếu gán cho nhân viên hoặc kênh, trạng thái sẽ tự động chuyển
                thành "Đang sử dụng"
              </small>
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Tạo Resource
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CreateResourceModal;
