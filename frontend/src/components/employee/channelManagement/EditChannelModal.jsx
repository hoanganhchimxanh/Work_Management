import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

function EditChannelModal({ show, onHide, onSubmit, channel }) {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    status: "ACTIVE",
    isBrandAccount: false,
    isMonetized: false,
    monetizeDate: "",
  });
  const [error, setError] = useState("");

  // Load channel data when modal opens
  useEffect(() => {
    if (!channel) return;

    setFormData({
      name: channel.name ?? "",
      link: channel.link ?? "",
      status: channel.status ?? "ACTIVE",
      isBrandAccount: Boolean(channel.isBrandAccount),
      isMonetized: Boolean(channel.isMonetized),
      monetizeDate: channel.monetizeDate
        ? new Date(channel.monetizeDate).toISOString().split("T")[0]
        : "",
    });
  }, [channel]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validate
    if (!formData.name || !formData.link) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Check YouTube link format
    if (!formData.link.includes("youtube.com")) {
      setError("Link kênh không hợp lệ!");
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      monetizeDate: formData.monetizeDate || null,
    };

    onSubmit(channel._id, submitData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      link: "",
      status: "ACTIVE",
      isBrandAccount: false,
      isMonetized: false,
      monetizeDate: "",
    });
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa thông tin kênh</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="editChannelName">
            <Form.Label>
              Tên kênh <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên kênh YouTube"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editChannelLink">
            <Form.Label>
              Link kênh <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://youtube.com/@channelname"
              required
            />
            <Form.Text className="text-muted">
              Ví dụ: https://youtube.com/@channelname
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="editChannelStatus">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="HIDDEN">Ẩn</option>
              <option value="LOCKED">Khóa</option>
              <option value="STRIKED">Vi phạm</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="editIsBrandAccount">
            <Form.Check
              type="checkbox"
              name="isBrandAccount"
              label="Đây là Brand Account"
              checked={formData.isBrandAccount}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editIsMonetized">
            <Form.Check
              type="checkbox"
              name="isMonetized"
              label="Đã bật kiếm tiền (BKT)"
              checked={formData.isMonetized}
              onChange={handleChange}
            />
          </Form.Group>

          {formData.isMonetized && (
            <Form.Group className="mb-3" controlId="editMonetizeDate">
              <Form.Label>Ngày bật kiếm tiền</Form.Label>
              <Form.Control
                type="date"
                name="monetizeDate"
                value={formData.monetizeDate}
                onChange={handleChange}
              />
            </Form.Group>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditChannelModal;
