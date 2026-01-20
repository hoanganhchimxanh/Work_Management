import React from "react";
import { Container, Row, Col, Button, Alert, Tabs, Tab } from "react-bootstrap";

// Components
import KPITable from "../../components/admin/kpiTaskManagement/tables/KPITable";
import TaskTable from "../../components/admin/kpiTaskManagement/tables/TaskTable";
import KPIModal from "../../components/admin/kpiTaskManagement/modals/KPIModal";
import TaskModal from "../../components/admin/kpiTaskManagement/modals/TaskModal";

// Custom hooks
import useAuth from "../../hooks/useAuth";
import useKPITaskData from "../../hooks/admin/kpiTaskManagement/useKPITaskData";
import useKPITaskModals from "../../hooks/admin/kpiTaskManagement/useKPITaskModals";
import useTabNavigation from "../../hooks/admin/kpiTaskManagement/useTabNavigation";

function KPITaskManagement() {
  // 1. Authentication
  const { getAuthConfig } = useAuth();

  // 2. Tab Navigation
  const { activeTab, setActiveTab } = useTabNavigation("kpi");

  // 3. Fetch Data
  const {
    kpis,
    tasks,
    users,
    teams,
    loadingKPIs,
    loadingTasks,
    error,
    setError,
    refetchKPIs,
    refetchTasks,
  } = useKPITaskData(getAuthConfig);

  // 4. Modals
  const {
    modals,
    selected,
    openKPIModal,
    closeKPIModal,
    openTaskModal,
    closeTaskModal,
  } = useKPITaskModals();

  // Callback handlers for modals
  const handleKPISaved = () => {
    refetchKPIs();
    closeKPIModal();
  };

  const handleKPIDeleted = () => {
    refetchKPIs();
  };

  const handleTaskSaved = () => {
    refetchTasks();
    closeTaskModal();
  };

  const handleTaskDeleted = () => {
    refetchTasks();
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Quản lý giao việc & KPI</h1>
        </Col>
      </Row>

      {/* Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {/* KPI Tab */}
        <Tab eventKey="kpi" title="Quản lý KPI">
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h5>Danh sách KPI</h5>
                <Button variant="primary" onClick={() => openKPIModal()}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Tạo KPI mới
                </Button>
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <KPITable
                kpis={kpis}
                loading={loadingKPIs}
                onEdit={openKPIModal}
                onRefresh={refetchKPIs}
                onDeleted={handleKPIDeleted}
              />
            </Col>
          </Row>
        </Tab>

        {/* Task Tab */}
        <Tab eventKey="task" title="Quản lý công việc">
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h5>Danh sách công việc</h5>
                <Button variant="success" onClick={() => openTaskModal()}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Tạo công việc mới
                </Button>
              </div>
            </Col>
          </Row>

          <Row>
            <Col>
              <TaskTable
                tasks={tasks}
                loading={loadingTasks}
                onEdit={openTaskModal}
                onRefresh={refetchTasks}
                onDeleted={handleTaskDeleted}
              />
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* KPI Modal */}
      <KPIModal
        show={modals.showKPIModal}
        onHide={closeKPIModal}
        kpi={selected.kpi}
        users={users}
        teams={teams}
        onSaved={handleKPISaved}
      />

      {/* Task Modal */}
      <TaskModal
        show={modals.showTaskModal}
        onHide={closeTaskModal}
        task={selected.task}
        users={users}
        teams={teams}
        onSaved={handleTaskSaved}
      />
    </Container>
  );
}

export default KPITaskManagement;
