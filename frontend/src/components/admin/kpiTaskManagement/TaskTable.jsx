import React, { useState } from "react";
import {
  Table,
  Badge,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  InputGroup,
} from "react-bootstrap";
import axios from "axios";

import config from "../../../configs/api";

function TaskTable({ tasks, loading, onEdit, onRefresh, onDeleted }) {
  const [deleting, setDeleting] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa công việc này?")) {
      return;
    }

    try {
      setDeleting(taskId);
      await axios.delete(`${config.backendBase}/task/delete/${taskId}`);
      onDeleted();
    } catch (err) {
      alert(
        "Không thể xóa công việc: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingStatus(taskId);
      await axios.patch(`${config.backendBase}/task/update-status/${taskId}`, {
        status: newStatus,
      });
      onRefresh();
    } catch (err) {
      alert(
        "Không thể cập nhật trạng thái: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Filter và sort tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = tasks;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.assignedToUser?.fullName.toLowerCase().includes(searchLower) ||
          task.assignedToTeam?.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (filterSort === "NEWEST") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filterSort === "OLDEST") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (filterSort === "DEADLINE_ASC") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (filterSort === "DEADLINE_DESC") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(b.deadline) - new Date(a.deadline);
      }
      return 0;
    });

    return sorted;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Tìm kiếm</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tên công việc, người chịu trách nhiệm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Lọc theo trạng thái</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="IN_PROGRESS">Đang làm</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="WAITING">Đang chờ</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Sắp xếp</Form.Label>
            <Form.Select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="OLDEST">Cũ nhất</option>
              <option value="DEADLINE_ASC">Deadline gần nhất</option>
              <option value="DEADLINE_DESC">Deadline xa nhất</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Stats */}
      <div className="mb-3">
        <small className="text-muted">
          Hiển thị {filteredTasks.length} / {tasks.length} công việc
          {filterStatus !== "ALL" && ` (Trạng thái: ${filterStatus})`}
        </small>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Tên công việc</th>
              <th>Nội dung</th>
              <th>Người chịu trách nhiệm</th>
              <th>Trạng thái</th>
              <th>Deadline</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  {searchTerm || filterStatus !== "ALL"
                    ? "Không tìm thấy công việc phù hợp"
                    : "Chưa có công việc nào"}
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <strong>{task.title}</strong>
                  </td>
                  <td>
                    <div
                      className="text-truncate"
                      style={{ maxWidth: "300px" }}
                    >
                      {task.description || (
                        <span className="text-muted">N/A</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {task.assignedToUser ? (
                      <div>
                        <div>{task.assignedToUser.fullName}</div>
                        <small className="text-muted">
                          {task.assignedToUser.role}
                        </small>
                      </div>
                    ) : task.assignedToTeam ? (
                      <Badge bg="primary">{task.assignedToTeam.name}</Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      disabled={updatingStatus === task._id}
                    >
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="IN_PROGRESS">Đang làm</option>
                      <option value="COMPLETED">Hoàn thành</option>
                      <option value="WAITING">Đang chờ</option>
                    </Form.Select>
                  </td>
                  <td>
                    {task.deadline ? (
                      <div>
                        {formatDate(task.deadline)}
                        {new Date(task.deadline) < new Date() &&
                          task.status !== "COMPLETED" && (
                            <Badge bg="danger" className="ms-2">
                              Trễ hạn
                            </Badge>
                          )}
                      </div>
                    ) : (
                      <span className="text-muted">Không có</span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEdit(task)}
                      className="me-2"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(task._id)}
                      disabled={deleting === task._id}
                    >
                      {deleting === task._id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <i className="bi bi-trash"></i>
                      )}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <Button variant="outline-secondary" size="sm" onClick={onRefresh}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Làm mới
        </Button>
      </div>
    </>
  );
}

export default TaskTable;
