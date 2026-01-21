import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { Search, FunnelFill, ArrowClockwise } from "react-bootstrap-icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ResourceStats from "../../components/employee/resourceManagement/others/ResourceStats";
import ResourceTable from "../../components/employee/resourceManagement/tables/ResourceTable";
import ManageChannelModal from "../../components/employee/resourceManagement/modals/ManageChannelModal";

import config from "../../configs/api";

function ResourceManagement() {
  // States
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showManageChannelModal, setShowManageChannelModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Get userId from token
  const token = localStorage.getItem("token");
  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
    } catch (err) {
      console.error("Error decoding token:", err);
    }
  }

  // Get auth config
  const getAuthConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch employee's resources and channels
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch resources và channels của employee
      const [resourcesRes, channelsRes] = await Promise.all([
        axios.get(
          `${config.backendBase}/resource/my-resources`,
          getAuthConfig(),
        ),
        axios.get(
          `${config.backendBase}/channel/by-owner/${userId}`,
          getAuthConfig(),
        ),
      ]);

      const myResources = resourcesRes.data.data;
      setResources(myResources);
      setChannels(channelsRes.data.data);

      // Calculate stats from fetched resources
      const calculatedStats = {
        total: myResources.length,
        byStatus: {
          AVAILABLE: myResources.filter((r) => r.status === "AVAILABLE").length,
          ASSIGNED: myResources.filter((r) => r.status === "ASSIGNED").length,
          DISABLED: myResources.filter((r) => r.status === "DISABLED").length,
        },
      };
      setStats(calculatedStats);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, []);

  // Gán kênh cho resource
  const handleAssignChannel = async (resourceId, channelId) => {
    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/assign-to-channel/${resourceId}`,
        { channelId },
        getAuthConfig(),
      );
      setSuccess("Gán kênh cho resource thành công!");
      setShowManageChannelModal(false);
      setSelectedResource(null);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gán kênh");
      console.error("Error assigning channel:", err);
    }
  };

  // Bỏ kênh khỏi resource
  const handleRemoveChannel = async (resourceId) => {
    if (!window.confirm("Bạn có chắc chắn muốn bỏ kênh khỏi resource này?")) {
      return;
    }

    try {
      setError("");
      // Gọi API update với assignedChannel = null
      await axios.put(
        `${config.backendBase}/resource/update/${resourceId}`,
        { assignedChannel: null },
        getAuthConfig(),
      );
      setSuccess("Đã bỏ kênh khỏi resource!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi bỏ kênh");
      console.error("Error removing channel:", err);
    }
  };

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchSearch =
      searchQuery === "" ||
      resource.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.recoveryEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = statusFilter === "" || resource.status === statusFilter;

    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-1">Tài nguyên của tôi</h2>
        <p className="text-muted mb-0">
          Quản lý kênh cho các tài nguyên email được gán cho bạn
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Stats */}
      <ResourceStats stats={stats} />

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={5}>
              <Form.Label>
                <Search size={16} className="me-2" />
                Tìm kiếm
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Tìm theo email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>

            <Col md={4}>
              <Form.Label>
                <FunnelFill size={16} className="me-2" />
                Trạng thái
              </Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                <option value="AVAILABLE">Khả dụng</option>
                <option value="ASSIGNED">Đang sử dụng</option>
                <option value="DISABLED">Vô hiệu hóa</option>
              </Form.Select>
            </Col>

            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="outline-secondary"
                className="w-100"
                onClick={fetchData}
              >
                <ArrowClockwise size={16} className="me-2" />
                Làm mới
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          Danh sách Resources ({filteredResources.length})
        </h5>
      </div>
      <ResourceTable
        resources={filteredResources}
        onManageChannel={(resource) => {
          setSelectedResource(resource);
          setShowManageChannelModal(true);
        }}
        onRemoveChannel={handleRemoveChannel}
      />

      {/* Manage Channel Modal */}
      <ManageChannelModal
        show={showManageChannelModal}
        onHide={() => {
          setShowManageChannelModal(false);
          setSelectedResource(null);
        }}
        onAssignChannel={handleAssignChannel}
        resource={selectedResource}
        channels={channels}
      />
    </Container>
  );
}

export default ResourceManagement;
