import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Tabs, Tab } from "react-bootstrap";
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

  // Fetch KPIs
  const fetchKPIs = async () => {
    try {
      setLoadingKPIs(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${config.backendBase}/kpi/my-kpis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
              />
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default MyKPITasks;
