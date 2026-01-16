import React from "react";
import { Button, Container, Table } from "react-bootstrap";

function AddressTable() {
  return (
    <Container fluid>
      <Button>Thêm địa chỉ mới</Button>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>STT</th>
            <th>Profile AdSense ID</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>ABC12345</td>
            <td>Hà Nội, Việt Nam</td>
            <th>Sửa / Xóa</th>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
}

export default AddressTable;
