import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Badge } from "react-bootstrap";

function BulkAssignUserModal({
  show,
  onHide,
  onAssignToUser,
  selectedCount,
  users,
}) {
  const [selectedUser, setSelectedUser] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setSelectedUser("");
      setError("");
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedUser) {
      setError("Vui lòng chọn nhân viên");
      return;
    }
    onAssignToUser(selectedUser);
  };

  const handleClose = () => {
    setSelectedUser("");
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Gán hàng loạt Resources cho Nhân viên</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Alert variant="primary" className="mb-3">
            <div className="d-flex align-items-center justify-content-between">
              <span>Số lượng resources đã chọn:</span>
              <Badge bg="white" text="primary" className="fs-5">
                {selectedCount}
              </Badge>
            </div>
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>
              Chọn nhân viên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setError("");
              }}
              isInvalid={!!error}
            >
              <option value="">-- Chọn nhân viên --</option>
              {users
                ?.filter((user) => user.status === "ACTIVE")
                .map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName} ({user.phoneNumber})
                    {user.role && ` - ${user.role}`}
                  </option>
                ))}
            </Form.Select>
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </Form.Group>

          <Alert variant="warning">
            <small>
              <strong>Lưu ý:</strong> Sau khi gán, trạng thái của{" "}
              {selectedCount} resources sẽ tự động chuyển thành "Đang sử dụng"
            </small>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Gán {selectedCount} Resources
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default BulkAssignUserModal;
