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

import config from "../../../../configs/api";

function TeamTable({ teams, loading, onEdit, onRefresh, onDeleted }) {
  const [deleting, setDeleting] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");

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
      await axios.delete(`${config.backendBase}/team/delete-team/${teamId}`);
      onDeleted();
    } catch (err) {
      alert(
        "Không thể xóa đội nhóm: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setDeleting(null);
    }
  };

  // Filter và sort teams
  const getFilteredAndSortedTeams = () => {
    let filtered = teams;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((team) => team.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (team) =>
          team.name.toLowerCase().includes(searchLower) ||
          team.leader?.fullName.toLowerCase().includes(searchLower) ||
          team.members?.some((member) =>
            member.fullName.toLowerCase().includes(searchLower),
          ),
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (filterSort === "NEWEST") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (filterSort === "OLDEST") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (filterSort === "NAME_ASC") {
        return a.name.localeCompare(b.name);
      } else if (filterSort === "NAME_DESC") {
        return b.name.localeCompare(a.name);
      } else if (filterSort === "MEMBERS_DESC") {
        const getTotal = (team) =>
          (team.memberCount || team.members?.length || 0) +
          (team.leader ? 1 : 0);
        return getTotal(b) - getTotal(a);
      } else if (filterSort === "MEMBERS_ASC") {
        const getTotal = (team) =>
          (team.memberCount || team.members?.length || 0) +
          (team.leader ? 1 : 0);
        return getTotal(a) - getTotal(b);
      }
      return 0;
    });

    return sorted;
  };

  const filteredTeams = getFilteredAndSortedTeams();

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
                placeholder="Tên nhóm, leader, thành viên..."
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
              <option value="AVAILABLE">AVAILABLE (Sẵn sàng)</option>
              <option value="UNAVAILABLE">UNAVAILABLE (Không hoạt động)</option>
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
              <option value="NEWEST">Mới tạo nhất</option>
              <option value="OLDEST">Cũ nhất</option>
              <option value="NAME_ASC">Tên A-Z</option>
              <option value="NAME_DESC">Tên Z-A</option>
              <option value="MEMBERS_DESC">Nhiều thành viên nhất</option>
              <option value="MEMBERS_ASC">Ít thành viên nhất</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Stats */}
      <div className="mb-3">
        <small className="text-muted">
          Hiển thị {filteredTeams.length} / {teams.length} đội nhóm
          {filterStatus !== "ALL" && ` (Trạng thái: ${filterStatus})`}
        </small>
      </div>

      {/* Table */}
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
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  {searchTerm || filterStatus !== "ALL"
                    ? "Không tìm thấy đội nhóm phù hợp"
                    : "Chưa có đội nhóm nào"}
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
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
                    {team.members && team.members.length > 0 ? (
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
                  <td className="text-center">
                    <Badge bg="info">
                      {(team.memberCount || team.members?.length || 0) +
                        (team.leader ? 1 : 0)}
                    </Badge>
                  </td>
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
    </>
  );
}

export default TeamTable;
