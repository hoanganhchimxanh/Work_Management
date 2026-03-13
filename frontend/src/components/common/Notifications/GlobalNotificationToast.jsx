import React, { useState, useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { socket } from "../../../socket";
import { useNavigate } from "react-router-dom";
import { BellFill } from "react-bootstrap-icons";

const GlobalNotificationToast = () => {
  const [show, setShow] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleNewNotification = (noti) => {
      setNotification(noti);
      setShow(true);

      // Tự động ẩn sau 10 giây nếu là tin nhắn dài
      const duration = noti.message?.length > 100 ? 15000 : 10000;
      setTimeout(() => setShow(false), duration);
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      socket.off("notification:new", handleNewNotification);
    };
  }, []);

  if (!notification) return null;

  // Xác định icon và màu sắc dựa trên type/action
  const getToastVariant = () => {
    if (notification.type === "YOUTUBE_AUTH") {
      if (notification.metadata?.action === "RE_AUTH_REQUIRED") return "danger";
      if (notification.metadata?.action === "TOKEN_REFRESHED") return "success";
    }
    if (notification.title?.includes("Lỗi") || notification.title?.includes("thất bại")) return "warning";
    return "primary";
  };

  const handleToastClick = () => {
    setShow(false);
    // Điều hướng dựa trên role (sẽ lấy từ path hiện tại hoặc AuthContext)
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/admin")) navigate("/admin/notifications");
    else if (currentPath.startsWith("/accountant")) navigate("/accountant/notifications");
    else if (currentPath.startsWith("/employee")) navigate("/employee/notifications");
  };

  return (
    <ToastContainer 
      position="top-end" 
      className="p-3" 
      style={{ zIndex: 9999, position: 'fixed' }}
    >
      <Toast 
        show={show} 
        onClose={() => setShow(false)} 
        delay={10000} 
        autohide
        onClick={handleToastClick}
        style={{ cursor: 'pointer', minWidth: '300px' }}
        className={`border-${getToastVariant()}`}
      >
        <Toast.Header>
          <BellFill className={`me-2 text-${getToastVariant()}`} />
          <strong className="me-auto">{notification.title}</strong>
          <small className="text-muted">vừa xong</small>
        </Toast.Header>
        <Toast.Body>
          <div className="d-flex flex-column">
             <span>{notification.message}</span>
             <small className="text-primary mt-2 text-end">Nhấn để xem chi tiết →</small>
          </div>
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default GlobalNotificationToast;
