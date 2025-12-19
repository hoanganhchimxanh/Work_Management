import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert, Tabs, Tab } from "react-bootstrap";
import axios from "axios";
import KPITable from "../../components/admin/kpiTaskManagement/KPITable";
import TaskTable from "../../components/admin/kpiTaskManagement/TaskTable";
import KPIModal from "../../components/admin/kpiTaskManagement/KPIModal";
import TaskModal from "../../components/admin/kpiTaskManagement/TaskModal";

import config from "../../configs/api";

function KPI_Task_Management() {
  // KPIs state
  const [kpis, setKPIs] = useState([]);
  const [loadingKPIs, setLoadingKPIs] = useState(true);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Users and Teams state
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  // Modal state
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Error handling
  const [error, setError] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState("kpi");

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token") || "";
  };

  // Fetch KPIs with progress
  const fetchKPIs = async () => {
    try {
      setLoadingKPIs(true);
      const response = await axios.get(
        `${config.backendBase}/kpi/get-all-with-progress`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
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
      const response = await axios.get(`${config.backendBase}/task/get-all`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
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

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${config.backendBase}/user/get-all`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const normalizedUsers = response.data.data.map((user) => ({
        ...user,
        _id: user.userId,
      }));
      setUsers(normalizedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Fetch Teams
  const fetchTeams = async () => {
    try {
      const response = await axios.get(
        `${config.backendBase}/team/get-all-team`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );
      setTeams(response.data.data);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  useEffect(() => {
    fetchKPIs();
    fetchTasks();
    fetchUsers();
    fetchTeams();
  }, []);

  // KPI handlers
  const handleCreateKPI = () => {
    setSelectedKPI(null);
    setShowKPIModal(true);
  };

  const handleEditKPI = (kpi) => {
    setSelectedKPI(kpi);
    setShowKPIModal(true);
  };

  const handleKPIModalClose = () => {
    setShowKPIModal(false);
    setSelectedKPI(null);
  };

  const handleKPISaved = () => {
    fetchKPIs();
    handleKPIModalClose();
  };

  const handleKPIDeleted = () => {
    fetchKPIs();
  };

  // Task handlers
  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskModalClose = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleTaskSaved = () => {
    fetchTasks();
    handleTaskModalClose();
  };

  const handleTaskDeleted = () => {
    fetchTasks();
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Quản lý giao việc & KPI</h1>
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
        <Tab eventKey="kpi" title="Quản lý KPI">
          <Row className="mb-3">
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <h5>Danh sách KPI</h5>
                <Button variant="primary" onClick={handleCreateKPI}>
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
                onEdit={handleEditKPI}
                onRefresh={fetchKPIs}
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
                <Button variant="success" onClick={handleCreateTask}>
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
                onEdit={handleEditTask}
                onRefresh={fetchTasks}
                onDeleted={handleTaskDeleted}
              />
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Modals */}
      <KPIModal
        show={showKPIModal}
        onHide={handleKPIModalClose}
        kpi={selectedKPI}
        users={users}
        teams={teams}
        onSaved={handleKPISaved}
      />

      <TaskModal
        show={showTaskModal}
        onHide={handleTaskModalClose}
        task={selectedTask}
        users={users}
        teams={teams}
        onSaved={handleTaskSaved}
      />
    </Container>
  );
}

export default KPI_Task_Management;
