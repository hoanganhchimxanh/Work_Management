import React from "react";
import { Button, Table, Modal, Spinner } from "react-bootstrap";

function networkImportModal() {
  return (
    <Modal>
      <Modal.Header closeButton>
        <Modal.Title>Modal heading</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button>Import Excel</Button>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải dữ liệu...</span>
        </Spinner>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary">Hủy</Button>
        <Button variant="primary">Save Changes</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default networkImportModal;
