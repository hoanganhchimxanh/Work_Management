// src/pages/NetworkManagement/NetworkManagement.jsx
import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import api from "../../services/api.service";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import NetworkFilters from "../../components/accountant/networkManagement/others/NetworkFilters";
import NetworkTable from "../../components/accountant/networkManagement/tables/NetworkTable";


const NetworkManagement = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    location: "",
    country: "",
  });
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);

  const fetchNetworks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.country) params.country = filters.country;

      const response = await api.get("/network/get-all", { params });
      
      if (response.data.success) {
        setNetworks(response.data.data);
      } else {
        setError("Lỗi khi tải dữ liệu networks");
      }
    } catch (error) {
      setError("Lỗi khi tải dữ liệu networks");
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
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.country) params.country = filters.country;

      const response = await api.get("/excel/export-network-excel", {
        params,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
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

  if (loading) return <Loader fullPage />;

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Quản lý Network</h2>
      </div>

      <ErrorAlert error={error} onClose={() => setError(null)} />
      
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

      <NetworkTable networks={filteredNetworks} />
    </Container>
  );
};

export default NetworkManagement;
