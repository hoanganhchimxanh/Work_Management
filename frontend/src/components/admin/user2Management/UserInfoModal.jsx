import React from "react";
import { Button, Container, Modal } from "react-bootstrap";

function UserInfoModal() {
  return (
    <Container fluid>
      <Modal>
        <Modal.Header closeButton>
          <Modal.Title>Thông tin người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Tên:</p>
          <p>Vai trò:</p>
          <p>Trạng thái:</p>
          <p>SĐT:</p>
          <p>Ngày sinh:</p>
          <p>Facebook:</p>
          <p>Ngày vào làm:</p>
          <p>Phòng ban:</p>
          <p>Ngân hàng:</p>
          <p>STK:</p>
          <p>Đội nhóm:</p>
          <p>Note:</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary">Đóng</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default UserInfoModal;
