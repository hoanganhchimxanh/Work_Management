import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import axios from "axios";
import UserTable from "../../components/admin/userManagement/UserTable";
import TeamTable from "../../components/admin/userManagement/TeamTable";
import UserModal from "../../components/admin/userManagement/UserModal";
import TeamModal from "../../components/admin/userManagement/TeamModal";
import UserImportModal from "../../components/admin/userManagement/UserImportModal";
import TeamImportModal from "../../components/admin/userManagement/TeamImportModal";

function User_Management() {
  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Teams state
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showUserImportModal, setShowUserImportModal] = useState(false);
  const [showTeamImportModal, setShowTeamImportModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Error handling
  const [error, setError] = useState(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get("http://localhost:9999/user/get-all");

      const normalizedUsers = response.data.data.map((user) => ({
        ...user,
        _id: user.userId,
      }));

      setUsers(normalizedUsers);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách người dùng");
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch teams
  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await axios.get(
        "http://localhost:9999/team/get-all-team"
      );
      setTeams(response.data.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách đội nhóm");
      console.error(err);
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  // User handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUserModalClose = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleUserSaved = () => {
    fetchUsers();
    handleUserModalClose();
  };

  // Team handlers
  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setShowTeamModal(true);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setShowTeamModal(true);
  };

  const handleTeamModalClose = () => {
    setShowTeamModal(false);
    setSelectedTeam(null);
  };

  const handleTeamSaved = () => {
    fetchTeams();
    fetchUsers();
    handleTeamModalClose();
  };

  const handleTeamDeleted = () => {
    fetchTeams();
    fetchUsers();
  };

  // User Import/Export
  const handleUserImportSubmit = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:9999/user/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Import người dùng thành công!");
      setShowUserImportModal(false);
      fetchUsers();
    } catch (err) {
      alert("Import thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUserExport = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9999/user/export-excel",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `users_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Export thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  // Team Import/Export
  const handleTeamImportSubmit = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:9999/team/import-excel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Import team thành công!");
      setShowTeamImportModal(false);
      fetchTeams();
      fetchUsers();
    } catch (err) {
      alert("Import thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const handleTeamExport = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9999/team/export-excel",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `teams_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Export thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Quản lý nhân sự</h1>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* User Management Section */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h5>Quản lý người dùng</h5>

            <div className="d-flex gap-2">
              <Button variant="success" onClick={handleUserExport}>
                <i className="bi bi-download me-2"></i>
                Export Excel
              </Button>

              <Button
                variant="success"
                onClick={() => setShowUserImportModal(true)}
              >
                <i className="bi bi-upload me-2"></i>
                Import Excel
              </Button>

              <Button variant="primary" onClick={handleCreateUser}>
                <i className="bi bi-plus-circle me-2"></i>
                Thêm người dùng
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <UserTable
            users={users}
            loading={loadingUsers}
            onEdit={handleEditUser}
            onRefresh={fetchUsers}
            teams={teams}
          />
        </Col>
      </Row>

      <hr />

      {/* Team Management Section */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h5>Quản lý đội nhóm</h5>

            <div className="d-flex gap-2">
              <Button variant="success" onClick={handleTeamExport}>
                <i className="bi bi-download me-2"></i>
                Export Excel
              </Button>

              <Button
                variant="success"
                onClick={() => setShowTeamImportModal(true)}
              >
                <i className="bi bi-upload me-2"></i>
                Import Excel
              </Button>

              <Button variant="primary" onClick={handleCreateTeam}>
                <i className="bi bi-plus-circle me-2"></i>
                Tạo đội nhóm
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <TeamTable
            teams={teams}
            loading={loadingTeams}
            onEdit={handleEditTeam}
            onRefresh={fetchTeams}
            onDeleted={handleTeamDeleted}
          />
        </Col>
      </Row>

      {/* Modals */}
      <UserModal
        show={showUserModal}
        onHide={handleUserModalClose}
        user={selectedUser}
        onSaved={handleUserSaved}
      />

      <TeamModal
        show={showTeamModal}
        onHide={handleTeamModalClose}
        team={selectedTeam}
        users={users}
        onSaved={handleTeamSaved}
      />

      {/* Import Excel Modals */}
      <UserImportModal
        show={showUserImportModal}
        onHide={() => setShowUserImportModal(false)}
        onSubmit={handleUserImportSubmit}
      />

      <TeamImportModal
        show={showTeamImportModal}
        onHide={() => setShowTeamImportModal(false)}
        onSubmit={handleTeamImportSubmit}
      />
    </Container>
  );
}

export default User_Management;
