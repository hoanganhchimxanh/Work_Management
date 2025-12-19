// src/pages/NetworkManagement/NetworkManagement.jsx
import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import NetworkFilters from "../../components/accountant/networkManagement/NetworkFilters";
import NetworkTable from "../../components/accountant/networkManagement/NetworkTable";

import config from "../../configs/api";

const NetworkManagement = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    location: "",
    country: "",
  });
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

  useEffect(() => {
    fetchNetworks();
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
        `${config.backendBase}/network/export-excel?${queryParams}`,
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

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Network</h2>
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

      <NetworkTable networks={filteredNetworks} loading={loading} />
    </Container>
  );
};

export default NetworkManagement;
