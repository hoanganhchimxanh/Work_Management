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
      ACTIVE: "success",
      INACTIVE: "secondary",
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
            <th>Email công ty</th>
            <th>Trạng thái</th>
            <th>Ngày tham gia</th>
            <th>Số kênh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                Chưa có người dùng nào
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={index}>
                <td>{user.fullName}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{user.personalEmail}</td>
                <td>
                  {user.companyEmails.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {user.companyEmails.map((email, idx) => (
                        <li key={idx} className="small">
                          {email}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted">Chưa có</span>
                  )}
                </td>
                <td>{getStatusBadge(user.status)}</td>
                <td>{formatDate(user.joinedAt)}</td>
                <td className="text-center">{user.channelCount}</td>
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
