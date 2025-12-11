import React from "react";
import { Button, Container, Table } from "react-bootstrap";

function Channel_Management() {
  return (
    <Container fluid>
      {/* Add new channel modal */}
      <Button>Thêm kênh mới</Button>

      {/* Channel table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tên kênh</th>
            <th>Tài khoản quản lý</th>
            <th>Kênh thương hiệu</th>
            <th>Số người đăng ký</th>
            <th>Số lượt xem</th>
            <th>Doanh thu ước tính</th>
            <th>Trạng thái</th>
            <th>Lần cập nhật gần nhất</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
            <td>1</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default Channel_Management;
