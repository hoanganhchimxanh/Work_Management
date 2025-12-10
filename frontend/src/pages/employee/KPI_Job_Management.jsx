import React from "react";
import { Container } from "react-bootstrap";
import TaskTable from "../../components/employee/kpiJobManagement/TaskTable";
import KPITable from "../../components/employee/kpiJobManagement/KPITable";

function KPI_Job_Management() {
  return (
    <Container fluid>
      <TaskTable />
      <KPITable />
    </Container>
  );
}

export default KPI_Job_Management;
