import React from "react";
import { Card, Container, Row } from "react-bootstrap";

function Profile() {
  return (
    <Container fluid>
      <h1>Thông tin cá nhân</h1>
      <p>Xem thông tin tài khoản và nhóm</p>
      <Row md={7}>
        <Card>
          <Card.Body>
            <Card.Title>Thông tin tài khoản</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Tên</Card.Subtitle>
            <Card.Text>Email công ty</Card.Text>
            <hr />
            <Card.Text>Vai trò</Card.Text>
            <hr />
            <Card.Text>Ngày tham gia</Card.Text>
          </Card.Body>
        </Card>
      </Row>
      <Row md={5}>
        <Card>
          <Card.Body>
            <Card.Title>Thông tin nhóm</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Tên nhóm</Card.Subtitle>
            <Card.Text>Bạn đang tham gia nhóm với vai trò: ...</Card.Text>
            <Card.Text>Danh sách thành viên:</Card.Text>
          </Card.Body>
        </Card>
      </Row>
    </Container>
  );
}

export default Profile;
