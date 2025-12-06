import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

function UserModal({ show, onHide, user, onSaved }) {
  const [formData, setFormData] = useState({
    fullName: "",
    personalEmail: "",
    role: "EMPLOYEE",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        personalEmail: user.personalEmail || "",
        role: user.role || "EMPLOYEE",
        status: user.status || "ACTIVE",
      });
    } else {
      setFormData({
        fullName: "",
        personalEmail: "",
        role: "EMPLOYEE",
        status: "ACTIVE",
      });
    }
    setError(null);
  }, [user, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.personalEmail) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      if (user) {
        // Update existing user (you'll need to implement this endpoint)
        // await axios.put(`http://localhost:9999/user/update/${user._id}`, formData);
        alert("Chức năng cập nhật user chưa được implement trong backend");
      } else {
        // Create new user
        await axios.post("http://localhost:9999/user/create-new", formData);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {user ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Họ tên *</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ tên"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email cá nhân *</Form.Label>
            <Form.Control
              type="email"
              name="personalEmail"
              value={formData.personalEmail}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Vai trò</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
              <option value="ADMIN">ADMIN</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="QUIT">QUIT</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : user ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default UserModal;
