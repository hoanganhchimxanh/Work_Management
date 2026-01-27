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
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import {
  CheckCircleFill,
  XCircleFill,
  PlayCircleFill,
  PauseCircleFill,
} from "react-bootstrap-icons";

import useTaskFilters from "../../../../hooks/employee/kpiTaskManagement/useTaskFilters";

function EmployeeTaskTable({ tasks, loading, onRefresh, onUpdateStatus }) {
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Use filters hook
  const {
    filterStatus,
    setFilterStatus,
    filterSort,
    setFilterSort,
    searchTerm,
    setSearchTerm,
    filteredTasks,
  } = useTaskFilters(tasks);

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "warning",
      IN_PROGRESS: "primary",
      COMPLETED: "success",
      WAITING: "secondary",
    };
    const labels = {
      PENDING: "Chờ xử lý",
      IN_PROGRESS: "Đang làm",
      COMPLETED: "Hoàn thành",
      WAITING: "Đang chờ",
    };
    return <Badge bg={variants[status] || "secondary"}>{labels[status]}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await onUpdateStatus(taskId, newStatus);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Render action buttons based on current status
  const renderActionButtons = (task) => {
    const isUpdating = updatingTaskId === task._id;

    if (isUpdating) {
      return (
        <Spinner animation="border" size="sm" variant="primary">
          <span className="visually-hidden">Đang cập nhật...</span>
        </Spinner>
      );
    }

    switch (task.status) {
      case "PENDING":
        return (
          <ButtonGroup size="sm">
            <Button
              variant="success"
              onClick={() => handleStatusUpdate(task._id, "IN_PROGRESS")}
              title="Chấp nhận và bắt đầu"
            >
              <CheckCircleFill className="me-1" />
              Chấp nhận
            </Button>
            <Button
              variant="danger"
              onClick={() => handleStatusUpdate(task._id, "WAITING")}
              title="Từ chối / Đang chờ"
            >
              <XCircleFill className="me-1" />
              Từ chối
            </Button>
          </ButtonGroup>
        );

      case "IN_PROGRESS":
        return (
          <Dropdown as={ButtonGroup} size="sm">
            <Button
              variant="success"
              onClick={() => handleStatusUpdate(task._id, "COMPLETED")}
              title="Đánh dấu hoàn thành"
            >
              <CheckCircleFill className="me-1" />
              Hoàn thành
            </Button>
            <Dropdown.Toggle split variant="success" />
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => handleStatusUpdate(task._id, "WAITING")}
              >
                <PauseCircleFill className="me-2" />
                Tạm dừng
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        );

      case "WAITING":
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusUpdate(task._id, "IN_PROGRESS")}
            title="Tiếp tục làm việc"
          >
            <PlayCircleFill className="me-1" />
            Tiếp tục
          </Button>
        );

      case "COMPLETED":
        return (
          <Badge bg="success" className="px-3 py-2">
            <CheckCircleFill className="me-1" />
            Đã hoàn thành
          </Badge>
        );

      default:
        return null;
    }
  };

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
                placeholder="Tên công việc..."
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

      <div className="mb-3">
        <small className="text-muted">
          Hiển thị {filteredTasks.length} / {tasks.length} công việc
          {filterStatus !== "ALL" && ` (Trạng thái: ${filterStatus})`}
        </small>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Tên công việc</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Deadline</th>
              <th>Người giao</th>
              <th className="text-center">Hành động</th>
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
                  <td>{getStatusBadge(task.status)}</td>
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
                    {task.assignedToTeam ? (
                      <Badge bg="primary">{task.assignedToTeam.name}</Badge>
                    ) : (
                      <span className="text-muted">Admin</span>
                    )}
                  </td>
                  <td className="text-center">{renderActionButtons(task)}</td>
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

export default EmployeeTaskTable;
