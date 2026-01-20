import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert, Badge } from "react-bootstrap";
import { PencilSquare } from "react-bootstrap-icons";
import config from "../../../configs/api";
import axios from "axios";

function EditResourceBatchModal({ show, onHide, batchId, onBatchUpdated }) {
  const [batch, setBatch] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    excelFileName: "",
    assignedUser: "",
    status: "ACTIVE",
  });

  // Load batch data và users khi modal mở
  useEffect(() => {
    if (show && batchId) {
      fetchBatchDetail();
      fetchUsers();
    } else {
      setBatch(null);
      setFormData({
        excelFileName: "",
        assignedUser: "",
        status: "ACTIVE",
      });
    }
  }, [show, batchId]);

  const fetchBatchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${config.backendBase}/resource-batch/get-by-id/${batchId}`,
      );
      const data = response.data.data;

      setBatch(data);
      setFormData({
        excelFileName: data.excelFileName || "",
        assignedUser: data.assignedUser?._id || "",
        status: data.status || "ACTIVE",
      });
    } catch (err) {
      console.error("Error fetching batch:", err);
      setError("Không thể tải thông tin batch");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${config.backendBase}/user/get-all`);
      setUsers(response.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.excelFileName.trim()) {
      setError("Tên file Excel không được để trống");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const originalAssignedUser = batch.assignedUser?._id || "";
      const newAssignedUser = formData.assignedUser || null;

      // Xử lý thay đổi assignedUser
      if (newAssignedUser !== originalAssignedUser) {
        if (newAssignedUser) {
          // Gọi API assign cho user mới
          await axios.post(
            `${config.backendBase}/resource-batch/assign/${batchId}`,
            {
              userId: newAssignedUser,
              force: true, // Force để overwrite nếu cần, có thể thêm checkbox để chọn
            },
          );
        } else {
          // Unassign: Cập nhật batch trước
          await axios.put(
            `${config.backendBase}/resource-batch/update/${batchId}`,
            {
              assignedUser: null,
            },
          );

          // Sau đó cập nhật tất cả resources (loop vì chưa có bulk API)
          for (const resource of batch.resources) {
            await axios.put(
              `${config.backendBase}/resource/update/${resource._id}`, // Giả định có route update resource
              {
                assignedUser: null,
                status: "AVAILABLE",
              },
            );
          }
        }
      }

      // Cập nhật các trường khác (excelFileName và status)
      const updatePayload = {
        excelFileName: formData.excelFileName.trim(),
        status: formData.status,
      };

      await axios.put(
        `${config.backendBase}/resource-batch/update/${batchId}`,
        updatePayload,
      );

      // Gọi callback để refresh table ở parent
      if (onBatchUpdated) onBatchUpdated();

      onHide(); // Đóng modal
    } catch (err) {
      console.error("Error updating batch:", err);
      setError(
        err.response?.data?.message ||
          "Cập nhật batch thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <PencilSquare className="me-2" />
          Chỉnh sửa Batch Tài nguyên
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Đang tải thông tin...</p>
          </div>
        )}

        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && batch && (
          <>
            <div className="mb-4 p-3 bg-light rounded">
              <small className="text-muted">Thông tin hiện tại:</small>
              <div className="mt-2">
                <strong>File:</strong> {batch.excelFileName}
                <br />
                <strong>Người quản lý:</strong>{" "}
                {batch.assignedUser?.fullName || (
                  <span className="text-muted">Chưa gán</span>
                )}
                <br />
                <strong>Số lượng tài nguyên:</strong>{" "}
                <Badge bg="info">{batch.resources?.length || 0}</Badge>
                <br />
                <strong>Trạng thái:</strong>{" "}
                <Badge
                  bg={
                    batch.status === "ACTIVE"
                      ? "success"
                      : batch.status === "PENDING"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {batch.status}
                </Badge>
              </div>
            </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Tên File Excel <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="excelFileName"
                  value={formData.excelFileName}
                  onChange={handleChange}
                  required
                  placeholder="Ví dụ: resource_batch_jan2026.xlsx"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Người quản lý (User)</Form.Label>
                <Form.Select
                  name="assignedUser"
                  value={formData.assignedUser}
                  onChange={handleChange}
                >
                  <option value="">-- Chưa gán --</option>
                  {users.map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.fullName} - {user.phoneNumber}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Để trống nếu không muốn gán người quản lý
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="ARCHIVED">Đã lưu trữ</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </>
        )}
      </Modal.Body>

      {!loading && batch && (
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={saving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}

export default EditResourceBatchModal;
