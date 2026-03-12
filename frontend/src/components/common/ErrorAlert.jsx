import React from "react";
import { Alert, Container } from "react-bootstrap";

const ErrorAlert = ({ error, onClose, container = false }) => {
  if (!error) return null;

  const content = (
    <Alert variant="danger" dismissible={!!onClose} onClose={onClose}>
      {typeof error === "string" ? error : error.message || "Đã có lỗi xảy ra"}
    </Alert>
  );

  if (container) {
    return <Container fluid className="mt-4">{content}</Container>;
  }

  return content;
};

export default ErrorAlert;
