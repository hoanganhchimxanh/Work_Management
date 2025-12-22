import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  ListGroup,
  Badge,
  Button,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import {
  fetchNotifications,
  markNotificationRead,
  markAllRead,
} from "../../services/notification.service";

import { socket } from "../../socket";

function Notification_Page() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* =======================
   * Load notifications (REST)
   * ======================= */
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Load notifications failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  /* =======================
   * Socket realtime
   * ======================= */
  useEffect(() => {
    const handler = (noti) => {
      setNotifications((prev) => {
        // Chống trùng notification
        if (prev.some((n) => n._id === noti._id)) return prev;
        return [noti, ...prev];
      });
    };

    socket.on("notification:new", handler);

    return () => {
      socket.off("notification:new", handler);
    };
  }, []);

  /* =======================
   * Actions
   * ======================= */
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Mark read failed", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Mark all read failed", err);
    }
  };

  const handleClickNotification = (noti) => {
    if (!noti.isRead) {
      handleMarkAsRead(noti._id);
    }

    // Điều hướng theo loại notification
    switch (noti.type) {
      case "TASK":
        if (noti.metadata?.taskId) {
          navigate(`/tasks/${noti.metadata.taskId}`);
        }
        break;

      case "TEAM":
        if (noti.metadata?.teamId) {
          navigate(`/teams/${noti.metadata.teamId}`);
        }
        break;

      case "KPI":
        navigate("/kpi");
        break;

      case "CHANNEL":
        navigate("/channels");
        break;

      default:
        break;
    }
  };

  /* =======================
   * UI helpers
   * ======================= */
  const getTypeBadge = (type) => {
    const map = {
      SYSTEM: "secondary",
      CHANNEL: "danger",
      USER: "info",
      TASK: "primary",
      KPI: "success",
      TEAM: "warning",
    };
    return <Badge bg={map[type] || "dark"}>{type}</Badge>;
  };

  /* =======================
   * Render
   * ======================= */
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

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
            onClick={handleMarkAllRead}
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
              key={noti._id}
              action
              onClick={() => handleClickNotification(noti)}
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
                <div className="text-muted small">
                  {new Date(noti.createdAt).toLocaleString()}
                </div>
              </div>

              {!noti.isRead && (
                <Badge bg="danger" pill>
                  Mới
                </Badge>
              )}
            </ListGroup.Item>
          ))
        )}
      </ListGroup>
    </Container>
  );
}

export default Notification_Page;
