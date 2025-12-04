import React from "react";
import { Button, Container, Form, Table } from "react-bootstrap";

function Network_Management() {
  return (
    <Container fluid>
      <h1>Quản lý network</h1>
      <Form.Control type="text" placeholder="Nhập tên network để tìm kiếm..." />
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
            <th>Tên network</th>
            <th>Tài khoản liên kết</th>
            <th>Kênh liên kết</th>
            <th>Doanh thu</th>
            <th>Ghi chú</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Trần Văn A</td>
            <td>Nhân viên</td>
            <td>test@company.com</td>
            <td>Active</td>
            <td>10</td>
            <td>
              <Button>Xóa</Button>
              <Button>Chỉnh sửa</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default Network_Management;
