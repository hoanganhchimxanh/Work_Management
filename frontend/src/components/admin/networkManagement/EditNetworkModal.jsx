import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import config from "../../../configs/api";

const EditNetworkModal = ({ show, onHide, network, onSuccess }) => {
  const [formData, setFormData] = useState({
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
    assignedUser: "",
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load data khi modal mở và có network
  useEffect(() => {
    if (show && network) {
      setFormData({
        profileAdsenseId: network.profileAdsenseId || "",
        emailAddress: network.emailAddress || "",
        recoveryEmail: network.recoveryEmail || "",
        creationDate: network.creationDate
          ? new Date(network.creationDate).toISOString().split("T")[0]
          : "",
        taxName: network.taxName || "",
        location: network.location || "OFFICE",
        linkedChannelUrl: network.linkedChannelUrl || "",
        emailChannel: network.emailChannel || "",
        channelJoinDate: network.channelJoinDate
          ? new Date(network.channelJoinDate).toISOString().split("T")[0]
          : "",
        country: network.country || "VN",
        status: network.status || "ACTIVE",
        reminderDate: network.reminderDate
          ? new Date(network.reminderDate).toISOString().split("T")[0]
          : "",
        note: network.note || "",
        assignedUser: network.assignedUser?._id || "",
      });

      fetchUsers();
    }
  }, [show, network]);

  // Fetch danh sách users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await axios.get(`${config.backendBase}/user/get-all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (data.success) {
        setUsers(data.data.filter((user) => user.status === "ACTIVE"));
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.profileAdsenseId.trim()) {
      setError("Profile AdSense ID là bắt buộc!");
      return;
    }

    if (!formData.emailAddress.trim()) {
      setError("Email Address là bắt buộc!");
      return;
    }

    if (!formData.creationDate) {
      setError("Ngày tạo là bắt buộc!");
      return;
    }

    if (!formData.assignedUser) {
      setError("Vui lòng chọn nhân viên quản lý!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        // Chuyển empty string thành null cho các trường date
        channelJoinDate: formData.channelJoinDate || null,
        reminderDate: formData.reminderDate || null,
      };

      const { data } = await axios.put(
        `${config.backendBase}/network/update/${network._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        onSuccess?.();
        onHide();
      } else {
        setError(data.message || "Cập nhật thất bại!");
      }
    } catch (err) {
      console.error("Update network error:", err);
      setError(err.response?.data?.message || "Lỗi khi cập nhật network!");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setFormData({
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
      assignedUser: "",
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa Network</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Row>
            {/* Nhân viên quản lý */}
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Nhân viên quản lý <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="assignedUser"
                  value={formData.assignedUser}
                  onChange={handleChange}
                  required
                  disabled={loadingUsers}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.fullName} ({user.personalEmail})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Profile AdSense ID */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Profile AdSense ID <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="profileAdsenseId"
                  value={formData.profileAdsenseId}
                  onChange={handleChange}
                  placeholder="pub-1234567890123456"
                  required
                />
              </Form.Group>
            </Col>

            {/* Email Address */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Email Address <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="email@gmail.com"
                  required
                />
              </Form.Group>
            </Col>

            {/* Recovery Email */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Recovery Email</Form.Label>
                <Form.Control
                  type="email"
                  name="recoveryEmail"
                  value={formData.recoveryEmail}
                  onChange={handleChange}
                  placeholder="recovery@gmail.com"
                />
              </Form.Group>
            </Col>

            {/* Ngày tạo Email */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Ngày tạo Email <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="date"
                  name="creationDate"
                  value={formData.creationDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            {/* Tax Name */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Tên thuế</Form.Label>
                <Form.Control
                  type="text"
                  name="taxName"
                  value={formData.taxName}
                  onChange={handleChange}
                  placeholder="NGUYEN VAN A"
                />
              </Form.Group>
            </Col>

            {/* Location */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Vị trí làm việc</Form.Label>
                <Form.Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="HOME">HOME</option>
                  <option value="OFFICE">OFFICE</option>
                  <option value="OTHER">OTHER</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Linked Channel URL */}
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Link kênh YouTube</Form.Label>
                <Form.Control
                  type="url"
                  name="linkedChannelUrl"
                  value={formData.linkedChannelUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@channelname"
                />
              </Form.Group>
            </Col>

            {/* Email Channel */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Email brand account của kênh</Form.Label>
                <Form.Control
                  type="email"
                  name="emailChannel"
                  value={formData.emailChannel}
                  onChange={handleChange}
                  placeholder="channel@gmail.com"
                />
              </Form.Group>
            </Col>

            {/* Channel Join Date */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Ngày tạo kênh</Form.Label>
                <Form.Control
                  type="date"
                  name="channelJoinDate"
                  value={formData.channelJoinDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Country */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Quốc gia</Form.Label>
                <Form.Control
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="VN"
                  maxLength={2}
                />
              </Form.Group>
            </Col>

            {/* Status */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="LOCKED">LOCKED</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Reminder Date */}
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Ngày kiểm tra (Reminder)</Form.Label>
                <Form.Control
                  type="date"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Note */}
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditNetworkModal;
