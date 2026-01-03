import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Badge } from "react-bootstrap";
import { PersonFill } from "react-bootstrap-icons";
import config from "../../../configs/api";
import axios from "axios";

function AssignBatchToUserModal({ show, onHide, batch, onAssign }) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show) {
      fetchUsers();
      setSelectedUserId("");
      setError(null);
    }
  }, [show]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.backendBase}/user/get-all`);
      // Lọc chỉ lấy user có role EMPLOYEE và status ACTIVE
      const activeUsers = (response.data.data || []).filter(
        (user) => user.role === "EMPLOYEE" && user.status === "ACTIVE"
      );
      setUsers(activeUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      setError("Vui lòng chọn nhân viên");
      return;
    }

    onAssign(selectedUserId);
  };

  if (!batch) return null;

  const availableResourcesCount =
    batch.resources?.filter((r) => r.status === "AVAILABLE").length || 0;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <PersonFill className="me-2" />
          Gán Batch cho Nhân viên
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="mb-4 p-3 bg-light rounded">
          <strong>Batch:</strong> {batch.excelFileName}
          <br />
          <strong>Tổng resources:</strong>{" "}
          <Badge bg="info">{batch.resources?.length || 0}</Badge>
          <br />
          <strong>Resources khả dụng:</strong>{" "}
          <Badge bg="success">{availableResourcesCount}</Badge>
          <br />
          <small className="text-muted">
            (Chỉ resources có trạng thái "Khả dụng" sẽ được gán)
          </small>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Chọn nhân viên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loading}
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.fullName} - {user.personalEmail}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Alert variant="info" className="mb-0">
            <small>
              <strong>Lưu ý:</strong> Hành động này sẽ:
              <ul className="mb-0 mt-2">
                <li>Gán batch cho nhân viên được chọn</li>
                <li>
                  Gán tất cả {availableResourcesCount} resources khả dụng cho
                  nhân viên
                </li>
                <li>Chuyển trạng thái batch thành ACTIVE</li>
              </ul>
            </small>
          </Alert>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedUserId || loading}
        >
          Xác nhận gán
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AssignBatchToUserModal;
