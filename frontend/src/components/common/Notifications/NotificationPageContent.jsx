import React from "react";
import {
  Container,
  ListGroup,
  Button,
  Row,
  Col,
  Spinner,
  Modal,
} from "react-bootstrap";

// Custom hooks & components
import useNotifications from "../../../hooks/useNotifications";
import NotificationItem from "./NotificationItem";
import TablePagination from "../TablePagination";
import Loader from "../Loader";

function NotificationPageContent() {
  const {
    notifications,
    loading,
    page,
    setPage,
    totalPages,
    showDeleteModal,
    loadNotifications,
    handleMarkAllRead,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    handleMouseUpNotification,
  } = useNotifications();

  /* =======================
   * Render
   * ======================= */
  if (loading) {
    return <Loader fullPage />;
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
            <NotificationItem
              key={noti._id}
              noti={noti}
              onMouseUpNotification={handleMouseUpNotification}
              onOpenDeleteModal={openDeleteModal}
            />
          ))
        )}
      </ListGroup>

      {/* Pagination using shared component */}
      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Confirm Delete Modal */}
      <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
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

export default NotificationPageContent;
