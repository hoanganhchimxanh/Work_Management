import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Form,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import axios from "axios";

function TaskTable() {
  const [tasks, setTasks] = useState([]);
  const [statusDraft, setStatusDraft] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [error, setError] = useState(null);

  // Modal confirm update
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const token = localStorage.getItem("token");

  // Load tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("http://localhost:9999/task/my-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTasks(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải công việc!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Mở modal xác nhận
  const openConfirmModal = (taskId) => {
    setSelectedTaskId(taskId);
    setShowConfirm(true);
  };

  // Thực hiện cập nhật sau khi xác nhận
  const confirmUpdate = async () => {
    if (!selectedTaskId) return;

    try {
      setSaving((prev) => ({ ...prev, [selectedTaskId]: true }));

      await axios.patch(
        `http://localhost:9999/task/update-status/${selectedTaskId}`,
        { status: statusDraft[selectedTaskId] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowConfirm(false);
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Không thể cập nhật trạng thái!");
    } finally {
      setSaving((prev) => ({ ...prev, [selectedTaskId]: false }));
      setSelectedTaskId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Bảng công việc</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nội dung</th>
              <th>Deadline</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  Không có công việc nào
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>{formatDate(task.deadline)}</td>
                  <td>
                    <Form.Select
                      value={statusDraft[task._id] ?? task.status}
                      onChange={(e) =>
                        setStatusDraft({
                          ...statusDraft,
                          [task._id]: e.target.value,
                        })
                      }
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="WAITING">WAITING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      disabled={saving[task._id]}
                      onClick={() => openConfirmModal(task._id)}
                    >
                      {saving[task._id] ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        "Lưu"
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal xác nhận */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận cập nhật</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc muốn cập nhật trạng thái của công việc này không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={confirmUpdate}>
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default TaskTable;
