import React, { useState, useEffect } from "react";
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
import axios from "axios";
import EmployeeKPITable from "../../components/employee/kpiTaskManagement/EmpolyeeKPITable";
import EmployeeTaskTable from "../../components/employee/kpiTaskManagement/EmployeeTaskTable";
import config from "../../configs/api";

function MyKPITasks() {
  // KPIs state
  const [kpis, setKPIs] = useState([]);
  const [loadingKPIs, setLoadingKPIs] = useState(true);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Error handling
  const [error, setError] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState("kpi");

  // Toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  // Show toast notification
  const showNotification = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  // Fetch KPIs with progress
  const fetchKPIs = async () => {
    try {
      setLoadingKPIs(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${config.backendBase}/kpi/my-kpis-with-progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setKPIs(response.data.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách KPI");
      console.error(err);
    } finally {
      setLoadingKPIs(false);
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.backendBase}/task/my-tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTasks(response.data.data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách công việc");
      console.error(err);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Update task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${config.backendBase}/task/update-status/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === taskId ? { ...task, status: newStatus } : task
          )
        );

        // Show success notification
        const statusLabels = {
          PENDING: "Chờ xử lý",
          IN_PROGRESS: "Đang làm",
          COMPLETED: "Hoàn thành",
          WAITING: "Đang chờ",
        };
        showNotification(
          `Đã cập nhật trạng thái thành: ${statusLabels[newStatus]}`,
          "success"
        );
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      showNotification(
        err.response?.data?.message ||
          "Không thể cập nhật trạng thái công việc",
        "danger"
      );
    }
  };

  useEffect(() => {
    fetchKPIs();
    fetchTasks();
  }, []);

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>KPI & Công việc của tôi</h1>
          <p className="text-muted">Theo dõi KPI và công việc được giao</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
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
                onRefresh={fetchKPIs}
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
                onRefresh={fetchTasks}
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
          onClose={() => setShowToast(false)}
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
