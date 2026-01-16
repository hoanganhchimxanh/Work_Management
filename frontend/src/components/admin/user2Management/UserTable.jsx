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
  const [filterRole, setFilterRole] = useState("ALL");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");

  // Approve modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [approveData, setApproveData] = useState({
    email: "",
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

  const getDepartmentBadge = (department) => {
    const variants = {
      CONTENT: "primary",
      IT: "success",
      MARKETING: "info",
      OTHER: "secondary",
    };
    return (
      <Badge bg={variants[department] || "secondary"}>
        {department || "OTHER"}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Filter và sort users
  const getFilteredAndSortedUsers = () => {
    let filtered = users;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((user) => user.status === filterStatus);
    }

    // Filter by role
    if (filterRole !== "ALL") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Filter by department
    if (filterDepartment !== "ALL") {
      filtered = filtered.filter(
        (user) => (user.department || "OTHER") === filterDepartment
      );
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(lowerSearch) ||
          user.phoneNumber?.toLowerCase().includes(lowerSearch) ||
          user.loginEmail?.toLowerCase().includes(lowerSearch) ||
          user.note?.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (filterSort === "NEWEST") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (filterSort === "OLDEST") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      } else if (filterSort === "NAME_ASC") {
        return (a.fullName || "").localeCompare(b.fullName || "");
      } else if (filterSort === "NAME_DESC") {
        return (b.fullName || "").localeCompare(a.fullName || "");
      } else if (filterSort === "JOIN_DATE") {
        return new Date(b.joinDate || 0) - new Date(a.joinDate || 0);
      }
      return 0;
    });

    return sorted;
  };

  const handleApproveClick = (user) => {
    setSelectedUser(user);
    setApproveData({
      email: "",
      role: "EMPLOYEE",
      team: "",
    });
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;

    if (!approveData.email) {
      alert("Vui lòng nhập email đăng nhập!");
      return;
    }

    try {
      setApproving(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `${config.backendBase}/user/approve/${selectedUser.userId}`,
        {
          email: approveData.email,
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

  const handleReject = async (userId, userFullName) => {
    const notificationEmail = window.prompt(
      "Nhập email để gửi thông báo từ chối (hoặc để trống):"
    );
    if (notificationEmail === null) return;

    const reason = window.prompt("Lý do từ chối (tùy chọn):");
    if (reason === null) return;

    if (
      !window.confirm(`Bạn có chắc chắn muốn từ chối user ${userFullName}?`)
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.backendBase}/user/reject/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          reason,
          notificationEmail: notificationEmail || undefined,
        },
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
        <Col md={3}>
          <Form.Group>
            <Form.Label>Tìm kiếm</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tên, SĐT, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group>
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="QUIT">QUIT</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group>
            <Form.Label>Vai trò</Form.Label>
            <Form.Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
              <option value="ADMIN">ADMIN</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={2}>
          <Form.Group>
            <Form.Label>Phòng ban</Form.Label>
            <Form.Select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="CONTENT">CONTENT</option>
              <option value="IT">IT</option>
              <option value="MARKETING">MARKETING</option>
              <option value="OTHER">OTHER</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Sắp xếp</Form.Label>
            <Form.Select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
            >
              <option value="NEWEST">Mới tạo nhất</option>
              <option value="OLDEST">Cũ nhất</option>
              <option value="JOIN_DATE">Ngày vào làm</option>
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
          {filterStatus !== "ALL" && ` • Trạng thái: ${filterStatus}`}
          {filterRole !== "ALL" && ` • Vai trò: ${filterRole}`}
          {filterDepartment !== "ALL" && ` • Phòng ban: ${filterDepartment}`}
        </small>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>Phòng ban</th>
              <th>SĐT</th>
              <th>Ngày sinh</th>
              <th>Facebook</th>
              <th>STK</th>
              <th>Tên ngân hàng</th>
              <th>Email đăng nhập</th>
              <th>Trạng thái</th>
              <th>Nhóm</th>
              <th>Ngày vào làm</th>
              <th>Kênh/Network</th>
              <th>Note</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="10" className="text-center">
                  {searchTerm ||
                  filterStatus !== "ALL" ||
                  filterRole !== "ALL" ||
                  filterDepartment !== "ALL"
                    ? "Không tìm thấy người dùng phù hợp"
                    : "Chưa có người dùng nào"}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td>
                    <strong>{user.fullName || "-"}</strong>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getDepartmentBadge(user.department)}</td>
                  <td>
                    {user.phoneNumber ? (
                      <span className="small">{user.phoneNumber}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>
                    {user.status === "PENDING" ? (
                      <Badge bg="secondary">Chưa có</Badge>
                    ) : user.loginEmail ? (
                      <div>
                        <div className="small">{user.loginEmail}</div>
                        {user.hasAccount && !user.accountIsActive && (
                          <Badge bg="warning" className="mt-1" pill>
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
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td className="small">{formatDate(user.joinDate)}</td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center flex-wrap">
                      <Badge bg="info" pill title="Số kênh YouTube">
                        📺 {user.channelCount || 0}
                      </Badge>
                      <Badge bg="success" pill title="Số network">
                        🌐 {user.networkCount || 0}
                      </Badge>
                    </div>
                  </td>
                  <td></td>
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
                          onClick={() =>
                            handleReject(user.userId, user.fullName)
                          }
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
                          <Dropdown.Divider />
                          <Dropdown.Item className="text-muted small">
                            <i className="bi bi-info-circle me-2"></i>
                            ID: {user.userId.substring(0, 8)}...
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
              {selectedUser.phoneNumber && (
                <p>
                  <strong>SĐT:</strong> {selectedUser.phoneNumber}
                </p>
              )}

              <Form.Group className="mb-3">
                <Form.Label>
                  Email đăng nhập <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="example@company.com"
                  value={approveData.email}
                  onChange={(e) =>
                    setApproveData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                />
                <Form.Text className="text-muted">
                  Email này sẽ được dùng để đăng nhập vào hệ thống
                </Form.Text>
              </Form.Group>

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

              <div className="alert alert-info small">
                <i className="bi bi-info-circle me-2"></i>
                Sau khi phê duyệt, hệ thống sẽ tự động tạo tài khoản đăng nhập
                và gửi thông tin qua email đã nhập.
              </div>
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
            disabled={approving || !approveData.email}
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
