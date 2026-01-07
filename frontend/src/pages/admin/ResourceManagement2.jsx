import React, { useState } from "react";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Nav,
  Tab,
  Badge,
  Form,
  InputGroup,
} from "react-bootstrap";
import {
  PlusCircle,
  CheckSquare,
  XSquare,
  ListUl,
  Grid3x3Gap,
  FunnelFill,
  Search,
  ArrowClockwise,
} from "react-bootstrap-icons";

// Components
import ResourceStats from "../../components/admin/resourceManagement/ResourceStats";
import ResourceTable from "../../components/admin/resourceManagement/ResourceTable";
import ResourceBatchTable from "../../components/admin/resourceManagement/ResourceBatchTable";
import CreateResourceModal from "../../components/admin/resourceManagement/CreateResourceModal";
import EditResourceModal from "../../components/admin/resourceManagement/EditResourceModal";
import AssignResourceModal from "../../components/admin/resourceManagement/AssignResourceModal";
import ResourceImportModal from "../../components/admin/resourceManagement/ResourceImportModal";
import BulkAssignUserModal from "../../components/admin/resourceManagement/BulkAssignUserModal";
import TablePagination from "../../components/common/TablePagination";
import ItemsPerPageSelector from "../../components/common/ItemsPerPageSelector";

// Custom hooks
import useAuth from "../../hooks/useAuth";
import useResourceData from "../../hooks/admin/resourceManagement/useResourceData";
import useResourceFilters from "../../hooks/admin/resourceManagement/useResourceFilters";
import useResourceActions from "../../hooks/admin/resourceManagement/useResourceActions";
import useResourceModals from "../../hooks/admin/resourceManagement/useResourceModals";
import useBulkAssign from "../../hooks/admin/resourceManagement/useBulkAssign";
import usePagination from "../../hooks/usePagination";

