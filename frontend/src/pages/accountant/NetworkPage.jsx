import React from "react";
import { Container, Table } from "react-bootstrap";

function NetworkPage() {
  return (
    <Container fluid>
      <h1>Quản lý Network</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nhân viên</th>
            <th>Lịch kiểm tra</th>
            <th>Profile AdSense</th>
            <th>Email của Profile AdSense</th>
            <th>Recovery Email</th>
            <th>Ngày tạo Profile AdSense</th>
            <th>Thông tin thuế</th>
            <th>Vị trí làm việc</th>
            <th>Kênh liên kết</th>
            <th>Link kênh</th>
            <th>Email quản lý kênh</th>
            <th>Ngày tạo kênh</th>
            <th>Quốc gia</th>
            <th>Trạng thái</th>
            <th>Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>...</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default NetworkPage;
