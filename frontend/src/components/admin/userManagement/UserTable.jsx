import React from "react";
import { Table, Badge, Button, Spinner } from "react-bootstrap";

function UserTable({ users, loading, onEdit, onRefresh }) {
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
          {users.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                Chưa có người dùng nào
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.userId}>
                <td>{user.fullName}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{user.personalEmail}</td>
                <td>
                  {user.loginEmail ? (
                    <div>
                      <div className="small">{user.loginEmail}</div>
                      {!user.hasAccount && (
                        <Badge bg="warning" className="mt-1">
                          Chưa có tài khoản
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
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <i className="bi bi-pencil"></i> Sửa
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
  );
}

export default UserTable;
