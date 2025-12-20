import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

import config from "../../../configs/api";

function TaskModal({ show, onHide, task, users, teams, onSaved }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedToUser: "",
    assignedToTeam: "",
    status: "PENDING",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignType, setAssignType] = useState("user"); // 'user' or 'team'

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignedToUser: task.assignedToUser?._id || "",
        assignedToTeam: task.assignedToTeam?._id || "",
        status: task.status || "PENDING",
        deadline: task.deadline ? task.deadline.split("T")[0] : "",
      });
      setAssignType(task.assignedToUser ? "user" : "team");
    } else {
      setFormData({
        title: "",
        description: "",
        assignedToUser: "",
        assignedToTeam: "",
        status: "PENDING",
        deadline: "",
      });
      setAssignType("user");
    }
    setError(null);
  }, [task, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title) {
      setError("Vui lòng nhập tiêu đề công việc");
      return;
    }

    if (assignType === "user" && !formData.assignedToUser) {
      setError("Vui lòng chọn nhân viên");
      return;
    }

    if (assignType === "team" && !formData.assignedToTeam) {
      setError("Vui lòng chọn team");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        assignedToUser: assignType === "user" ? formData.assignedToUser : null,
        assignedToTeam: assignType === "team" ? formData.assignedToTeam : null,
        status: formData.status,
        deadline: formData.deadline || null,
      };

      if (task) {
        // Update task
        await axios.put(
          `${config.backendBase}/task/update/${task._id}`,
          payload
        );
      } else {
        // Create new task
        await axios.post(`${config.backendBase}/task/create-new`, payload);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = users?.filter((u) => u.status === "ACTIVE") || [];
  const activeTeams = teams?.filter((t) => t.status === "AVAILABLE") || [];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {task ? "Chỉnh sửa công việc" : "Tạo công việc mới"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề công việc *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề công việc"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả chi tiết công việc..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gán cho *</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Nhân viên"
                name="assignType"
                value="user"
                checked={assignType === "user"}
                onChange={(e) => setAssignType(e.target.value)}
              />
              <Form.Check
                inline
                type="radio"
                label="Team"
                name="assignType"
                value="team"
                checked={assignType === "team"}
                onChange={(e) => setAssignType(e.target.value)}
              />
            </div>
          </Form.Group>

          {assignType === "user" && (
            <Form.Group className="mb-3">
              <Form.Label>Chọn nhân viên *</Form.Label>
              <Form.Select
                name="assignedToUser"
                value={formData.assignedToUser}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn nhân viên --</option>
                {activeUsers.map((user) => (
                  <option
                    key={user._id || user.userId}
                    value={user._id || user.userId}
                  >
                    {user.fullName} - {user.role}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {assignType === "team" && (
            <Form.Group className="mb-3">
              <Form.Label>Chọn team *</Form.Label>
              <Form.Select
                name="assignedToTeam"
                value={formData.assignedToTeam}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn team --</option>
                {activeTeams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="PENDING">Chờ xử lý</option>
              <option value="IN_PROGRESS">Đang làm</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="WAITING">Đang chờ</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deadline</Form.Label>
            <Form.Control
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : task ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default TaskModal;
