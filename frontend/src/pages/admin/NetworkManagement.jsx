import React from "react";
import { Container, Alert, Tabs, Tab } from "react-bootstrap";

// Components
import NetworkFilters from "../../components/admin/networkManagement/NetworkFilters";
import NetworkTable from "../../components/admin/networkManagement/NetworkTable";
import AddNetworkModal from "../../components/admin/networkManagement/AddNetworkModal";
import NetworkImportModal from "../../components/admin/networkManagement/NetworkImportModal";
import EditNetworkModal from "../../components/admin/networkManagement/EditNetworkModal";
import AddressTable from "../../components/admin/networkManagement/AddressTable";

// Custom hooks
import useAuth from "../../hooks/useAuth";
import useNetworkData from "../../hooks/admin/networkManagement/useNetworkData";
import useNetworkFilters from "../../hooks/admin/networkManagement/useNetworkFilters";
import useNetworkActions from "../../hooks/admin/networkManagement/useNetworkActions";
import useNetworkModals from "../../hooks/admin/networkManagement/useNetworkModals";
import useTabNavigation from "../../hooks/useTabNavigation";

const NetworkManagement = () => {
  // 1. Authentication
  const { getAuthConfig } = useAuth();

  // 2. Tab Navigation
  const { activeTab, setActiveTab } = useTabNavigation("network");

  // 3. Server-side Filters (for API)
  const [status, setStatus] = React.useState("");
  const [location, setLocation] = React.useState("");

  const serverFilters = { status, location };

  // 4. Fetch Data
  const { networks, loading, error, refetch } = useNetworkData(
    serverFilters,
    getAuthConfig
  );

  // 5. Client-side Filters (for search)
  const { filters, filteredNetworks, handleFilterChange } =
    useNetworkFilters(networks);

  // Sync server filters with handleFilterChange
  const onFilterChange = (field, value) => {
    handleFilterChange(field, value);

    // Also update server filters
    if (field === "status") setStatus(value);
    if (field === "location") setLocation(value);
  };

  // 6. Actions
  const {
    handleCreate,
    handleExport,
    handleImport,
    handleUpdate,
    handleDelete,
    alert,
    setAlert,
  } = useNetworkActions(getAuthConfig, serverFilters, refetch);

  // 7. Modals
  const {
    modals,
    selectedNetwork,
    openAddModal,
    closeAddModal,
    openImportModal,
    closeImportModal,
    openEditModal,
    closeEditModal,
  } = useNetworkModals();

  // Wrapper handlers for modals
  const onAddSubmit = async (data) => {
    const success = await handleCreate(data);
    if (success) closeAddModal();
  };

  const onImportSubmit = async (file) => {
    const success = await handleImport(file);
    if (success) closeImportModal();
  };

  const onEditSubmit = async (networkId, data) => {
    const success = await handleUpdate(networkId, data);
    if (success) {
      closeEditModal();
    } else {
      throw new Error("Cập nhật thất bại");
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Network</h2>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Error from fetch */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => {}}>
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {/* Tab 1: Quản lý Network */}
        <Tab eventKey="network" title="Quản lý Network">
          {/* Filters */}
          <NetworkFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onExport={handleExport}
            onImport={openImportModal}
            onAdd={openAddModal}
          />

          {/* Summary */}
          <div className="mb-3">
            <strong>Tổng số network:</strong> {filteredNetworks.length}
          </div>

          {/* Table */}
          <NetworkTable
            networks={filteredNetworks}
            loading={loading}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onRefresh={refetch}
          />
        </Tab>

        {/* Tab 2: Quản lý địa chỉ */}
        <Tab eventKey="address" title="Quản lý địa chỉ">
          <AddressTable />
        </Tab>
      </Tabs>

      {/* Modals */}
      <AddNetworkModal
        show={modals.showAddModal}
        onHide={closeAddModal}
        onSubmit={onAddSubmit}
      />

      <NetworkImportModal
        show={modals.showImportModal}
        onHide={closeImportModal}
        onSubmit={onImportSubmit}
      />

      <EditNetworkModal
        show={modals.showEditModal}
        onHide={closeEditModal}
        network={selectedNetwork}
        onSubmit={onEditSubmit}
      />
    </Container>
  );
};

export default NetworkManagement;
