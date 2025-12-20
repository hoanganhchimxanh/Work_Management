import React, { useState, useEffect } from "react";
import { Container, Button, Alert } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import NetworkFilters from "../../components/admin/networkManagement/NetworkFilters";
import NetworkTable from "../../components/admin/networkManagement/NetworkTable";
import NetworkFormModal from "../../components/admin/networkManagement/NetworkFormModal";

import config from "../../configs/api";

const NetworkManagement = () => {
  const [networks, setNetworks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    location: "",
    country: "",
  });
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [alert, setAlert] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("token") || "";
  };

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.country) queryParams.append("country", filters.country);

      const response = await fetch(
        `${config.backendBase}/network/get-all?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setNetworks(data.data);
      } else {
        showAlert("Lỗi khi tải dữ liệu networks", "danger");
      }
    } catch (error) {
      showAlert("Lỗi khi tải dữ liệu networks", "danger");
      console.error("Error fetching networks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${config.backendBase}/user/get-all`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchNetworks();
    fetchUsers();
  }, [filters.status, filters.location, filters.country]);

  const filteredNetworks = networks.filter((network) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      network.profileAdsenseId?.toLowerCase().includes(searchLower) ||
      network.emailAddress?.toLowerCase().includes(searchLower) ||
      network.assignedUser?.fullName?.toLowerCase().includes(searchLower)
    );
  });

  const showAlert = (message, variant = "success") => {
    setAlert({ message, variant });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleExport = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.location) queryParams.append("location", filters.location);
      if (filters.country) queryParams.append("country", filters.country);

      const response = await fetch(
        `${config.backendBase}/excel/export-network-excel?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `networks_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showAlert("Xuất Excel thành công!");
    } catch (error) {
      showAlert("Lỗi khi xuất Excel", "danger");
      console.error("Error exporting:", error);
    }
  };

  const handleEdit = (network) => {
    setSelectedNetwork(network);
    setShowFormModal(true);
  };

  const handleDelete = async (network) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa network ${network.profileAdsenseId}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${config.backendBase}/network/delete/${network._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        showAlert("Xóa network thành công!");
        fetchNetworks();
      } else {
        showAlert(data.message || "Lỗi khi xóa network", "danger");
      }
    } catch (error) {
      showAlert("Lỗi khi xóa network", "danger");
      console.error("Error deleting network:", error);
    }
  };

  const handleSave = async (formData) => {
    try {
      const url = selectedNetwork
        ? `${config.backendBase}/network/update/${selectedNetwork._id}`
        : `${config.backendBase}/network/create-new`;

      const method = selectedNetwork ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        showAlert(
          selectedNetwork
            ? "Cập nhật network thành công!"
            : "Thêm network thành công!"
        );
        setShowFormModal(false);
        setSelectedNetwork(null);
        fetchNetworks();
      } else {
        showAlert(data.message || "Có lỗi xảy ra", "danger");
      }
    } catch (error) {
      showAlert("Lỗi khi lưu network", "danger");
      console.error("Error saving network:", error);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Network</h2>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedNetwork(null);
            setShowFormModal(true);
          }}
        >
          <Plus className="me-2" />
          Thêm Network
        </Button>
      </div>

      {alert && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <NetworkFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
      />

      <div className="mb-3">
        <strong>Tổng số network:</strong> {filteredNetworks.length}
      </div>
      <NetworkTable
        networks={filteredNetworks}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <NetworkFormModal
        show={showFormModal}
        network={selectedNetwork}
        users={users}
        onHide={() => {
          setShowFormModal(false);
          setSelectedNetwork(null);
        }}
        onSave={handleSave}
      />
    </Container>
  );
};

export default NetworkManagement;
