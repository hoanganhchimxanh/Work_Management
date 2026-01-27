import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  ListGroup,
  Badge,
  Button,
  Row,
  Col,
  Spinner,
  Pagination,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import {
  fetchNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
} from "../../services/notification.service";

import { socket } from "../../socket";

const PAGE_SIZE = 10;

function Notification_Page() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNoti, setSelectedNoti] = useState(null);

  const navigate = useNavigate();

  /* =======================
   * Load notifications (REST)
   * ======================= */
  const loadNotifications = useCallback(
    async (currentPage = page) => {
      try {
        setLoading(true);
        const res = await fetchNotifications(currentPage, PAGE_SIZE);

        setNotifications(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Load notifications failed", err);
      } finally {
        setLoading(false);
      }
    },
    [page],
  );

  useEffect(() => {
    loadNotifications(page);
  }, [page, loadNotifications]);

  /* =======================
   * Socket realtime
   * ======================= */
  useEffect(() => {
    const handler = (noti) => {
      // Chỉ prepend nếu đang ở trang 1
      if (page !== 1) return;

      setNotifications((prev) => {
        // Chống trùng notification
        if (prev.some((n) => n._id === noti._id)) return prev;
        return [noti, ...prev].slice(0, PAGE_SIZE);
      });
    };

    socket.on("notification:new", handler);

    return () => {
      socket.off("notification:new", handler);
    };
  }, [page]);

  /* =======================
   * Actions
   * ======================= */
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
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

  const handleConfirmDelete = (noti, e) => {
    e.stopPropagation();
    setSelectedNoti(noti);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedNoti) return;

    try {
      await deleteNotification(selectedNoti._id);

      setNotifications((prev) =>
        prev.filter((n) => n._id !== selectedNoti._id),
      );

      setShowDeleteModal(false);
      setSelectedNoti(null);
    } catch (err) {
      console.error("Delete notification failed", err);
    }
  };

  const handleClickNotification = async (noti) => {
    if (!noti.isRead) {
      await handleMarkAsRead(noti._id);
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
      <Row className="mb-3 align-items-center">
        <Col>
          <h3>Thông báo</h3>
        </Col>
        <Col className="text-end d-flex justify-content-end gap-2">
          <Button
            size="sm"
            variant="outline-primary"
            onClick={() => loadNotifications(page)}
          >
            Làm mới
          </Button>
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

              <div className="d-flex flex-column align-items-end gap-2">
                {!noti.isRead && (
                  <Badge bg="danger" pill>
                    Mới
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={(e) => handleConfirmDelete(noti, e)}
                >
                  Xóa
                </Button>
              </div>
            </ListGroup.Item>
          ))
        )}
      </ListGroup>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-content-center mt-3">
          <Pagination.Prev
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          />
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i}
              active={i + 1 === page}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          />
        </Pagination>
      )}

      {/* Confirm Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xóa thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa thông báo này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Notification_Page;
