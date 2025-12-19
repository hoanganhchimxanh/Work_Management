import React, { useState } from "react";
import { Container, ListGroup, Badge, Button, Row, Col } from "react-bootstrap";

function Notification_Page() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Kênh bị STRIKE",
      message: "Kênh ABC vừa bị YouTube strike bản quyền.",
      type: "CHANNEL",
      isRead: false,
      createdAt: "2025-01-15 09:30",
    },
    {
      id: 2,
      title: "Import Excel thành công",
      message: "Danh sách user đã được import thành công.",
      type: "SYSTEM",
      isRead: true,
      createdAt: "2025-01-14 14:20",
    },
  ]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getTypeBadge = (type) => {
    const map = {
      SYSTEM: "secondary",
      CHANNEL: "danger",
      USER: "info",
    };
    return <Badge bg={map[type] || "dark"}>{type}</Badge>;
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-3">
        <Col>
          <h3>Thông báo</h3>
        </Col>
        <Col className="text-end">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() =>
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
              )
            }
          >
            Đánh dấu tất cả đã đọc
          </Button>
        </Col>
      </Row>

      <ListGroup>
        {notifications.length === 0 ? (
          <div className="text-muted text-center mt-4">Không có thông báo</div>
        ) : (
          notifications.map((noti) => (
            <ListGroup.Item
              key={noti.id}
              className={`d-flex justify-content-between align-items-start ${
                !noti.isRead ? "fw-bold bg-light" : ""
              }`}
            >
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  {getTypeBadge(noti.type)}
                  <span>{noti.title}</span>
                </div>
                <div className="text-muted small">{noti.message}</div>
                <div className="text-muted small">{noti.createdAt}</div>
              </div>

              {!noti.isRead && (
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => markAsRead(noti.id)}
                >
                  Đã đọc
                </Button>
              )}
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Container>
  );
}

export default Notification_Page;
