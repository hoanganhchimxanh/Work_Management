import React, { useState, useEffect, useContext } from "react";
import { Container, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import ChannelActionButtons from "../../components/employee/channelManagement/ChannelActionButtons";
import ChannelTable from "../../components/employee/channelManagement/ChannelTable";
import AddChannelModal from "../../components/employee/channelManagement/AddChannelModal";
import EditChannelModal from "../../components/employee/channelManagement/EditChannelModal";

import config from "../../configs/api";

function EmployeeChannelManagement() {
  const { user } = useContext(AuthContext);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Fetch channels assigned to current user
  const fetchMyChannels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${config.backendBase}/channel/by-owner/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setChannels(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách kênh");
    } finally {
      setLoading(false);
    }
  };

  // Get authorization URL for a channel
  const handleGetAuthUrl = async (channelId) => {
    try {
      const response = await axios.get(
        `${config.backendBase}/youtube-auth/get-auth-url`,
        {
          params: { channelId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Redirect to Google OAuth
        window.location.href = response.data.authUrl;
      }
    } catch (err) {
      console.error("Error getting auth URL:", err);
      alert(err.response?.data?.message || "Không thể lấy URL xác thực");
    }
  };

  // Check authorization status
  const handleCheckAuthStatus = async (channelId) => {
    try {
      const response = await axios.get(
        `${config.backendBase}/youtube-auth/check-status/${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        const { data } = response.data;
        const statusMessage = data.isAuthorized
          ? `✅ Đã xác thực\nTrạng thái: ${data.status}\nHết hạn: ${new Date(
              data.expiresAt
            ).toLocaleString("vi-VN")}`
          : `❌ Chưa xác thực\nLý do: ${data.reason}\n${data.message}`;

        alert(statusMessage);
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      alert(err.response?.data?.message || "Không thể kiểm tra trạng thái");
    }
  };

  // Revoke authorization
  const handleRevokeAuth = async (channelId) => {
    if (!window.confirm("Bạn có chắc muốn thu hồi quyền truy cập?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${config.backendBase}/youtube-auth/revoke/${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Thu hồi quyền thành công!");
        fetchMyChannels(); // Refresh list
      }
    } catch (err) {
      console.error("Error revoking auth:", err);
      alert(err.response?.data?.message || "Không thể thu hồi quyền");
    }
  };

  // Sync channel analytics
  const handleSyncChannel = async (channelId) => {
    const startDate = prompt("Nhập ngày bắt đầu (YYYY-MM-DD):");
    const endDate = prompt("Nhập ngày kết thúc (YYYY-MM-DD):");

    if (!startDate || !endDate) {
      alert("Vui lòng nhập đầy đủ ngày bắt đầu và kết thúc!");
      return;
    }

    try {
      setSyncing(true);
      const response = await axios.post(
        `${config.backendBase}/youtube-analytics/sync/${channelId}`,
        null,
        {
          params: { startDate, endDate },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert(`Đồng bộ thành công!\n${response.data.message}`);
      }
    } catch (err) {
      console.error("Error syncing channel:", err);
      alert(err.response?.data?.message || "Không thể đồng bộ dữ liệu");
    } finally {
      setSyncing(false);
    }
  };

  // Add new channel
  const handleAddChannel = async (channelData) => {
    try {
      const response = await axios.post(
        `${config.backendBase}/channel/add-new`,
        {
          ...channelData,
          assignedUser: user.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Thêm kênh thành công!");
        setShowAddModal(false);
        fetchMyChannels(); // Refresh list
      }
    } catch (err) {
      console.error("Error adding channel:", err);
      alert(err.response?.data?.message || "Không thể thêm kênh");
    }
  };

  // Delete channel
  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm("Bạn có chắc muốn xóa kênh này?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${config.backendBase}/channel/delete/${channelId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Xóa kênh thành công!");
        fetchMyChannels(); // Refresh list
      }
    } catch (err) {
      console.error("Error deleting channel:", err);
      alert(err.response?.data?.message || "Không thể xóa kênh");
    }
  };

  const handleEditChannel = (channel) => {
    setSelectedChannel(channel);
    setShowEditModal(true);
  };

  const handleUpdateChannel = async (channelId, data) => {
    try {
      const response = await axios.put(
        `${config.backendBase}/channel/edit/${channelId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        alert("Cập nhật kênh thành công!");
        setShowEditModal(false);
        fetchMyChannels();
      }
    } catch (err) {
      console.error("Error updating channel:", err);
      alert(err.response?.data?.message || "Không thể cập nhật kênh");
    }
  };

  useEffect(() => {
    if (user && user.userId) {
      fetchMyChannels();
    }
  }, [user]);

  // Check for OAuth callback success/error
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");

    if (authStatus === "success") {
      alert("✅ Xác thực YouTube thành công!");
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchMyChannels();
    } else if (authStatus === "error") {
      alert("❌ Xác thực YouTube thất bại!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải danh sách kênh...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h1 className="mb-4">Quản lý Kênh YouTube của tôi</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {syncing && (
        <Alert variant="info">
          <Spinner animation="border" size="sm" className="me-2" />
          Đang đồng bộ dữ liệu...
        </Alert>
      )}

      <ChannelActionButtons onAddNew={() => setShowAddModal(true)} />

      <ChannelTable
        channels={channels}
        onEdit={handleEditChannel}
        onGrantAuth={handleGetAuthUrl}
        onCheckAuth={handleCheckAuthStatus}
        onRevokeAuth={handleRevokeAuth}
        onSync={handleSyncChannel}
        onDelete={handleDeleteChannel}
      />

      <AddChannelModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddChannel}
      />

      <EditChannelModal
        show={showEditModal}
        channel={selectedChannel}
        onHide={() => {
          setShowEditModal(false);
          setSelectedChannel(null);
        }}
        onSubmit={handleUpdateChannel}
      />
    </Container>
  );
}

export default EmployeeChannelManagement;
