import React, { useState, useEffect } from "react";
import { Modal, Button, Table, Badge, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

function LocationDetailsModal({ show, onHide, selectedLocation }) {
  const [locationNetworks, setLocationNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && selectedLocation) {
      fetchNetworksByLocation();
    }
  }, [show, selectedLocation]);

  const fetchNetworksByLocation = async () => {
    if (!selectedLocation?.adSenseLocation) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:9999/network/locations/${encodeURIComponent(
          selectedLocation.adSenseLocation,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setLocationNetworks(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể tải danh sách network",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Network sử dụng địa chỉ này</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Địa chỉ:</strong> {selectedLocation?.adSenseLocation}
        </p>
        <p>
          <strong>Số lượng network:</strong> {locationNetworks.length}
        </p>

        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Profile AdSense ID</th>
                <th>PUB-ID</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {locationNetworks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    Không có network nào
                  </td>
                </tr>
              ) : (
                locationNetworks.map((network) => (
                  <tr key={network._id}>
                    <td>
                      <code>{network.profileAdsenseId}</code>
                    </td>
                    <td>{network.pubId || "-"}</td>
                    <td>{network.emailAddress || "-"}</td>
                    <td>
                      <Badge
                        bg={
                          network.status === "ACTIVE" ? "success" : "secondary"
                        }
                      >
                        {network.status}
                      </Badge>
                    </td>
                    <td>{network.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LocationDetailsModal;
