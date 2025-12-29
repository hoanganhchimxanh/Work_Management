import React from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";

// Components
import UserTable from "../../components/admin/userManagement/UserTable";
import TeamTable from "../../components/admin/userManagement/TeamTable";
import UserModal from "../../components/admin/userManagement/UserModal";
import TeamModal from "../../components/admin/userManagement/TeamModal";
import UserImportModal from "../../components/admin/userManagement/UserImportModal";
import TeamImportModal from "../../components/admin/userManagement/TeamImportModal";

// Custom hooks
import useAuth from "../../hooks/admin/dashboard/useAuth";
import useUserManagementData from "../../hooks/admin/userManagement/useUserManagementData";
import useUserManagementModals from "../../hooks/admin/userManagement/useUserManagementModals";
import useUserManagementActions from "../../hooks/admin/userManagement/useUserManagementActions";

function UserManagement() {
  // 1. Authentication
  const { getAuthConfig } = useAuth();

  // 2. Fetch Data
  const {
    users,
    teams,
    loadingUsers,
    loadingTeams,
    error: fetchError,
    setError: setFetchError,
    refetchUsers,
    refetchTeams,
    refetchAll,
  } = useUserManagementData(getAuthConfig);

  // 3. Modals
  const {
    modals,
    selected,
    openUserModal,
    closeUserModal,
    openUserImportModal,
    closeUserImportModal,
    openTeamModal,
    closeTeamModal,
    openTeamImportModal,
    closeTeamImportModal,
  } = useUserManagementModals();

  // 4. Actions
  const {
    handleUserImport,
    handleUserExport,
    handleTeamImport,
    handleTeamExport,
    success,
    error: actionError,
    setError: setActionError,
  } = useUserManagementActions(
    getAuthConfig,
    refetchUsers,
    refetchTeams,
    refetchAll
  );

  // Combined error handling
  const error = fetchError || actionError;
  const setError = (msg) => {
    setFetchError(msg);
    setActionError(msg);
  };

  // Callback handlers for modals
  const handleUserSaved = () => {
    refetchUsers();
    closeUserModal();
  };

  const handleTeamSaved = () => {
    refetchAll(); // Refetch both because team changes affect users
    closeTeamModal();
  };

  const handleTeamDeleted = () => {
    refetchAll();
  };

  // Import handlers with modal close
  const onUserImportSubmit = async (file) => {
    const success = await handleUserImport(file);
    if (success) closeUserImportModal();
  };

  const onTeamImportSubmit = async (file) => {
    const success = await handleTeamImport(file);
    if (success) closeTeamImportModal();
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Quản lý nhân sự</h1>
        </Col>
      </Row>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => {}}>
          {success}
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

              <Button variant="success" onClick={openUserImportModal}>
                <i className="bi bi-upload me-2"></i>
                Import Excel
              </Button>

              <Button variant="primary" onClick={() => openUserModal()}>
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
            onEdit={openUserModal}
            onRefresh={refetchUsers}
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

              <Button variant="success" onClick={openTeamImportModal}>
                <i className="bi bi-upload me-2"></i>
                Import Excel
              </Button>

              <Button variant="primary" onClick={() => openTeamModal()}>
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
            onEdit={openTeamModal}
            onRefresh={refetchTeams}
            onDeleted={handleTeamDeleted}
          />
        </Col>
      </Row>

      {/* User Modals */}
      <UserModal
        show={modals.showUserModal}
        onHide={closeUserModal}
        user={selected.user}
        onSaved={handleUserSaved}
      />

      <UserImportModal
        show={modals.showUserImportModal}
        onHide={closeUserImportModal}
        onSubmit={onUserImportSubmit}
      />

      {/* Team Modals */}
      <TeamModal
        show={modals.showTeamModal}
        onHide={closeTeamModal}
        team={selected.team}
        users={users}
        onSaved={handleTeamSaved}
      />

      <TeamImportModal
        show={modals.showTeamImportModal}
        onHide={closeTeamImportModal}
        onSubmit={onTeamImportSubmit}
      />
    </Container>
  );
}

export default UserManagement;
