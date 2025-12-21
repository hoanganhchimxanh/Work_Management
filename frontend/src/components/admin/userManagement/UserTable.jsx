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
  Modal,
  Dropdown,
} from "react-bootstrap";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import axios from "axios";
import SendResourcesModal from "./SendResourcesModal";

import config from "../../../configs/api";

function UserTable({ users, loading, onEdit, onRefresh, teams }) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");

  // Approve modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [approveData, setApproveData] = useState({
    role: "EMPLOYEE",
    team: "",
  });
  const [approving, setApproving] = useState(false);

  // Send resources modal state
  const [showSendResourcesModal, setShowSendResourcesModal] = useState(false);
  const [selectedUserForResources, setSelectedUserForResources] =
    useState(null);

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN: "danger",
      ACCOUNTANT: "warning",
      EMPLOYEE: "info",
    };
    return <Badge bg={variants[role] || "secondary"}>{role}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "warning",
      ACTIVE: "success",
      QUIT: "dark",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Filter và sort users
  const getFilteredAndSortedUsers = () => {
    let filtered = users;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((user) => user.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.personalEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.loginEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (filterSort === "NEWEST") {
        return new Date(b.joinedAt) - new Date(a.joinedAt);
      } else if (filterSort === "OLDEST") {
        return new Date(a.joinedAt) - new Date(b.joinedAt);
      } else if (filterSort === "NAME_ASC") {
        return a.fullName.localeCompare(b.fullName);
      } else if (filterSort === "NAME_DESC") {
        return b.fullName.localeCompare(a.fullName);
      }
      return 0;
    });

    return sorted;
  };

  const handleApproveClick = (user) => {
    setSelectedUser(user);
    setApproveData({ role: "EMPLOYEE", team: "" });
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    try {
      setApproving(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.backendBase}/user/approve/${selectedUser.userId}`,
        {
          role: approveData.role,
          team: approveData.team || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Phê duyệt thành công! Email đã được gửi đến người dùng.");
      setShowApproveModal(false);
      onRefresh();
    } catch (err) {
      alert(
        "Không thể phê duyệt: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (userId) => {
    const reason = window.prompt("Lý do từ chối (tùy chọn):");
    if (reason === null) return;

    if (!window.confirm("Bạn có chắc chắn muốn từ chối user này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.backendBase}/user/reject/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { reason },
      });

      alert("Đã từ chối và xóa user!");
      onRefresh();
    } catch (err) {
      alert(
        "Không thể từ chối: " + (err.response?.data?.message || err.message)
      );
    }
  };

  const handleSendResourcesClick = (user) => {
    setSelectedUserForResources(user);
    setShowSendResourcesModal(true);
  };

  const handleResourcesSent = () => {
    alert("Đã gửi tài nguyên thành công!");
    setShowSendResourcesModal(false);
    setSelectedUserForResources(null);
  };

  const filteredUsers = getFilteredAndSortedUsers();

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
                placeholder="Tên, email..."
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
              <option value="PENDING">PENDING (Chờ duyệt)</option>
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="QUIT">QUIT (Đã nghỉ)</option>
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
              <option value="NEWEST">Mới tham gia nhất</option>
              <option value="OLDEST">Cũ nhất</option>
              <option value="NAME_ASC">Tên A-Z</option>
              <option value="NAME_DESC">Tên Z-A</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Stats */}
      <div className="mb-3">
        <small className="text-muted">
          Hiển thị {filteredUsers.length} / {users.length} người dùng
          {filterStatus !== "ALL" && ` (Trạng thái: ${filterStatus})`}
        </small>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Email cá nhân</th>
              <th>Email đăng nhập</th>
              <th>Trạng thái</th>
              <th>Nhóm</th>
              <th>Ngày tham gia</th>
              <th>Số kênh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">
                  {searchTerm || filterStatus !== "ALL"
                    ? "Không tìm thấy người dùng phù hợp"
                    : "Chưa có người dùng nào"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <strong>{user.fullName}</strong>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{user.personalEmail}</td>
                  <td>
                    {user.status === "PENDING" ? (
                      <Badge bg="secondary">Chưa có</Badge>
                    ) : user.loginEmail ? (
                      <div>
                        <div className="small">{user.loginEmail}</div>
                        {!user.accountIsActive && (
                          <Badge bg="warning" className="mt-1">
                            Chưa kích hoạt
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <Badge bg="secondary">Chưa có</Badge>
                    )}
                  </td>
                  <td>{getStatusBadge(user.status)}</td>
                  <td>
                    {user.team ? (
                      <Badge bg="primary">{user.team}</Badge>
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </td>
                  <td>{formatDate(user.joinedAt)}</td>
                  <td className="text-center">
                    <Badge bg="info">{user.channelCount}</Badge>
                  </td>
                  <td>
                    {user.status === "PENDING" ? (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveClick(user)}
                          className="me-2"
                        >
                          <i className="bi bi-check-circle"></i> Duyệt
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(user.userId)}
                        >
                          <i className="bi bi-x-circle"></i> Từ chối
                        </Button>
                      </>
                    ) : (
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="outline-primary"
                          size="sm"
                          id={`dropdown-${user.userId}`}
                        >
                          <ThreeDotsVertical />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => onEdit(user)}>
                            <i className="bi bi-pencil me-2"></i>
                            Chỉnh sửa
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleSendResourcesClick(user)}
                          >
                            <i className="bi bi-send me-2"></i>
                            Gửi tài nguyên
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    )}
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

      {/* Approve Modal */}
      <Modal
        show={showApproveModal}
        onHide={() => setShowApproveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Phê duyệt nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <>
              <p>
                <strong>Họ tên:</strong> {selectedUser.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.personalEmail}
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Vai trò</Form.Label>
                <Form.Select
                  value={approveData.role}
                  onChange={(e) =>
                    setApproveData((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                  <option value="ADMIN">ADMIN</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nhóm</Form.Label>
                <Form.Select
                  value={approveData.team}
                  onChange={(e) =>
                    setApproveData((prev) => ({
                      ...prev,
                      team: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Không thuộc nhóm nào --</option>
                  {teams &&
                    teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>

              <p className="text-muted small">
                Sau khi phê duyệt, hệ thống sẽ tự động tạo tài khoản đăng nhập
                và gửi thông tin qua email cá nhân của nhân viên.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowApproveModal(false)}
            disabled={approving}
          >
            Hủy
          </Button>
          <Button
            variant="success"
            onClick={handleApprove}
            disabled={approving}
          >
            {approving ? "Đang xử lý..." : "Xác nhận phê duyệt"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Send Resources Modal */}
      <SendResourcesModal
        show={showSendResourcesModal}
        user={selectedUserForResources}
        onHide={() => {
          setShowSendResourcesModal(false);
          setSelectedUserForResources(null);
        }}
        onSent={handleResourcesSent}
      />
    </>
  );
}

export default UserTable;
