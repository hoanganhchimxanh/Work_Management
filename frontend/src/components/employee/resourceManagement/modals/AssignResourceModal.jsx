import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

function AssignResourceModal({
  show,
  onHide,
  onAssignToUser,
  onAssignToChannel,
  resource,
  users,
  channels,
}) {
  const [assignType, setAssignType] = useState("user"); // 'user' hoặc 'channel'
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setAssignType("user");
      setSelectedUser("");
      setSelectedChannel("");
      setError("");
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (assignType === "user") {
      if (!selectedUser) {
        setError("Vui lòng chọn nhân viên");
        return;
      }
      onAssignToUser(resource._id, selectedUser);
    } else {
      if (!selectedChannel) {
        setError("Vui lòng chọn kênh");
        return;
      }
      onAssignToChannel(resource._id, selectedChannel);
    }
  };

  const handleClose = () => {
    setAssignType("user");
    setSelectedUser("");
    setSelectedChannel("");
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Gán Resource</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {resource && (
            <Alert variant="info" className="mb-3">
              <strong>Resource:</strong> {resource.email}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Loại gán</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Gán cho nhân viên"
                name="assignType"
                id="assignType-user"
                checked={assignType === "user"}
                onChange={() => {
                  setAssignType("user");
                  setError("");
                }}
              />
              <Form.Check
                inline
                type="radio"
                label="Gán cho kênh"
                name="assignType"
                id="assignType-channel"
                checked={assignType === "channel"}
                onChange={() => {
                  setAssignType("channel");
                  setError("");
                }}
              />
            </div>
          </Form.Group>

          {assignType === "user" ? (
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
                isInvalid={!!error && assignType === "user"}
              >
                <option value="">-- Chọn nhân viên --</option>
                {users
                  ?.filter((user) => user.status === "ACTIVE")
                  .map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName} ({user.phoneNumber})
                      {user.role && ` - ${user.role}`}
                    </option>
                  ))}
              </Form.Select>
              {error && assignType === "user" && (
                <div className="invalid-feedback d-block">{error}</div>
              )}
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>
                Chọn kênh <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={selectedChannel}
                onChange={(e) => {
                  setSelectedChannel(e.target.value);
                  setError("");
                }}
                isInvalid={!!error && assignType === "channel"}
              >
                <option value="">-- Chọn kênh --</option>
                {channels
                  ?.filter((channel) => channel.status === "ACTIVE")
                  .map((channel) => (
                    <option key={channel._id} value={channel._id}>
                      {channel.name}
                      {channel.assignedUser &&
                        ` (Quản lý: ${channel.assignedUser.fullName})`}
                    </option>
                  ))}
              </Form.Select>
              {error && assignType === "channel" && (
                <div className="invalid-feedback d-block">{error}</div>
              )}
            </Form.Group>
          )}

          <Alert variant="warning">
            <small>
              Sau khi gán, trạng thái resource sẽ tự động chuyển thành "Đang sử
              dụng"
            </small>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Gán Resource
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AssignResourceModal;
