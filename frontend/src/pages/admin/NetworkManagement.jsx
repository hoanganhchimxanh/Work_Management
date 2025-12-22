import React, { useState, useEffect, useCallback } from "react";
import { Container, Alert } from "react-bootstrap";
import axios from "axios";

import NetworkFilters from "../../components/admin/networkManagement/NetworkFilters";
import NetworkTable from "../../components/admin/networkManagement/NetworkTable";
import NetworkImportModal from "../../components/admin/networkManagement/NetworkImportModal";

import config from "../../configs/api";

const NetworkManagement = () => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    location: "",
    country: "",
  });
  const [alert, setAlert] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  /* ======================
     Helpers
  ====================== */

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  });

  const showAlert = (message, variant = "success") => {
    setAlert({ message, variant });
    setTimeout(() => setAlert(null), 3000);
  };

  /* ======================
     Fetch Networks
  ====================== */

  const fetchNetworks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.country) params.country = filters.country;

      const { data } = await axios.get(
        `${config.backendBase}/network/get-all`,
        {
          params,
          headers: getAuthHeaders(),
        }
      );

      if (data.success) {
        setNetworks(data.data);
      } else {
        showAlert("Lỗi khi tải dữ liệu networks", "danger");
      }
    } catch (error) {
      console.error("Fetch networks error:", error);
      showAlert("Lỗi khi tải dữ liệu networks", "danger");
    } finally {
      setLoading(false);
    }
  }, [filters.status, filters.location, filters.country]);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  /* ======================
     Filters
  ====================== */

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const filteredNetworks = networks.filter((network) => {
    if (!filters.search) return true;
    const keyword = filters.search.toLowerCase();

    return (
      network.profileAdsenseId?.toLowerCase().includes(keyword) ||
      network.emailAddress?.toLowerCase().includes(keyword) ||
      network.assignedUser?.fullName?.toLowerCase().includes(keyword)
    );
  });

  /* ======================
     Export Excel
  ====================== */

  const handleExport = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.location) params.location = filters.location;
      if (filters.country) params.country = filters.country;

      const response = await axios.get(
        `${config.backendBase}/excel/export-network-excel`,
        {
          params,
          headers: getAuthHeaders(),
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `networks_${new Date().toISOString().split("T")[0]}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showAlert("Xuất Excel thành công!");
    } catch (error) {
      console.error("Export error:", error);
      showAlert("Lỗi khi xuất Excel", "danger");
    }
  };

  /* ======================
     Import Excel
  ====================== */

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleImportSubmit = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post(`${config.backendBase}/network/import`, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      showAlert("Import network thành công!");
      setShowImportModal(false);
      fetchNetworks(); // reload list
    } catch (error) {
      console.error("Import error:", error);
      showAlert("Lỗi khi import network", "danger");
    }
  };

  /* ======================
     Render
  ====================== */

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
        onImport={handleImportClick}
      />

      <NetworkImportModal
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onSubmit={handleImportSubmit}
      />

      <div className="mb-3">
        <strong>Tổng số network:</strong> {filteredNetworks.length}
      </div>

      <NetworkTable networks={filteredNetworks} loading={loading} />
    </Container>
  );
};

export default NetworkManagement;
