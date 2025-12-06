import React, { useState } from "react";
import { Table, Badge, Button, Spinner } from "react-bootstrap";
import axios from "axios";

function TeamTable({ teams, loading, onEdit, onRefresh, onDeleted }) {
  const [deleting, setDeleting] = useState(null);

  const getStatusBadge = (status) => {
    const variants = {
      AVAILABLE: "success",
      UNAVAILABLE: "secondary",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đội nhóm này?")) {
      return;
    }

    try {
      setDeleting(teamId);
      await axios.delete(`http://localhost:9999/team/delete-team/${teamId}`);
      onDeleted();
    } catch (err) {
      alert(
        "Không thể xóa đội nhóm: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setDeleting(null);
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
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tên nhóm</th>
            <th>Leader</th>
            <th>Thành viên</th>
            <th>Số thành viên</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {teams.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                Chưa có đội nhóm nào
              </td>
            </tr>
          ) : (
            teams.map((team) => (
              <tr key={team._id}>
                <td>
                  <strong>{team.name}</strong>
                </td>
                <td>
                  {team.leader ? (
                    <div>
                      <div>{team.leader.fullName}</div>
                      <small className="text-muted">{team.leader.role}</small>
                    </div>
                  ) : (
                    <span className="text-muted">Chưa có</span>
                  )}
                </td>
                <td>
                  {team.members.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {team.members.slice(0, 3).map((member) => (
                        <li key={member._id} className="small">
                          {member.fullName}
                        </li>
                      ))}
                      {team.members.length > 3 && (
                        <li className="small text-muted">
                          +{team.members.length - 3} người khác
                        </li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-muted">Không có</span>
                  )}
                </td>
                <td className="text-center">{team.memberCount}</td>
                <td>{getStatusBadge(team.status)}</td>
                <td>{formatDate(team.createdAt)}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEdit(team)}
                    className="me-2"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(team._id)}
                    disabled={deleting === team._id}
                  >
                    {deleting === team._id ? (
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
  );
}

export default TeamTable;
