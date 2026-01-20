import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Table,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import axios from "axios";

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

  // Form states
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [editedLocation, setEditedLocation] = useState("");
  const [locationNetworks, setLocationNetworks] = useState([]);

  const [allNetworks, setAllNetworks] = useState([]);

  // Add new location form
  const [newLocationForm, setNewLocationForm] = useState({
    adSenseLocation: "",
    networkId: "",
  });

  // Fetch all networks for dropdown
  const fetchAllNetworks = async () => {
    try {
      const response = await axios.get("http://localhost:9999/network/get-all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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

  // Fetch networks by location
  const fetchNetworksByLocation = async (location) => {
    try {
      const response = await axios.get(
        `http://localhost:9999/network/locations/${encodeURIComponent(location)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setLocationNetworks(response.data.data || []);
      setShowDetailsModal(true);
    } catch (err) {
      setAlert({
        variant: "danger",
        message:
          err.response?.data?.message || "Không thể tải danh sách network",
      });
    }
  };

  // Handle add new location (Actually update a network's address)
  const handleAddLocation = async (e) => {
    e.preventDefault();

    if (!newLocationForm.adSenseLocation.trim()) {
      setAlert({
        variant: "danger",
        message: "Vui lòng nhập địa chỉ AdSense!",
      });
      return;
    }

    if (!newLocationForm.networkId) {
      setAlert({
        variant: "danger",
        message: "Vui lòng chọn network!",
      });
      return;
    }

    try {
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

      setAlert({
        variant: "success",
        message: "Thêm địa chỉ cho network thành công!",
      });

      setShowAddModal(false);
      setNewLocationForm({
        adSenseLocation: "",
        networkId: "",
      });
      fetchLocations();
      fetchAllNetworks();
    } catch (err) {
      setAlert({
        variant: "danger",
        message: err.response?.data?.message || "Thêm địa chỉ thất bại",
      });
    }
  };

  // Handle edit location
  const handleEditLocation = async () => {
    if (!editedLocation.trim()) {
      setAlert({ variant: "danger", message: "Vui lòng nhập địa chỉ mới!" });
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

      setAlert({
        variant: "success",
        message: response.data.message,
      });
      setShowEditModal(false);
      setSelectedLocation(null);
      setEditedLocation("");
      fetchLocations();
    } catch (err) {
      setAlert({
        variant: "danger",
        message: err.response?.data?.message || "Cập nhật địa chỉ thất bại",
      });
    }
  };

  // Handle delete location
  const handleDeleteLocation = async () => {
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

      setAlert({
        variant: "success",
        message: response.data.message,
      });
      setShowDeleteModal(false);
      setSelectedLocation(null);
      fetchLocations();
    } catch (err) {
      setAlert({
        variant: "danger",
        message: err.response?.data?.message || "Xóa địa chỉ thất bại",
      });
    }
  };

  // Open add modal
  const openAddModal = () => {
    setNewLocationForm({
      adSenseLocation: "",
      networkId: "",
    });
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (location) => {
    setSelectedLocation(location);
    setEditedLocation(location.adSenseLocation);
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (location) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };

  // Open details modal
  const openDetailsModal = (location) => {
    setSelectedLocation(location);
    fetchNetworksByLocation(location.adSenseLocation);
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

      {/* Alert */}
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

      {/* Error */}
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

      {/* Summary */}
      <div className="mb-3">
        <strong>Tổng số địa chỉ duy nhất:</strong> {locations.length}
      </div>

      {/* Table */}
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

      {/* Add Location Modal */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm địa chỉ mới</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddLocation}>
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
                {allNetworks.map((network) => (
                  <option key={network._id} value={network._id}>
                    {network.profileAdsenseId} {network.pubId ? `(${network.pubId})` : ""} - {network.emailAddress || "Không có email"}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              <i className="bi bi-plus-circle"></i> Thêm địa chỉ
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
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
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEditLocation}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Bạn có chắc chắn muốn xóa địa chỉ{" "}
            <strong>{selectedLocation?.adSenseLocation}</strong>?
          </p>
          <p className="text-danger">
            <i className="bi bi-exclamation-triangle"></i> Địa chỉ sẽ bị xóa
            khỏi tất cả network đang sử dụng nó.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteLocation}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        size="lg"
      >
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
              {locationNetworks.map((network) => (
                <tr key={network._id}>
                  <td>
                    <code>{network.profileAdsenseId}</code>
                  </td>
                  <td>{network.pubId || "-"}</td>
                  <td>{network.emailAddress || "-"}</td>
                  <td>
                    <Badge
                      bg={network.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {network.status}
                    </Badge>
                  </td>
                  <td>{network.note}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default AddressTable;
