import React from "react";
import { Button, Container, Form, Table } from "react-bootstrap";

function User_Management() {
  return (
    <Container fluid>
      <h1>Quản lý nhân sự</h1>
      <Button>Thêm nhân sự mới</Button>
      <Form.Control type="text" placeholder="Nhập tên nhân sự để tìm kiếm..." />
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
            <th>Họ và tên</th>
            <th>Vai trò</th>
            <th>Email công ty</th>
            <th>Email cá nhân</th>
            <th>Trạng thái</th>
            <th>Số kênh sở hữu</th>
            <th>Ngày tham gia</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Trần Văn A</td>
            <td>Nhân viên</td>
            <td>test@company.com</td>
            <td>personal@gmail.com</td>
            <td>Active</td>
            <td>10</td>
            <td>1/1/2025</td>
            <td>
              <Button>Xem chi tiết</Button>
              <Button>Xóa</Button>
              <Button>Đổi trạng thái</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default User_Management;
