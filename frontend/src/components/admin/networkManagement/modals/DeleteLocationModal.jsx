import React from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";

function DeleteLocationModal({
  show,
  onHide,
  selectedLocation,
  onSuccess,
  onError,
}) {
  const handleDelete = async () => {
    try {
      const response = await axios.delete(
        "http://localhost:9999/network/locations/remove",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          data: {
            location: selectedLocation.adSenseLocation,
          },
        },
      );

      onSuccess(response.data.message);
      onHide();
    } catch (err) {
      onError(err.response?.data?.message || "Xóa địa chỉ thất bại");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Xác nhận xóa</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Bạn có chắc chắn muốn xóa địa chỉ{" "}
          <strong>{selectedLocation?.adSenseLocation}</strong>?
        </p>
        <p className="text-danger">
          <i className="bi bi-exclamation-triangle"></i> Địa chỉ sẽ bị xóa khỏi
          tất cả network đang sử dụng nó.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="danger" onClick={handleDelete}>
          Xóa
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteLocationModal;
