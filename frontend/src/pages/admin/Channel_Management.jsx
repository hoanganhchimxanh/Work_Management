import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999";

function Channel_Management() {
  // States for data
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState(""); // revenue, subscribers

  // Modal states
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Form states for new channel
  const [newChannel, setNewChannel] = useState({
    name: "",
    link: "",
    assignedUser: "",
    network: "",
    status: "ACTIVE",
  });

  // Form states for channel manager
  const [newManager, setNewManager] = useState({
    managerEmail: "",
    role: "MANAGER",
  });

  // Get token from localStorage
  const getToken = () => localStorage.getItem("token");

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const [channelsRes, usersRes, networksRes, analyticsRes] =
        await Promise.all([
          axios.get(`http://localhost:9999/channel/get-all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:9999/user/get-all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:9999/network/get-all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:9999/youtube-analytics/get-all-analytics`,
            {
              params: {
                startDate: "2024-01-01",
                endDate: new Date().toISOString().split("T")[0],
              },
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

      // Merge analytics data with channels
      const channelsWithAnalytics = channelsRes.data.data.map((channel) => {
        const analytics = analyticsRes.data.data.channels.find(
          (a) => a.channelId === channel._id
        );

        return {
          ...channel,
          totalSubscribers:
            (analytics?.totalSubsGained || 0) - (analytics?.totalSubsLost || 0),
          totalRevenue: analytics?.totalRevenue || 0,
        };
      });

      setChannels(channelsWithAnalytics);
      setUsers(usersRes.data.data);
      setNetworks(networksRes.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
      setLoading(false);
    }
  };

  // Handle create new channel
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`http://localhost:9999/channel/add-new`, newChannel, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAddChannelModal(false);
      setNewChannel({
        name: "",
        link: "",
        assignedUser: "",
        network: "",
        status: "ACTIVE",
      });
      fetchData();
      alert("Thêm kênh thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi thêm kênh");
    }
  };

  // Handle add channel manager
  const handleAddManager = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(
        `http://localhost:9999/channel-manager/add-manager/${selectedChannel}`,
        newManager,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowAddManagerModal(false);
      setNewManager({ managerEmail: "", role: "MANAGER" });
      setSelectedChannel(null);
      alert("Thêm người quản lý thành công!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi thêm người quản lý");
    }
  };

  // Filter and sort channels
  const getFilteredChannels = () => {
    let filtered = [...channels];

    // Filter by name
    if (searchName) {
      filtered = filtered.filter((ch) =>
        ch.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    // Filter by user
    if (filterUser) {
      filtered = filtered.filter((ch) => ch.assignedUser?._id === filterUser);
    }

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((ch) => ch.status === filterStatus);
    }

    // Sort
    if (sortBy === "revenue") {
      filtered.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (sortBy === "subscribers") {
      filtered.sort((a, b) => b.totalSubscribers - a.totalSubscribers);
    }

    return filtered;
  };

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: "success",
      HIDDEN: "warning",
      LOCKED: "danger",
      STRIKED: "dark",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const filteredChannels = getFilteredChannels();

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Quản lý Kênh</h2>

      {/* COMPONENT 1: Filters */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo tên kênh..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="">Tất cả nhân sự</option>
            {users.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.fullName}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="HIDDEN">HIDDEN</option>
            <option value="LOCKED">LOCKED</option>
            <option value="STRIKED">STRIKED</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="">Sắp xếp theo...</option>
            <option value="revenue">Doanh thu cao nhất</option>
            <option value="subscribers">Lượt đăng ký cao nhất</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button
            variant="secondary"
            onClick={() => {
              setSearchName("");
              setFilterUser("");
              setFilterStatus("");
              setSortBy("");
            }}
          >
            Xóa bộ lọc
          </Button>
        </Col>
      </Row>

      {/* COMPONENT 2 & 3: Action Buttons */}
      <Row className="mb-3">
        <Col>
          <Button
            variant="primary"
            onClick={() => setShowAddChannelModal(true)}
            className="me-2"
          >
            + Thêm kênh mới
          </Button>
          <Button variant="info" onClick={fetchData}>
            🔄 Làm mới dữ liệu
          </Button>
        </Col>
      </Row>

      {/* COMPONENT 4: Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên kênh</th>
            <th>Trạng thái kênh</th>
            <th>Nhân viên</th>
            <th>Network</th>
            <th>Tổng số người đăng ký</th>
            <th>Doanh thu ước tính</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredChannels.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            filteredChannels.map((channel, index) => (
              <tr key={channel._id}>
                <td>{index + 1}</td>
                <td>
                  <a
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {channel.name}
                  </a>
                </td>
                <td>{getStatusBadge(channel.status)}</td>
                <td>{channel.assignedUser?.fullName || "Chưa gán"}</td>
                <td>
                  {channel.network?.profileAdsenseId || "Chưa có network"}
                </td>
                <td>{channel.totalSubscribers.toLocaleString()}</td>
                <td>${channel.totalRevenue.toFixed(2)}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setSelectedChannel(channel._id);
                      setShowAddManagerModal(true);
                    }}
                  >
                    + Thêm quản lý
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal: Add New Channel */}
      <Modal
        show={showAddChannelModal}
        onHide={() => setShowAddChannelModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm kênh mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateChannel}>
            <Form.Group className="mb-3">
              <Form.Label>Tên kênh *</Form.Label>
              <Form.Control
                type="text"
                required
                value={newChannel.name}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Link kênh *</Form.Label>
              <Form.Control
                type="url"
                required
                placeholder="https://youtube.com/@channelname"
                value={newChannel.link}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, link: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nhân viên quản lý *</Form.Label>
              <Form.Select
                required
                value={newChannel.assignedUser}
                onChange={(e) =>
                  setNewChannel({
                    ...newChannel,
                    assignedUser: e.target.value,
                  })
                }
              >
                <option value="">Chọn nhân viên...</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.fullName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Network</Form.Label>
              <Form.Select
                value={newChannel.network}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, network: e.target.value })
                }
              >
                <option value="">Không chọn</option>
                {networks.map((network) => (
                  <option key={network._id} value={network._id}>
                    {network.profileAdsenseId}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={newChannel.status}
                onChange={(e) =>
                  setNewChannel({ ...newChannel, status: e.target.value })
                }
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="HIDDEN">HIDDEN</option>
                <option value="LOCKED">LOCKED</option>
                <option value="STRIKED">STRIKED</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAddChannelModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm kênh
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal: Add Channel Manager */}
      <Modal
        show={showAddManagerModal}
        onHide={() => setShowAddManagerModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Thêm người quản lý kênh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddManager}>
            <Form.Group className="mb-3">
              <Form.Label>Email quản lý *</Form.Label>
              <Form.Control
                type="email"
                required
                placeholder="manager@gmail.com"
                value={newManager.managerEmail}
                onChange={(e) =>
                  setNewManager({
                    ...newManager,
                    managerEmail: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Vai trò *</Form.Label>
              <Form.Select
                required
                value={newManager.role}
                onChange={(e) =>
                  setNewManager({ ...newManager, role: e.target.value })
                }
              >
                <option value="MANAGER">MANAGER</option>
                <option value="OWNER">OWNER</option>
                <option value="PRIMARY_OWNER">PRIMARY_OWNER</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowAddManagerModal(false)}
              >
                Hủy
              </Button>
              <Button variant="primary" type="submit">
                Thêm người quản lý
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Channel_Management;
