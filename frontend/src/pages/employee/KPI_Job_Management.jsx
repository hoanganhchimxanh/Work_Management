// KPI_Job_Management.jsx
import React, { useState } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import TaskTable from "../../components/employee/kpiJobManagement/TaskTable";
import KPITable from "../../components/employee/kpiJobManagement/KPITable";

function KPI_Job_Management() {
  // Quản lý tab đang active (mặc định là tab công việc)
  const [key, setKey] = useState("tasks");

  return (
    <Container fluid className="py-4">
      <h1 className="mb-4 text-center fw-bold">Quản lý Công việc & KPI</h1>

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        {/* Tab Công việc */}
        <Tab eventKey="tasks" title="Công việc của tôi">
          <div className="mt-3">
            <TaskTable />
          </div>
        </Tab>

        {/* Tab KPI */}
        <Tab eventKey="kpis" title="KPI cá nhân">
          <div className="mt-3">
            <KPITable />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
}

export default KPI_Job_Management;
