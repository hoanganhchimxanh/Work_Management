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
} from "react-bootstrap";
import { ThreeDotsVertical } from "react-bootstrap-icons";
import axios from "axios";

import config from "../../../../configs/api";

function UserTable({ users, loading, onEdit, onRefresh, teams }) {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");

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
      ACTIVE: "success",
      QUIT: "dark",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
          user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.loginEmail?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (filterSort === "NEWEST") {
        return (
          new Date(b.joinDate || b.createdAt) -
          new Date(a.joinDate || a.createdAt)
        );
      } else if (filterSort === "OLDEST") {
        return (
          new Date(a.joinDate || a.createdAt) -
          new Date(b.joinDate || b.createdAt)
        );
      } else if (filterSort === "NAME_ASC") {
        return a.fullName.localeCompare(b.fullName);
      } else if (filterSort === "NAME_DESC") {
        return b.fullName.localeCompare(a.fullName);
      }
      return 0;
    });

    return sorted;
  };

  const handleResetPassword = async (userId, fullName) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn cấp lại mật khẩu cho "${fullName}"?`,
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${config.backendBase}/user/reset-password/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const newPassword = response.data?.data?.newPassword;

      // Thông báo thành công sẽ được hiển thị qua GlobalNotificationToast từ Backend
      onRefresh();
    } catch (err) {
      alert(
        "Không thể cấp lại mật khẩu: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDelete = async (userId, userName) => {
    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}"?`)
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${config.backendBase}/user/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Thông báo thành công sẽ được hiển thị qua GlobalNotificationToast nếu có trigger từ backend
      // Lưu ý: Hiện tại backend deleteUser chưa gửi notification, nên có thể cần bổ sung ở backend
      // Tuy nhiên user muốn xóa hết popup cũ nên tôi sẽ xóa trước.
      onRefresh();
    } catch (err) {
      alert("Không thể xóa: " + (err.response?.data?.message || err.message));
    }
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
                placeholder="Tên, số điện thoại, email..."
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
              <th>Số điện thoại</th>
              <th>Email đăng nhập</th>
              <th>Trạng thái</th>
              <th>Nhóm</th>
              <th>Ngày vào làm</th>
              <th>Số kênh</th>
              <th>Note</th>
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
                    <div>
                      <strong>{user.fullName}</strong>
                      {user.isFirstLogin && (
                        <Badge
                          bg="warning"
                          className="ms-2"
                          title="Chưa đổi mật khẩu lần đầu"
                        >
                          Chưa đổi MK
                        </Badge>
                      )}
                    </div>
                    {user.responsibilities && (
                      <small className="text-muted d-block">
                        {user.responsibilities}
                      </small>
                    )}
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <div>{user.phoneNumber}</div>
                    {user.facebookLink && (
                      <a
                        href={user.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="small"
                      >
                        <i className="bi bi-facebook me-1"></i>
                        Facebook
                      </a>
                    )}
                  </td>
                  <td>
                    {user.loginEmail ? (
                      <div>
                        <div className="small">{user.loginEmail}</div>
                        {!user.accountIsActive && (
                          <Badge bg="warning" className="mt-1">
                            Đã vô hiệu hóa
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
                  <td>{formatDate(user.joinDate)}</td>
                  <td className="text-center">
                    <Badge bg="info">{user.channelCount || 0}</Badge>
                  </td>
                  <td>
                    {user.note && user.note.trim() !== "" ? (
                      <span>{user.note}</span>
                    ) : (
                      <Badge bg="secondary">N/A</Badge>
                    )}
                  </td>
                  <td>
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

                        {user.loginEmail && (
                          <Dropdown.Item
                            onClick={() =>
                              handleResetPassword(user.userId, user.fullName)
                            }
                          >
                            <i className="bi bi-key me-2"></i>
                            Cấp lại mật khẩu
                          </Dropdown.Item>
                        )}

                        <Dropdown.Divider />

                        <Dropdown.Item
                          onClick={() =>
                            handleDelete(user.userId, user.fullName)
                          }
                          className="text-danger"
                        >
                          <i className="bi bi-trash me-2"></i>
                          Cho nghỉ việc
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
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

export default UserTable;