function ResourceManagement() {
  // Tab state
  const [activeTab, setActiveTab] = useState("resources");

  // 1. Authentication
  const { getAuthConfig } = useAuth();

  // 2. Status và User filters (được truyền vào API)
  const [statusFilter, setStatusFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // 3. Fetch Data với filters
  const {
    resources,
    stats,
    users,
    channels,
    loading,
    error: fetchError,
    setError: setFetchError,
    refetch,
  } = useResourceData({ statusFilter, userFilter }, getAuthConfig);

  // 4. Apply search filter (client-side) và kết hợp với server-side filters
  const { searchQuery, setSearchQuery, filteredResources, resetSearch } =
    useResourceFilters(resources, statusFilter, userFilter);

  // 5. Pagination (chỉ cho resources tab)
  const {
    paginatedItems: paginatedResources,
    pagination,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(filteredResources, 10);

  // 6. Actions
  const {
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAssignToUser,
    handleAssignToChannel,
    handleBulkAssignToUser,
    handleUnassign,
    handleDisable,
    handleEnable,
    handleExport,
    handleImport,
    success,
    error: actionError,
    setSuccess,
    setError: setActionError,
  } = useResourceActions(getAuthConfig, refetch);

  // 7. Modals
  const {
    modals,
    selectedResource,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openAssignModal,
    closeAssignModal,
    openImportModal,
    closeImportModal,
    openBulkAssignUserModal,
    closeBulkAssignUserModal,
  } = useResourceModals();

  // 8. Bulk Assign (sử dụng filteredResources thay vì resources)
  const {
    bulkAssignMode,
    selectedResources,
    selectedCount,
    toggleBulkAssignMode,
    cancelBulkAssignMode,
    handleSelectResource,
    handleSelectAll,
  } = useBulkAssign(filteredResources);

  // Combined error handling
  const error = fetchError || actionError;
  const setError = (msg) => {
    setFetchError(msg);
    setActionError(msg);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter("");
    setUserFilter("");
    resetSearch();
  };

  // Wrapper handlers cho modals
  const onCreateSubmit = async (data) => {
    const success = await handleCreate(data);
    if (success) closeCreateModal();
  };

  const onUpdateSubmit = async (id, data) => {
    const success = await handleUpdate(id, data);
    if (success) closeEditModal();
  };

  const onAssignToUserSubmit = async (resourceId, userId) => {
    const success = await handleAssignToUser(resourceId, userId);
    if (success) closeAssignModal();
  };

  const onAssignToChannelSubmit = async (resourceId, channelId) => {
    const success = await handleAssignToChannel(resourceId, channelId);
    if (success) closeAssignModal();
  };

  const onBulkAssignSubmit = async (userId) => {
    const success = await handleBulkAssignToUser(selectedResources, userId);
    if (success) {
      closeBulkAssignUserModal();
      cancelBulkAssignMode();
    }
  };

  const onImportSubmit = async (file) => {
    const success = await handleImport(file);
    if (success) {
      closeImportModal();
      setActiveTab("batches");
    }
  };

  // Loading state
  if (loading && activeTab === "resources") {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý Tài nguyên</h2>
          <p className="text-muted mb-0">
            Quản lý tài nguyên email cho hệ thống
          </p>
        </div>

        <div className="d-flex gap-2">
          {activeTab === "resources" && (
            <>
              {!bulkAssignMode ? (
                <>
                  <Button variant="success" onClick={handleExport}>
                    <i className="bi bi-download me-2"></i>
                    Export Excel
                  </Button>

                  <Button variant="success" onClick={openImportModal}>
                    <i className="bi bi-upload me-2"></i>
                    Import Excel
                  </Button>

                  <Button variant="info" onClick={toggleBulkAssignMode}>
                    <CheckSquare size={20} className="me-2" />
                    Gán hàng loạt
                  </Button>

                  <Button
                    variant="primary"
                    onClick={openCreateModal}
                    className="d-flex align-items-center gap-2"
                  >
                    <PlusCircle size={20} />
                    Tạo Resource
                  </Button>
                </>
              ) : (
                <>
                  <Badge
                    bg="primary"
                    className="d-flex align-items-center px-3"
                  >
                    Đã chọn: {selectedCount}
                  </Badge>
                  <Button
                    variant="success"
                    onClick={openBulkAssignUserModal}
                    disabled={selectedCount === 0}
                  >
                    <CheckSquare size={20} className="me-2" />
                    Gán {selectedCount} resources
                  </Button>
                  <Button variant="secondary" onClick={cancelBulkAssignMode}>
                    <XSquare size={20} className="me-2" />
                    Hủy
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {bulkAssignMode && activeTab === "resources" && (
        <Alert variant="info">
          <strong>Chế độ gán hàng loạt:</strong> Chọn các resources có trạng
          thái "Khả dụng" để gán cho nhân viên.
        </Alert>
      )}

      {/* Stats - Only show on resources tab */}
      {activeTab === "resources" && <ResourceStats stats={stats} />}

      {/* Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white">
            <Nav variant="tabs" className="border-0">
              <Nav.Item>
                <Nav.Link
                  eventKey="resources"
                  className="d-flex align-items-center gap-2"
                >
                  <ListUl size={18} />
                  Danh sách Resources
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  eventKey="batches"
                  className="d-flex align-items-center gap-2"
                >
                  <Grid3x3Gap size={18} />
                  Resource Batches
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
        </Card>

        <Tab.Content>
          {/* Resources Tab */}
          <Tab.Pane eventKey="resources">
            {/* Filters */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Label>
                      <Search size={16} className="me-2" />
                      Tìm kiếm
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Tìm theo email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <Button
                          variant="outline-secondary"
                          onClick={resetSearch}
                        >
                          <XSquare size={16} />
                        </Button>
                      )}
                    </InputGroup>
                  </Col>

                  <Col md={3}>
                    <Form.Label>
                      <FunnelFill size={16} className="me-2" />
                      Trạng thái
                    </Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      <option value="AVAILABLE">Khả dụng</option>
                      <option value="ASSIGNED">Đang sử dụng</option>
                      <option value="DISABLED">Vô hiệu hóa</option>
                    </Form.Select>
                  </Col>

                  <Col md={3}>
                    <Form.Label>Người quản lý</Form.Label>
                    <Form.Select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                    >
                      <option value="">Tất cả</option>
                      {users.map((user) => (
                        <option key={user.userId} value={user.userId}>
                          {user.fullName}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col md={2} className="d-flex align-items-end gap-2">
                    <Button
                      variant="outline-secondary"
                      className="flex-grow-1"
                      onClick={handleResetFilters}
                      disabled={!statusFilter && !userFilter && !searchQuery}
                    >
                      <XSquare size={16} className="me-2" />
                      Reset
                    </Button>
                    <Button variant="outline-primary" onClick={refetch}>
                      <ArrowClockwise size={16} />
                    </Button>
                  </Col>
                </Row>

                {/* Filter indicators */}
                {(statusFilter || userFilter || searchQuery) && (
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    <small className="text-muted">Đang lọc:</small>
                    {searchQuery && (
                      <Badge bg="secondary" pill>
                        Tìm kiếm: "{searchQuery}"
                      </Badge>
                    )}
                    {statusFilter && (
                      <Badge bg="secondary" pill>
                        Trạng thái: {statusFilter}
                      </Badge>
                    )}
                    {userFilter && (
                      <Badge bg="secondary" pill>
                        Người quản lý:{" "}
                        {users.find((u) => u.userId === userFilter)?.fullName ||
                          userFilter}
                      </Badge>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Table */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                Danh sách Resources ({filteredResources.length}/
                {resources.length})
              </h5>

              <ItemsPerPageSelector
                value={pagination.itemsPerPage}
                onChange={setItemsPerPage}
              />
            </div>

            <ResourceTable
              resources={paginatedResources}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onAssign={openAssignModal}
              onUnassign={handleUnassign}
              onDisable={handleDisable}
              onEnable={handleEnable}
              bulkAssignMode={bulkAssignMode}
              selectedResources={selectedResources}
              onSelectResource={handleSelectResource}
              onSelectAll={handleSelectAll}
            />

            <TablePagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </Tab.Pane>

          {/* Batches Tab */}
          <Tab.Pane eventKey="batches">
            <ResourceBatchTable onBatchUpdated={refetch} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Modals */}
      <CreateResourceModal
        show={modals.showCreateModal}
        onHide={closeCreateModal}
        onCreate={onCreateSubmit}
        users={users}
        channels={channels}
      />

      <EditResourceModal
        show={modals.showEditModal}
        onHide={closeEditModal}
        onUpdate={onUpdateSubmit}
        resource={selectedResource}
        users={users}
        channels={channels}
      />

      <AssignResourceModal
        show={modals.showAssignModal}
        onHide={closeAssignModal}
        onAssignToUser={onAssignToUserSubmit}
        onAssignToChannel={onAssignToChannelSubmit}
        resource={selectedResource}
        users={users}
        channels={channels}
      />

      <BulkAssignUserModal
        show={modals.showBulkAssignUserModal}
        onHide={closeBulkAssignUserModal}
        onAssignToUser={onBulkAssignSubmit}
        selectedCount={selectedCount}
        users={users}
      />

      <ResourceImportModal
        show={modals.showImportModal}
        onHide={closeImportModal}
        onSubmit={onImportSubmit}
      />
    </Container>
  );
}

export default ResourceManagement;
