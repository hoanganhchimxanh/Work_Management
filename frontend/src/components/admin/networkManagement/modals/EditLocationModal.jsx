import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import axios from "axios";

function EditLocationModal({
  show,
  onHide,
  selectedLocation,
  onSuccess,
  onError,
}) {
  const [editedLocation, setEditedLocation] = useState("");

  useEffect(() => {
    if (selectedLocation) {
      setEditedLocation(selectedLocation.adSenseLocation);
    }
  }, [selectedLocation]);

  const handleEdit = async () => {
    if (!editedLocation.trim()) {
      onError("Vui lòng nhập địa chỉ mới!");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:9999/network/locations/bulk-update",
        {
          oldLocation: selectedLocation.adSenseLocation,
          newLocation: editedLocation.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      onSuccess(response.data.message);
      onHide();
    } catch (err) {
      onError(err.response?.data?.message || "Cập nhật địa chỉ thất bại");
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Sửa địa chỉ</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ hiện tại</Form.Label>
            <Form.Control
              type="text"
              value={selectedLocation?.adSenseLocation || ""}
              disabled
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ mới</Form.Label>
            <Form.Control
              type="text"
              value={editedLocation}
              onChange={(e) => setEditedLocation(e.target.value)}
              placeholder="Nhập địa chỉ mới"
            />
            <Form.Text className="text-muted">
              Thay đổi này sẽ áp dụng cho tất cả network có địa chỉ hiện tại.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleEdit}>
          Cập nhật
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditLocationModal;
