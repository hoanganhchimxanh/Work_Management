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
import api from "../../services/api.service";
import Loader from "../../components/common/Loader";
import ErrorAlert from "../../components/common/ErrorAlert";
import TablePagination from "../../components/common/TablePagination";
import ResourceStats from "../../components/employee/resourceManagement/others/ResourceStats";
import ResourceTable from "../../components/employee/resourceManagement/tables/ResourceTable";
import ManageChannelModal from "../../components/employee/resourceManagement/modals/ManageChannelModal";

function ResourceManagement() {
  // States
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [showManageChannelModal, setShowManageChannelModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Fetch employee's resources and channels
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch resources và channels của employee
      const [resourcesRes, channelsRes] = await Promise.all([
        api.get("/resource/my-resources"),
        api.get("/channel/my-channels"), // Giả sử API endpoint này tồn tại hoặc tương đương
      ]);

      const myResources = resourcesRes.data.data || [];
      setResources(myResources);
      setChannels(channelsRes.data.data || []);

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
    fetchData();
  }, []);

  // Gán kênh cho resource
  const handleAssignChannel = async (resourceId, channelId) => {
    try {
      setError(null);
      await api.post(`/resource/assign-to-channel/${resourceId}`, { channelId });
      setSuccess("Gán kênh cho resource thành công!");
      setShowManageChannelModal(false);
      setSelectedResource(null);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gán kênh");
    }
  };

  // Bỏ kênh khỏi resource
  const handleRemoveChannel = async (resourceId) => {
    if (!window.confirm("Bạn có chắc chắn muốn bỏ kênh khỏi resource này?")) {
      return;
    }

    try {
      setError(null);
      await api.put(`/resource/update/${resourceId}`, { assignedChannel: null });
      setSuccess("Đã bỏ kênh khỏi resource!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi bỏ kênh");
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = filteredResources.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <Loader fullPage />;
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
      <ErrorAlert error={error} onClose={() => setError(null)} />
      
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
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
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
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
        resources={paginatedResources}
        onManageChannel={(resource) => {
          setSelectedResource(resource);
          setShowManageChannelModal(true);
        }}
        onRemoveChannel={handleRemoveChannel}
      />

      <TablePagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
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
