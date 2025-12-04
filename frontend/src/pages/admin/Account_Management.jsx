import React from "react";
import { Button, Container, Form, Table } from "react-bootstrap";

function Account_Management() {
  return (
    <Container fluid>
      <h1>Quản lý tài khoản</h1>
      <Button>Thêm tài khoản mới</Button>
      <Button>Bàn giao gmail cho nhân sự</Button>
      <Form.Control
        type="text"
        placeholder="Nhập tên tài khoản để tìm kiếm..."
      />
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
            <th>Email</th>
            <th>Mật khẩu</th>
            <th>Người sở hữu</th>
            <th>Kênh liên kết</th>
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

export default Account_Management;
