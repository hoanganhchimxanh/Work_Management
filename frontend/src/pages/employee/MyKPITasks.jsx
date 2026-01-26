import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  Tabs,
  Tab,
  Toast,
  ToastContainer,
} from "react-bootstrap";

import EmployeeKPITable from "../../components/employee/kpiTaskManagement/tables/EmpolyeeKPITable";
import EmployeeTaskTable from "../../components/employee/kpiTaskManagement/tables/EmployeeTaskTable";

import useAuth from "../../hooks/useAuth";
import useMyKPIs from "../../hooks/employee/kpiTaskManagement/useMyKPIs";
import useMyTasks from "../../hooks/employee/kpiTaskManagement/useMyTasks";
import useToastNotification from "../../hooks/employee/kpiTaskManagement/useToastNotification";

function MyKPITasks() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("kpi");

  // KPIs hook
  const {
    kpis,
    loading: loadingKPIs,
    error: kpiError,
    refetch: refetchKPIs,
  } = useMyKPIs(token);

  // Tasks hook
  const {
    tasks,
    loading: loadingTasks,
    error: taskError,
    refetch: refetchTasks,
    updateTaskStatus,
  } = useMyTasks(token);

  // Toast notification hook
  const { showToast, toastMessage, toastVariant, showNotification, hideToast } =
    useToastNotification();

  // Combined error state
  const error = kpiError || taskError;

  // Handle task status update
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const result = await updateTaskStatus(taskId, newStatus);

      // Show success notification
      const statusLabels = {
        PENDING: "Chờ xử lý",
        IN_PROGRESS: "Đang làm",
        COMPLETED: "Hoàn thành",
        WAITING: "Đang chờ",
      };

      showNotification(
        `Đã cập nhật trạng thái thành: ${statusLabels[result.newStatus]}`,
        "success",
      );
    } catch (err) {
      showNotification(err.message, "danger");
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>KPI & Công việc của tôi</h1>
          <p className="text-muted">Theo dõi KPI và công việc được giao</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible>
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {/* KPI Tab */}
        <Tab eventKey="kpi" title="KPI của tôi">
          <Row>
            <Col>
              <EmployeeKPITable
                kpis={kpis}
                loading={loadingKPIs}
                onRefresh={refetchKPIs}
              />
            </Col>
          </Row>
        </Tab>

        {/* Task Tab */}
        <Tab eventKey="task" title="Công việc của tôi">
          <Row>
            <Col>
              <EmployeeTaskTable
                tasks={tasks}
                loading={loadingTasks}
                onRefresh={refetchTasks}
                onUpdateStatus={handleUpdateTaskStatus}
              />
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          show={showToast}
          onClose={hideToast}
          delay={3000}
          autohide
          bg={toastVariant}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastVariant === "success" ? "Thành công" : "Lỗi"}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

export default MyKPITasks;
