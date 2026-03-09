import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import config from "../../../../configs/api";

const EditNetworkModal = ({ show, onHide, network, onSubmit }) => {
  const [formData, setFormData] = useState({
    pubId: "",
    employment: "",
    profileAdsenseId: "",
    emailAddress: "",
    password: "",
    recoveryEmail: "",
    twoFA: false,
    creationDate: "",
    taxForm: "",
    location: "OFFICE",
    linkedChannelUrl: "",
    status: "ACTIVE",
    reminderDate: "",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State để lưu danh sách nhân viên
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Load data khi modal mở và có network
  useEffect(() => {
    if (show) {
      fetchEmployees();
    }
  }, [show]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${config.backendBase}/user/get-all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách nhân viên:", err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (show && network) {
      setFormData({
        pubId: network.pubId || "",
        employment:
          network.employment?._id ||
          network.employment?.userId ||
          network.employment ||
          "",
        profileAdsenseId: network.profileAdsenseId || "",
        emailAddress: network.emailAddress || "",
        password: network.password || "",
        recoveryEmail: network.recoveryEmail || "",
        twoFA: network.twoFA || false,
        creationDate: network.creationDate
          ? new Date(network.creationDate).toISOString().split("T")[0]
          : "",
        taxForm: network.taxForm || "",
        location: network.location || "OFFICE",
        linkedChannelUrl: network.linkedChannelUrl || "",
        status: network.status || "ACTIVE",
        reminderDate: network.reminderDate
          ? new Date(network.reminderDate).toISOString().split("T")[0]
          : "",
        note: network.note || "",
      });
    }
  }, [show, network]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

    setLoading(true);

    try {
      const payload = {
        ...formData,
        reminderDate: formData.reminderDate || null,
        creationDate: formData.creationDate || null,
      };

      await onSubmit(network._id, payload);

      onHide();
    } catch (err) {
      setError(err.message || "Lỗi khi cập nhật network!");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setFormData({
      pubId: "",
      employment: "",
      profileAdsenseId: "",
      emailAddress: "",
      password: "",
      recoveryEmail: "",
      twoFA: false,
      creationDate: "",
      taxForm: "",
      location: "OFFICE",
      linkedChannelUrl: "",
      status: "ACTIVE",
      reminderDate: "",
      note: "",
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
            {/* PUB-ID */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>PUB-ID</Form.Label>
                <Form.Control
                  type="text"
                  name="pubId"
                  value={formData.pubId}
                  onChange={handleChange}
                  placeholder="pub-1234567890123456"
                />
                <Form.Text className="text-muted">
                  Mã định danh duy nhất (unique)
                </Form.Text>
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

            {/* Employment */}
            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Employment (Nhân viên phụ trách)</Form.Label>
                <Form.Select
                  name="employment"
                  value={formData.employment}
                  onChange={handleChange}
                  disabled={loadingEmployees}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {employees.map((emp) => (
                    <option key={emp.userId} value={emp.userId}>
                      {emp.fullName} - {emp.phoneNumber}
                      {emp.team && ` (${emp.team})`}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Tên hoặc thông tin nhân viên quản lý
                </Form.Text>
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

            {/* Password */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <Form.Text className="text-muted">
                  Để trống nếu không muốn thay đổi
                </Form.Text>
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

            {/* 2FA */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="twoFA"
                  label="Bật xác thực 2 yếu tố (2FA)"
                  checked={formData.twoFA}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Ngày tạo */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Ngày tạo Profile AdSense</Form.Label>
                <Form.Control
                  type="date"
                  name="creationDate"
                  value={formData.creationDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            {/* Tax Form */}
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Tax Form</Form.Label>
                <Form.Control
                  type="text"
                  name="taxForm"
                  value={formData.taxForm}
                  onChange={handleChange}
                  placeholder="W-8BEN, W-9, etc."
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
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Linked Channel URL</Form.Label>
                <Form.Control
                  type="url"
                  name="linkedChannelUrl"
                  value={formData.linkedChannelUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@channelname"
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
