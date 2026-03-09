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

import {
  fetchNotifications,
  markNotificationRead,
  markAllRead,
  deleteNotification,
} from "../../services/notification.service";

import { socket } from "../../socket";

// Custom hooks
import useNotifications from "../../hooks/useNotifications";

function Notification_Page() {
  const {
    notifications,
    loading,
    page,
    setPage,
    totalPages,
    showDeleteModal,
    selectedNoti,
    loadNotifications,
    handleMarkAllRead,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    handleMouseUpNotification,
  } = useNotifications();

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
              // Bỏ prop `action` để không block việc select text
              // Thay bằng cursor pointer thủ công khi chưa đọc
              onMouseUp={() => handleMouseUpNotification(noti)}
              className={`d-flex justify-content-between align-items-start ${!noti.isRead ? "fw-bold bg-light" : ""
                }`}
              style={{ cursor: !noti.isRead ? "pointer" : "default" }}
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
                  onClick={(e) => openDeleteModal(noti, e)}
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
        onHide={closeDeleteModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Xóa thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn xóa thông báo này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeDeleteModal}>
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
