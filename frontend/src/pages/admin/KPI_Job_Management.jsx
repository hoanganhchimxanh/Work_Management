import React from "react";
import { Button, Container, Form, Table } from "react-bootstrap";

function KPI_Job_Management() {
  return (
    <Container fluid>
      <h1>Quản lý giao việc & KPI</h1>

      <h5>Thống kê KPI</h5>
      <Form.Select aria-label="Default select example">
        <option>Sắp xếp theo</option>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
      </Form.Select>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nhân viên</th>
            <th>KPI Doanh thu</th>
            <th>KPI Kênh BKT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Trần Văn A</td>
            <td>Nhân viên</td>
            <td>test@company.com</td>
          </tr>
        </tbody>
      </Table>

      <h5>Danh sách công việc</h5>
      <Form.Select aria-label="Default select example">
        <option>Sắp xếp theo</option>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
      </Form.Select>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên</th>
            <th>Nội dung</th>
            <th>Người chịu trách nhiệm</th>
            <th>Trạng thái</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Trần Văn A</td>
            <td>Nhân viên</td>
            <td>test@company.com</td>
            <td>test@company.com</td>
            <td>test@company.com</td>
            <td>test@company.com</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default KPI_Job_Management;
