import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

function EditResourceModal({
  show,
  onHide,
  onUpdate,
  resource,
  users,
  channels,
}) {
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
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        email: resource.email || "",
        defaultPassword: "",
        recoveryEmail: resource.recoveryEmail || "",
        status: resource.status || "AVAILABLE",
        assignedUser: resource.assignedUser?._id || "",
        assignedChannel: resource.assignedChannel?._id || "",
        note: resource.note || "",
      });
      setChangePassword(false);
    }
  }, [resource]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    if (changePassword) {
      if (!formData.defaultPassword.trim()) {
        newErrors.defaultPassword = "Mật khẩu là bắt buộc";
      } else if (formData.defaultPassword.length < 6) {
        newErrors.defaultPassword = "Mật khẩu phải có ít nhất 6 ký tự";
      }
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

    const dataToSubmit = {
      email: formData.email,
      recoveryEmail: formData.recoveryEmail,
      status: formData.status,
      assignedUser: formData.assignedUser || null,
      assignedChannel: formData.assignedChannel || null,
      note: formData.note,
    };

    // Chỉ gửi password nếu user chọn đổi mật khẩu
    if (changePassword && formData.defaultPassword) {
      dataToSubmit.defaultPassword = formData.defaultPassword;
    }

    onUpdate(resource._id, dataToSubmit);
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
    setChangePassword(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa Resource</Modal.Title>
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
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Đổi mật khẩu"
              checked={changePassword}
              onChange={(e) => setChangePassword(e.target.checked)}
            />
          </Form.Group>

          {changePassword && (
            <Form.Group className="mb-3">
              <Form.Label>
                Mật khẩu mới <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="defaultPassword"
                value={formData.defaultPassword}
                onChange={handleChange}
                isInvalid={!!errors.defaultPassword}
                placeholder="Nhập mật khẩu mới"
              />
              <Form.Control.Feedback type="invalid">
                {errors.defaultPassword}
              </Form.Control.Feedback>
            </Form.Group>
          )}

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
                <option key={user._id} value={user._id}>
                  {user.fullName} ({user.personalEmail})
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
            />
          </Form.Group>

          {resource?.status === "ASSIGNED" && (
            <Alert variant="warning">
              <small>
                Resource này đang được gán. Thay đổi trạng thái có thể ảnh hưởng
                đến việc sử dụng.
              </small>
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Cập nhật
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditResourceModal;
