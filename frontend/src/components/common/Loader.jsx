import React from "react";
import { Container, Spinner } from "react-bootstrap";

const Loader = ({ message = "Đang tải dữ liệu...", fullPage = false }) => {
  const content = (
    <div className="text-center py-5">
      <Spinner animation="border" variant="primary" />
      {message && <p className="mt-3 text-muted">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        {content}
      </Container>
    );
  }

  return content;
};

export default Loader;
