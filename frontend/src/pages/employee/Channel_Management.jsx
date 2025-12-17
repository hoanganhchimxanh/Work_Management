import React, { useState, useEffect, useContext } from "react";
import { Container, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";
import ChannelActionButtons from "../../components/employee/channelManagement/ChannelActionButtons";
import ChannelTable from "../../components/employee/channelManagement/ChannelTable";
import AddChannelModal from "../../components/employee/channelManagement/AddChannelModal";

const API_BASE_URL = "http://localhost:9999";

function EmployeeChannelManagement() {
  const { user } = useContext(AuthContext);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Fetch channels assigned to current user
  const fetchMyChannels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/channel/by-owner/${user.userId}`,
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
        `${API_BASE_URL}/youtube-auth/get-auth-url`,
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
        `${API_BASE_URL}/youtube-auth/check-status/${channelId}`,
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
        `${API_BASE_URL}/youtube-auth/revoke/${channelId}`,
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
        `${API_BASE_URL}/youtube-analytics/sync/${channelId}`,
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
        `${API_BASE_URL}/channel/add-new`,
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
        `${API_BASE_URL}/channel/delete/${channelId}`,
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
    </Container>
  );
}

export default EmployeeChannelManagement;
