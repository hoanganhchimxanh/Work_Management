import React from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import useTaskModal from "../../../../hooks/admin/kpiTaskManagement/useTaskModal";

function TaskModal({ show, onHide, task, users, teams, onSaved }) {
  const {
    formData,
    loading,
    error,
    assignType,
    setAssignType,
    handleChange,
    handleSubmit,
  } = useTaskModal(task, show, onSaved);

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
