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
import {
  PlusCircle,
  Search,
  FunnelFill,
  ArrowClockwise,
} from "react-bootstrap-icons";
import axios from "axios";
import ResourceStats from "../../components/admin/resourceManagement/ResourceStats";
import ResourceTable from "../../components/admin/resourceManagement/ResourceTable";
import CreateResourceModal from "../../components/admin/resourceManagement/CreateResourceModal";
import EditResourceModal from "../../components/admin/resourceManagement/EditResourceModal";
import AssignResourceModal from "../../components/admin/resourceManagement/AssignResourceModal";

import config from "../../configs/api";

function ResourceManagement() {
  // States
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Lấy token từ localStorage
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [resourcesRes, statsRes, usersRes, channelsRes] = await Promise.all(
        [
          axios.get(
            `${config.backendBase}/resource/get-all?status=${statusFilter}&assignedUser=${userFilter}`,
            getAuthConfig()
          ),
          axios.get(`${config.backendBase}/resource/stats`, getAuthConfig()),
          axios.get(`${config.backendBase}/user/get-all`, getAuthConfig()),
          axios.get(`${config.backendBase}/channel/get-all`, getAuthConfig()),
        ]
      );

      setResources(resourcesRes.data.data);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setChannels(channelsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải dữ liệu");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, userFilter]);

  // Create resource
  const handleCreate = async (data) => {
    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/create-new`,
        data,
        getAuthConfig()
      );
      setSuccess("Tạo resource thành công!");
      setShowCreateModal(false);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo resource");
      console.error("Error creating resource:", err);
    }
  };

  // Update resource
  const handleUpdate = async (id, data) => {
    try {
      setError("");
      await axios.put(
        `${config.backendBase}/resource/update/${id}`,
        data,
        getAuthConfig()
      );
      setSuccess("Cập nhật resource thành công!");
      setShowEditModal(false);
      setSelectedResource(null);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật resource"
      );
      console.error("Error updating resource:", err);
    }
  };

  // Delete resource
  const handleDelete = async (resource) => {
    if (resource.status === "ASSIGNED") {
      setError("Không thể xóa resource đang được gán! Vui lòng gỡ gán trước.");
      return;
    }

    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa resource "${resource.email}"?`)
    ) {
      return;
    }

    try {
      setError("");
      await axios.delete(
        `${config.backendBase}/resource/delete/${resource._id}`,
        getAuthConfig()
      );
      setSuccess("Xóa resource thành công!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi xóa resource");
      console.error("Error deleting resource:", err);
    }
  };

  // Assign to user
  const handleAssignToUser = async (resourceId, userId) => {
    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/assign-to-user/${resourceId}`,
        { userId },
        getAuthConfig()
      );
      setSuccess("Gán resource cho nhân viên thành công!");
      setShowAssignModal(false);
      setSelectedResource(null);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gán resource");
      console.error("Error assigning resource:", err);
    }
  };

  // Assign to channel
  const handleAssignToChannel = async (resourceId, channelId) => {
    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/assign-to-channel/${resourceId}`,
        { channelId },
        getAuthConfig()
      );
      setSuccess("Gán resource cho kênh thành công!");
      setShowAssignModal(false);
      setSelectedResource(null);
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi gán resource");
      console.error("Error assigning resource:", err);
    }
  };

  // Unassign resource
  const handleUnassign = async (resource) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn gỡ gán resource "${resource.email}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      await axios.post(
        `${config.backendBase}/resource/unassign/${resource._id}`,
        {},
        getAuthConfig()
      );
      setSuccess("Gỡ gán resource thành công!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi gỡ gán resource"
      );
      console.error("Error unassigning resource:", err);
    }
  };

  // Disable resource
  const handleDisable = async (resource) => {
    const note = window.prompt(
      "Nhập lý do vô hiệu hóa (tùy chọn):",
      resource.note || ""
    );

    if (note === null) return; // User cancelled

    try {
      setError("");
      await axios.patch(
        `${config.backendBase}/resource/disable/${resource._id}`,
        { note },
        getAuthConfig()
      );
      setSuccess("Vô hiệu hóa resource thành công!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi vô hiệu hóa resource"
      );
      console.error("Error disabling resource:", err);
    }
  };

  // Enable resource
  const handleEnable = async (resource) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn kích hoạt lại resource "${resource.email}"?`
      )
    ) {
      return;
    }

    try {
      setError("");
      await axios.patch(
        `${config.backendBase}/resource/enable/${resource._id}`,
        {},
        getAuthConfig()
      );
      setSuccess("Kích hoạt resource thành công!");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi kích hoạt resource"
      );
      console.error("Error enabling resource:", err);
    }
  };

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchSearch =
      searchQuery === "" ||
      resource.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.recoveryEmail.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSearch;
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quản lý Resources</h2>
          <p className="text-muted mb-0">
            Quản lý tài nguyên email cho hệ thống
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="d-flex align-items-center gap-2"
        >
          <PlusCircle size={20} />
          Tạo Resource
        </Button>
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
            <Col md={4}>
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

            <Col md={3}>
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

            <Col md={3}>
              <Form.Label>Người quản lý</Form.Label>
              <Form.Select
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">Tất cả</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={2} className="d-flex align-items-end">
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
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              Danh sách Resources ({filteredResources.length})
            </h5>
          </div>
          <ResourceTable
            resources={filteredResources}
            onEdit={(resource) => {
              setSelectedResource(resource);
              setShowEditModal(true);
            }}
            onDelete={handleDelete}
            onAssign={(resource) => {
              setSelectedResource(resource);
              setShowAssignModal(true);
            }}
            onUnassign={handleUnassign}
            onDisable={handleDisable}
            onEnable={handleEnable}
          />
        </Card.Body>
      </Card>

      {/* Modals */}
      <CreateResourceModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        users={users}
        channels={channels}
      />

      <EditResourceModal
        show={showEditModal}
        onHide={() => {
          setShowEditModal(false);
          setSelectedResource(null);
        }}
        onUpdate={handleUpdate}
        resource={selectedResource}
        users={users}
        channels={channels}
      />

      <AssignResourceModal
        show={showAssignModal}
        onHide={() => {
          setShowAssignModal(false);
          setSelectedResource(null);
        }}
        onAssignToUser={handleAssignToUser}
        onAssignToChannel={handleAssignToChannel}
        resource={selectedResource}
        users={users}
        channels={channels}
      />
    </Container>
  );
}

export default ResourceManagement;
