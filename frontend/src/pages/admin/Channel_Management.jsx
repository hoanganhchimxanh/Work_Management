import React from "react";
import { Container, Table } from "react-bootstrap";

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

      {/* COMPONENT 2 */}
      {/* Nút "Thêm kênh mới" */}
      {/* Modal tạo kênh mới */}

      {/* COMPONENT 3 */}
      {/* Nút "Thêm người quản lý kênh" */}
      {/* Modal thêm quản lý kênh */}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên kênh</th>
            <th>Trạng thái kênh</th>
            <th>Tài khoản quản lý kênh</th>
            <th>Network</th>
            <th>Tổng số người đăng ký</th>
            <th>Doanh thu ước tính</th>
            <th>Ngày BKT</th>
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

export default Channel_Management;
