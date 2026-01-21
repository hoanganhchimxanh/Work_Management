import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";

function ManageChannelModal({
  show,
  onHide,
  onAssignChannel,
  resource,
  channels,
}) {
  const [selectedChannel, setSelectedChannel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (show && resource) {
      // Nếu resource đã có kênh, chọn sẵn kênh đó
      setSelectedChannel(resource.assignedChannel?._id || "");
      setError("");
    }
  }, [show, resource]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedChannel) {
      setError("Vui lòng chọn kênh");
      return;
    }

    onAssignChannel(resource._id, selectedChannel);
  };

  const handleClose = () => {
    setSelectedChannel("");
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {resource?.assignedChannel ? "Đổi kênh" : "Gán kênh"} cho Resource
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {resource && (
            <Alert variant="info" className="mb-3">
              <div className="mb-2">
                <strong>Resource Email:</strong> {resource.email}
              </div>
              {resource.assignedChannel && (
                <div>
                  <strong>Kênh hiện tại:</strong>{" "}
                  {resource.assignedChannel.name}
                </div>
              )}
            </Alert>
          )}

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
              isInvalid={!!error}
            >
              <option value="">-- Chọn kênh của bạn --</option>
              {channels
                ?.filter((channel) => channel.status === "ACTIVE")
                .map((channel) => (
                  <option key={channel._id} value={channel._id}>
                    {channel.name}
                    {channel.link && ` - ${channel.link}`}
                  </option>
                ))}
            </Form.Select>
            {error && <div className="invalid-feedback d-block">{error}</div>}
            <Form.Text className="text-muted">
              Chỉ hiển thị các kênh ACTIVE thuộc quyền quản lý của bạn
            </Form.Text>
          </Form.Group>

          {channels?.length === 0 && (
            <Alert variant="warning">
              Bạn chưa có kênh nào. Vui lòng tạo kênh trước khi gán cho
              resource.
            </Alert>
          )}

          <Alert variant="info">
            <small>
              <strong>Lưu ý:</strong> Khi gán kênh cho resource, resource này sẽ
              được sử dụng để quản lý hoặc tạo kênh YouTube tương ứng.
            </small>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={channels?.length === 0}
          >
            {resource?.assignedChannel ? "Đổi kênh" : "Gán kênh"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ManageChannelModal;
