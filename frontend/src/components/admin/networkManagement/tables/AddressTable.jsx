import React, { useState, useEffect } from "react";
import { Button, Container, Table, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import AddLocationModal from "../modals/AddLocationModal";
import EditLocationModal from "../modals/EditLocationModal";
import DeleteLocationModal from "../modals/DeleteLocationModal";
import LocationDetailsModal from "../modals/LocationDetailsModal";

function AddressTable() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [allNetworks, setAllNetworks] = useState([]);

  // Fetch all networks for dropdown
  const fetchAllNetworks = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9999/network/get-all",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setAllNetworks(response.data.data || []);
    } catch (err) {
      console.error("Error fetching networks:", err);
    }
  };

  // Fetch unique locations
  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        "http://localhost:9999/network/locations/unique",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setLocations(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không thể tải danh sách địa chỉ",
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => setShowAddModal(true);

  const openEditModal = (location) => {
    setSelectedLocation(location);
    setShowEditModal(true);
  };

  const openDeleteModal = (location) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (location) => {
    setSelectedLocation(location);
    setShowDetailsModal(true);
  };

  const handleSuccess = (message) => {
    setAlert({ variant: "success", message });
    fetchLocations();
  };

  const handleError = (message) => {
    setAlert({ variant: "danger", message });
  };

  useEffect(() => {
    fetchLocations();
    fetchAllNetworks();
  }, []);

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Quản lý Địa chỉ AdSense</h4>
        <div>
          <Button
            variant="outline-primary"
            onClick={fetchLocations}
            className="me-2"
          >
            <i className="bi bi-arrow-clockwise"></i> Làm mới
          </Button>
          <Button variant="primary" onClick={openAddModal}>
            <i className="bi bi-plus-circle"></i> Thêm địa chỉ mới
          </Button>
        </div>
      </div>

      {alert && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert(null)}
          className="mb-3"
        >
          {alert.message}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setError(null)}
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      <div className="mb-3">
        <strong>Tổng số địa chỉ duy nhất:</strong> {locations.length}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th style={{ width: "5%" }}>STT</th>
              <th style={{ width: "20%" }}>Profile AdSense ID</th>
              <th style={{ width: "50%" }}>Địa chỉ</th>
              <th style={{ width: "25%" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {locations.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted">
                  Chưa có địa chỉ nào
                </td>
              </tr>
            ) : (
              locations.map((location, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <code>{location.profileAdsenseId}</code>
                  </td>
                  <td>{location.adSenseLocation}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => openDetailsModal(location)}
                    >
                      <i className="bi bi-eye"></i> Chi tiết
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => openEditModal(location)}
                    >
                      <i className="bi bi-pencil"></i> Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteModal(location)}
                    >
                      <i className="bi bi-trash"></i> Xóa
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      <AddLocationModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        allNetworks={allNetworks}
        onSuccess={handleSuccess}
        onError={handleError}
        fetchAllNetworks={fetchAllNetworks}
      />

      <EditLocationModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        selectedLocation={selectedLocation}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <DeleteLocationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        selectedLocation={selectedLocation}
        onSuccess={handleSuccess}
        onError={handleError}
      />

      <LocationDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        selectedLocation={selectedLocation}
      />
    </Container>
  );
}

export default AddressTable;
