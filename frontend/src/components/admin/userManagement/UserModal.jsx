import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

function UserModal({ show, onHide, user, teams, onSaved }) {
  const [formData, setFormData] = useState({
    fullName: "",
    personalEmail: "",
    role: "EMPLOYEE",
    status: "ACTIVE",
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
        status: user.status || "ACTIVE",
        team: user.team || "",
      });
    } else {
      setFormData({
        fullName: "",
        personalEmail: "",
        role: "EMPLOYEE",
        status: "ACTIVE",
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
        await axios.put(
          `http://localhost:9999/user/update/${user.userId}`,
          payload
        );
      } else {
        // Create new user
        await axios.post("http://localhost:9999/user/create-new", payload);
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

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="QUIT">QUIT</option>
            </Form.Select>
          </Form.Group>

          {!user && (
            <Alert variant="info">
              <small>
                <strong>Lưu ý:</strong> Sau khi tạo user, Admin cần tạo tài
                khoản đăng nhập riêng cho user này.
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
