import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

import config from "../../configs/api";
import ChannelFilter from "../../components/admin/channelManagement/ChannelFilter";
import ChannelTable from "../../components/admin/channelManagement/ChannelTable";

function ChannelManagement() {
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [networks, setNetworks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchName, setSearchName] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();

      const [channelsRes, usersRes, networksRes, analyticsRes] =
        await Promise.all([
          axios.get(`${config.backendBase}/channel/get-all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${config.backendBase}/user/get-all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${config.backendBase}/network/get-all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `${config.backendBase}/youtube-analytics/get-all-analytics`,
            {
              params: {
                startDate: "2024-01-01",
                endDate: new Date().toISOString().split("T")[0],
              },
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

      // Merge analytics vào channel
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
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredChannels = () => {
    let filtered = [...channels];

    if (searchName) {
      filtered = filtered.filter((ch) =>
        ch.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (filterUser) {
      filtered = filtered.filter((ch) => ch.assignedUser?._id === filterUser);
    }

    if (filterStatus) {
      filtered = filtered.filter((ch) => ch.status === filterStatus);
    }

    if (sortBy === "revenue") {
      filtered.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    if (sortBy === "subscribers") {
      filtered.sort((a, b) => b.totalSubscribers - a.totalSubscribers);
    }

    return filtered;
  };

  const filteredChannels = getFilteredChannels();

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 400 }}
      >
        <Spinner animation="border" />
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

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Quản lý Kênh</h2>

      {/* FILTER */}
      <ChannelFilter
        users={users}
        searchName={searchName}
        setSearchName={setSearchName}
        filterUser={filterUser}
        setFilterUser={setFilterUser}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClear={() => {
          setSearchName("");
          setFilterUser("");
          setFilterStatus("");
          setSortBy("");
        }}
      />

      {/* ACTION */}
      <Row className="mb-3">
        <Col>
          <Button variant="info" onClick={fetchData}>
            🔄 Làm mới dữ liệu
          </Button>
        </Col>
      </Row>

      {/* TABLE */}
      <ChannelTable channels={filteredChannels} />
    </Container>
  );
}

export default ChannelManagement;
