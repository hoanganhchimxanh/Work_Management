// src/pages/NetworkManagement/components/NetworkFormModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const NetworkFormModal = ({ show, network, users, onHide, onSave }) => {
  const [formData, setFormData] = useState({
    assignedUser: "",
    profileAdsenseId: "",
    emailAddress: "",
    recoveryEmail: "",
    creationDate: "",
    taxName: "",
    location: "OFFICE",
    linkedChannelUrl: "",
    emailChannel: "",
    channelJoinDate: "",
    country: "VN",
    status: "ACTIVE",
    reminderDate: "",
    note: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (network) {
      setFormData({
        assignedUser: network.assignedUser?._id || "",
        profileAdsenseId: network.profileAdsenseId || "",
        emailAddress: network.emailAddress || "",
        recoveryEmail: network.recoveryEmail || "",
        creationDate: network.creationDate
          ? network.creationDate.split("T")[0]
          : "",
        taxName: network.taxName || "",
        location: network.location || "OFFICE",
        linkedChannelUrl: network.linkedChannelUrl || "",
        emailChannel: network.emailChannel || "",
        channelJoinDate: network.channelJoinDate
          ? network.channelJoinDate.split("T")[0]
          : "",
        country: network.country || "VN",
        status: network.status || "ACTIVE",
        reminderDate: network.reminderDate
          ? network.reminderDate.split("T")[0]
          : "",
        note: network.note || "",
      });
    } else {
      setFormData({
        assignedUser: "",
        profileAdsenseId: "",
        emailAddress: "",
        recoveryEmail: "",
        creationDate: "",
        taxName: "",
        location: "OFFICE",
        linkedChannelUrl: "",
        emailChannel: "",
        channelJoinDate: "",
        country: "VN",
        status: "ACTIVE",
        reminderDate: "",
        note: "",
      });
    }
    setErrors({});
  }, [network, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.assignedUser)
      newErrors.assignedUser = "Vui lòng chọn nhân viên";
    if (!formData.profileAdsenseId)
      newErrors.profileAdsenseId = "Vui lòng nhập Profile AdSense ID";
    if (!formData.emailAddress) newErrors.emailAddress = "Vui lòng nhập email";
    if (!formData.creationDate)
      newErrors.creationDate = "Vui lòng chọn ngày tạo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {network ? "Chỉnh sửa Network" : "Thêm Network mới"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Nhân viên quản lý <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.assignedUser}
                  onChange={(e) => handleChange("assignedUser", e.target.value)}
                  isInvalid={!!errors.assignedUser}
                >
                  <option value="">Chọn nhân viên</option>
                  {users.map((user) => (
                    <option
                      key={user._id || user.userId}
                      value={user._id || user.userId}
                    >
                      {user.fullName} ({user.personalEmail})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.assignedUser}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Profile AdSense ID <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.profileAdsenseId}
                  onChange={(e) =>
                    handleChange("profileAdsenseId", e.target.value)
                  }
                  isInvalid={!!errors.profileAdsenseId}
                  placeholder="pub-1234567890123456"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.profileAdsenseId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleChange("emailAddress", e.target.value)}
                  isInvalid={!!errors.emailAddress}
                  placeholder="adsense@gmail.com"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.emailAddress}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Recovery Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.recoveryEmail}
                  onChange={(e) =>
                    handleChange("recoveryEmail", e.target.value)
                  }
                  placeholder="recovery@gmail.com"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Ngày tạo <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  value={formData.creationDate}
                  onChange={(e) => handleChange("creationDate", e.target.value)}
                  isInvalid={!!errors.creationDate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.creationDate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tax Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.taxName}
                  onChange={(e) => handleChange("taxName", e.target.value)}
                  placeholder="NGUYEN VAN A"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Vị trí làm việc</Form.Label>
                <Form.Select
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                >
                  <option value="HOME">Home</option>
                  <option value="OFFICE">Office</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Quốc gia</Form.Label>
                <Form.Select
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                >
                  <option value="VN">Vietnam</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="LOCKED">Locked</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Linked Channel URL</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.linkedChannelUrl}
                  onChange={(e) =>
                    handleChange("linkedChannelUrl", e.target.value)
                  }
                  placeholder="https://youtube.com/@channelname"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Channel</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.emailChannel}
                  onChange={(e) => handleChange("emailChannel", e.target.value)}
                  placeholder="channel@gmail.com"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Channel Join Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.channelJoinDate}
                  onChange={(e) =>
                    handleChange("channelJoinDate", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày nhắc nhở</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.reminderDate}
                  onChange={(e) => handleChange("reminderDate", e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="Nhập ghi chú..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            {network ? "Cập nhật" : "Thêm mới"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NetworkFormModal;
