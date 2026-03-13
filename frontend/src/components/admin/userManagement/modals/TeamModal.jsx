import React from "react";
import { Modal, Form, Button, Alert, Badge } from "react-bootstrap";
import useTeamModal from "../../../../hooks/admin/userManagement/useTeamModal";

function TeamModal({ show, onHide, team, users, onSaved }) {
  const {
    formData,
    loading,
    error,
    handleChange,
    handleMembersChange,
    handleSubmit,
  } = useTeamModal(team, show, onSaved);

  const availableUsers = users?.filter((u) => u.status === "ACTIVE") || [];
  const selectedLeader = availableUsers.find(
    (u) => (u._id || u.userId) === formData.leader,
  );

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {team ? "Chỉnh sửa đội nhóm" : "Tạo đội nhóm mới"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Tên nhóm *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên nhóm"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Leader</Form.Label>
            <Form.Select
              name="leader"
              value={formData.leader}
              onChange={handleChange}
            >
              <option value="">-- Chọn leader --</option>
              {availableUsers.map((user) => (
                <option
                  key={user._id || user.userId}
                  value={user._id || user.userId}
                >
                  {user.fullName} ({user.role})
                </option>
              ))}
            </Form.Select>
            {selectedLeader && (
              <Form.Text className="text-muted">
                Email: {selectedLeader.phoneNumber}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Thành viên</Form.Label>
            <Form.Select
              multiple
              name="members"
              value={formData.members}
              onChange={handleMembersChange}
              style={{ minHeight: "150px" }}
            >
              {availableUsers
                .filter((u) => (u._id || u.userId) !== formData.leader)
                .map((user) => (
                  <option
                    key={user._id || user.userId}
                    value={user._id || user.userId}
                  >
                    {user.fullName} - {user.role}
                  </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Giữ Ctrl (hoặc Cmd) để chọn nhiều thành viên. Leader sẽ tự động
              được loại khỏi danh sách members.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </Form.Select>
          </Form.Group>

          {formData.members.length > 0 && (
            <div>
              <strong>Đã chọn {formData.members.length} thành viên:</strong>
              <div className="mt-2">
                {formData.members.map((memberId) => {
                  const member = users?.find(
                    (u) => (u._id || u.userId) === memberId,
                  );
                  return member ? (
                    <Badge key={memberId} bg="info" className="me-2 mb-2">
                      {member.fullName}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : team ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default TeamModal;
