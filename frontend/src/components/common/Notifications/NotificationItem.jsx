import React from "react";
import { ListGroup, Badge, Button } from "react-bootstrap";

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

function NotificationItem({ noti, onMouseUpNotification, onOpenDeleteModal }) {
  return (
    <ListGroup.Item
      // Bỏ prop `action` để không block việc select text
      // Thay bằng cursor pointer thủ công khi chưa đọc
      onMouseUp={() => onMouseUpNotification(noti)}
      className={`d-flex justify-content-between align-items-start ${
        !noti.isRead ? "fw-bold bg-light" : ""
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
          onClick={(e) => onOpenDeleteModal(noti, e)}
        >
          Xóa
        </Button>
      </div>
    </ListGroup.Item>
  );
}

export default NotificationItem;
