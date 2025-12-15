import React from "react";
import { Button, Container, Table } from "react-bootstrap";

function Channel_Management() {
  return (
    <Container fluid>
      {/* COMPONENT 1 */}
      {/* Filter cho bảng */}
      {/* Lọc bằng tên */}
      {/* Lọc theo nhân sự */}
      {/* Lọc theo trạng thái */}
      {/* Sắp xếp theo doanh thu */}
      {/* Sắp xếp theo tổng số người đăng ký */}

      <Button>Đồng bộ dữ liệu các kênh</Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên kênh</th>
            <th>Nhân sự phụ trách kênh</th>
            <th>Tài khoản quản lý kênh</th>
            <th>Network</th>
            <th>Tổng số người đăng ký</th>
            <th>Doanh thu ước tính</th>
            <th>Ngày BKT</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>...</td>
            <td>
              Hành động bao gồm: 1. Cấp quyền cho hệ thống lấy dữ liệu youtube
              2. Kiểm tra lại quyền xem dữ liệu 4. Hủy quyền xem dữ liệu 3. Sửa
              trạng thái kênh
            </td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default Channel_Management;
