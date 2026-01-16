import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

import config from "../../../configs/api";

function UserModal({ show, onHide, user, teams, onSaved }) {
  const [formData, setFormData] = useState({
    fullName: "",
    personalEmail: "",
    role: "EMPLOYEE",
    team: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        personalEmail: user.personalEmail || "",
        role: user.role || "EMPLOYEE",
        team: user.team || "",
      });
    } else {
      setFormData({
        fullName: "",
        personalEmail: "",
        role: "EMPLOYEE",
        team: "",
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

      const payload = {
        ...formData,
        team: formData.team || null,
      };

      if (user) {
        // Update existing user
        const response = await axios.put(
          `${config.backendBase}/user/update/${user.userId}`,
          payload
        );
        console.log("Update response:", response.data);
      } else {
        // Create new user (by admin)
        const response = await axios.post(
          `${config.backendBase}/user/create-by-admin`,
          payload
        );
        console.log("Create response:", response.data);
      }

      // Call onSaved after successful operation
      if (onSaved) {
        await onSaved();
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      console.error("Error response:", err.response);
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
              disabled={!!user}
            />
            {user && (
              <Form.Text className="text-muted">
                Email không thể thay đổi sau khi tạo
              </Form.Text>
            )}
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
            <Form.Label>Nhóm</Form.Label>
            <Form.Select
              name="team"
              value={formData.team}
              onChange={handleChange}
            >
              <option value="">-- Không thuộc nhóm nào --</option>
              {teams &&
                teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          {!user && (
            <Alert variant="info">
              <small>
                <strong>Lưu ý:</strong> Sau khi tạo user, hệ thống sẽ tự động
                gửi tài khoản đăng nhập mới cho người dùng qua gmail cá nhân đã
                nhập.
              </small>
            </Alert>
          )}
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
