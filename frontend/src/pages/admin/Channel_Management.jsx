import React from "react";
import { Button, Container, Form, Table } from "react-bootstrap";

function Channel_Management() {
  return (
    <Container fluid>
      <h1>Quản lý kênh</h1>
      <Form.Control type="text" placeholder="Nhập tên kênh để tìm kiếm..." />
      <Form.Select aria-label="Default select example">
        <option>Sắp xếp theo</option>
        <option value="1">One</option>
        <option value="2">Two</option>
        <option value="3">Three</option>
      </Form.Select>
      <Button>Xuất Excel</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tên kênh</th>
            <th>Người đăng ký</th>
            <th>Doanh thu</th>
            <th>Ngày BKT</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Trần Văn A</td>
            <td>Nhân viên</td>
            <td>test@company.com</td>
            <td>Active</td>
            <td>10</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default Channel_Management;
