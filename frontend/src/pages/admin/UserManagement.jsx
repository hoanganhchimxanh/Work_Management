import React from "react";
import { Container, Row, Col, Button, Alert, Tabs, Tab } from "react-bootstrap";

// Components
import UserTable from "../../components/admin/userManagement/tables/UserTable";
import TeamTable from "../../components/admin/userManagement/tables/TeamTable";
import UserModal from "../../components/admin/userManagement/modals/UserModal";
import TeamModal from "../../components/admin/userManagement/modals/TeamModal";
import UserImportModal from "../../components/admin/userManagement/modals/UserImportModal";
import TeamImportModal from "../../components/admin/userManagement/modals/TeamImportModal";
import TablePagination from "../../components/common/TablePagination";
import ItemsPerPageSelector from "../../components/common/ItemsPerPageSelector";

// Custom hooks
import useAuth from "../../hooks/useAuth";
import useUserManagementData from "../../hooks/admin/userManagement/useUserManagementData";
import useUserManagementModals from "../../hooks/admin/userManagement/useUserManagementModals";
import useUserManagementActions from "../../hooks/admin/userManagement/useUserManagementActions";
import usePagination from "../../hooks/usePagination";
import useTabNavigation from "../../hooks/useTabNavigation";

function UserManagement() {
  // 1. Authentication
  const { getAuthConfig } = useAuth();

  // 2. Tab Navigation
  const { activeTab, setActiveTab } = useTabNavigation("account");

  // 3. Fetch Data
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

  // 4. Pagination for Users
  const {
    paginatedItems: paginatedUsers,
    pagination: userPagination,
    setCurrentPage: setUserCurrentPage,
    setItemsPerPage: setUserItemsPerPage,
  } = usePagination(users, 10);

  // 5. Pagination for Teams
  const {
    paginatedItems: paginatedTeams,
    pagination: teamPagination,
    setCurrentPage: setTeamCurrentPage,
    setItemsPerPage: setTeamItemsPerPage,
  } = usePagination(teams, 10);

  // 6. Modals
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

  // 7. Actions
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
    refetchAll,
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

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {/* Tab 1: Quản lý tài khoản hệ thống */}
        <Tab eventKey="account" title="Quản lý tài khoản hệ thống">
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

          {/* User Table Controls */}
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 text-muted">
                  Danh sách người dùng ({userPagination.totalItems})
                </h6>

                <ItemsPerPageSelector
                  value={userPagination.itemsPerPage}
                  onChange={setUserItemsPerPage}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <UserTable
                users={paginatedUsers}
                loading={loadingUsers}
                onEdit={openUserModal}
                onRefresh={refetchUsers}
                teams={teams}
              />
            </Col>
          </Row>

          {/* User Pagination */}
          <Row className="mb-5">
            <Col>
              <TablePagination
                currentPage={userPagination.currentPage}
                totalPages={userPagination.totalPages}
                onPageChange={setUserCurrentPage}
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

          {/* Team Table Controls */}
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0 text-muted">
                  Danh sách đội nhóm ({teamPagination.totalItems})
                </h6>

                <ItemsPerPageSelector
                  value={teamPagination.itemsPerPage}
                  onChange={setTeamItemsPerPage}
                />
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <TeamTable
                teams={paginatedTeams}
                loading={loadingTeams}
                onEdit={openTeamModal}
                onRefresh={refetchTeams}
                onDeleted={handleTeamDeleted}
              />
            </Col>
          </Row>

          {/* Team Pagination */}
          <Row>
            <Col>
              <TablePagination
                currentPage={teamPagination.currentPage}
                totalPages={teamPagination.totalPages}
                onPageChange={setTeamCurrentPage}
              />
            </Col>
          </Row>
        </Tab>
      </Tabs>

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
