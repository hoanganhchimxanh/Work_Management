import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import axios from "axios";

function AddLocationModal({
  show,
  onHide,
  allNetworks,
  onSuccess,
  onError,
  fetchAllNetworks,
}) {
  const [newLocationForm, setNewLocationForm] = useState({
    adSenseLocation: "",
    networkId: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newLocationForm.adSenseLocation.trim()) {
      onError("Vui lòng nhập địa chỉ AdSense!");
      return;
    }

    if (!newLocationForm.networkId) {
      onError("Vui lòng chọn network!");
      return;
    }

    try {
      // Kiểm tra xem network đã có địa chỉ chưa
      const selectedNetwork = allNetworks.find(
        (n) => n._id === newLocationForm.networkId,
      );

      if (
        selectedNetwork?.adSenseLocation &&
        selectedNetwork.adSenseLocation.trim() !== ""
      ) {
        onError(
          `Network này đã có địa chỉ: "${selectedNetwork.adSenseLocation}". Vui lòng chọn network khác hoặc sử dụng chức năng "Sửa" để thay đổi địa chỉ.`,
        );
        return;
      }

      await axios.put(
        `http://localhost:9999/network/update/${newLocationForm.networkId}`,
        {
          adSenseLocation: newLocationForm.adSenseLocation.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      onSuccess("Thêm địa chỉ cho network thành công!");
      setNewLocationForm({
        adSenseLocation: "",
        networkId: "",
      });
      onHide();
      fetchAllNetworks();
    } catch (err) {
      onError(err.response?.data?.message || "Thêm địa chỉ thất bại");
    }
  };

  const handleClose = () => {
    setNewLocationForm({
      adSenseLocation: "",
      networkId: "",
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm địa chỉ mới</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Địa chỉ AdSense <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập địa chỉ AdSense"
              value={newLocationForm.adSenseLocation}
              onChange={(e) =>
                setNewLocationForm({
                  ...newLocationForm,
                  adSenseLocation: e.target.value,
                })
              }
              required
            />
            <Form.Text className="text-muted">
              Địa chỉ này sẽ được gán cho network được chọn bên dưới
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Network tương ứng <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={newLocationForm.networkId}
              onChange={(e) =>
                setNewLocationForm({
                  ...newLocationForm,
                  networkId: e.target.value,
                })
              }
              required
            >
              <option value="">-- Chọn network --</option>
              {allNetworks
                .filter(
                  (network) =>
                    !network.adSenseLocation ||
                    network.adSenseLocation.trim() === "",
                )
                .map((network) => (
                  <option key={network._id} value={network._id}>
                    {network.profileAdsenseId}{" "}
                    {network.pubId ? `(${network.pubId})` : ""} -{" "}
                    {network.emailAddress || "Không có email"}
                  </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Chỉ hiển thị các network chưa có địa chỉ
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            <i className="bi bi-plus-circle"></i> Thêm địa chỉ
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default AddLocationModal;
