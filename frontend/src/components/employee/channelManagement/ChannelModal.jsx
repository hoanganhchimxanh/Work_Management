// ChannelModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";

function ChannelModal({ show, onHide, channel, onSaved }) {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    network: "",
    status: "ACTIVE",
  });

  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isEditMode = !!channel;

  useEffect(() => {
    if (show) {
      fetchNetworks();
      if (channel) {
        setFormData({
          name: channel.name || "",
          link: channel.link || "",
          network: channel.network?._id || "",
          status: channel.status || "ACTIVE",
        });
      } else {
        resetForm();
      }
    }
  }, [show, channel]);

  const fetchNetworks = async () => {
    try {
      const response = await axios.get("http://localhost:9999/network/get-all");
      setNetworks(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch networks:", err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      link: "",
      network: "",
      status: "ACTIVE",
    });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        ...formData,
        assignedUser: currentUser.userId,
        network: formData.network || null,
      };

      if (isEditMode) {
        await axios.put(
          `http://localhost:9999/channel/edit/${channel._id}`,
          payload
        );
      } else {
        await axios.post("http://localhost:9999/channel/add-new", payload);
      }

      onSaved();
      onHide();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Không thể ${isEditMode ? "cập nhật" : "thêm"} kênh!`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-youtube text-danger me-2"></i>
          {isEditMode ? "Chỉnh sửa kênh" : "Thêm kênh mới"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
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
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
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
                  Nhập URL đầy đủ của kênh YouTube
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Network</Form.Label>
                <Form.Select
                  name="network"
                  value={formData.network}
                  onChange={handleChange}
                >
                  <option value="">Chưa gán network</option>
                  {networks.map((network) => (
                    <option key={network._id} value={network._id}>
                      {network.profileAdsenseId} - {network.emailAddress}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
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
            </Col>
          </Row>

          <Alert variant="info" className="mb-0">
            <i className="bi bi-info-circle me-2"></i>
            <small>
              Kênh sẽ được tự động gán cho bạn. Bạn có thể thay đổi network và
              trạng thái sau khi tạo.
            </small>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                {isEditMode ? "Cập nhật" : "Thêm kênh"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ChannelModal;
