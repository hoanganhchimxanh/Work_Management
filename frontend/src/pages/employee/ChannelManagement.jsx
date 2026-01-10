import React, { useState, useEffect, useContext } from "react";
import { Container, Alert, Spinner } from "react-bootstrap";
import { AuthContext } from "../../contexts/AuthContext";
import ChannelActionButtons from "../../components/employee/channelManagement/ChannelActionButtons";
import ChannelTable from "../../components/employee/channelManagement/ChannelTable";
import AddChannelModal from "../../components/employee/channelManagement/AddChannelModal";
import EditChannelModal from "../../components/employee/channelManagement/EditChannelModal";
import useChannels from "../../hooks/employee/channelManagement/useChannels";
import useYouTubeAuth from "../../hooks/employee/channelManagement/useYoutubeAuth";
import usePagination from "../../hooks/usePagination";

function EmployeeChannelManagement() {
  const { user } = useContext(AuthContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Custom hooks
  const { channels, loading, error, syncing, operations, setError } =
    useChannels(user?.userId);

  const { authOperations } = useYouTubeAuth();

  // Pagination
  const {
    paginatedItems: paginatedChannels,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage,
  } = usePagination(channels, 10);

  /**
   * Handle OAuth callback
   */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");

    if (authStatus === "success") {
      alert("✅ Xác thực YouTube thành công!");
      window.history.replaceState({}, document.title, window.location.pathname);
      operations.refresh();
    } else if (authStatus === "error") {
      alert("❌ Xác thực YouTube thất bại!");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [operations]);

  /**
   * Handle add channel
   */
  const handleAddChannel = async (channelData) => {
    const result = await operations.add(channelData);

    if (result.success) {
      alert(result.message);
      setShowAddModal(false);
    } else {
      alert(result.message);
    }
  };

  /**
   * Handle edit channel
   */
  const handleEditChannel = (channel) => {
    setSelectedChannel(channel);
    setShowEditModal(true);
  };

  /**
   * Handle update channel
   */
  const handleUpdateChannel = async (channelId, data) => {
    const result = await operations.update(channelId, data);

    if (result.success) {
      alert(result.message);
      setShowEditModal(false);
      setSelectedChannel(null);
    } else {
      alert(result.message);
    }
  };

  /**
   * Handle delete channel
   */
  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm("Bạn có chắc muốn xóa kênh này?")) {
      return;
    }

    const result = await operations.delete(channelId);
    alert(result.message);
  };

  /**
   * Handle grant auth
   */
  const handleGrantAuth = async (channelId) => {
    const result = await authOperations.getAuthUrl(channelId);

    if (!result.success) {
      alert(result.message);
    }
  };

  /**
   * Handle check auth status
   */
  const handleCheckAuthStatus = async (channelId) => {
    const result = await authOperations.checkAuthStatus(channelId);
    alert(result.message);
  };

  /**
   * Handle revoke auth
   */
  const handleRevokeAuth = async (channelId) => {
    if (!window.confirm("Bạn có chắc muốn thu hồi quyền truy cập?")) {
      return;
    }

    const result = await authOperations.revokeAuth(channelId);
    alert(result.message);

    if (result.success) {
      operations.refresh();
    }
  };

  /**
   * Handle sync channel
   */
  const handleSyncChannel = async (channelId) => {
    const startInput = prompt("Nhập ngày bắt đầu (dd-MM-yyyy):");
    const endInput = prompt("Nhập ngày kết thúc (dd-MM-yyyy):");

    const result = await operations.sync(channelId, startInput, endInput);
    alert(result.message);
  };

  /**
   * Render loading state
   */
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

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Syncing Alert */}
      {syncing && (
        <Alert variant="info">
          <Spinner animation="border" size="sm" className="me-2" />
          Đang đồng bộ dữ liệu...
        </Alert>
      )}

      {/* Action Buttons */}
      <ChannelActionButtons onAddNew={() => setShowAddModal(true)} />

      {/* Channel Table */}
      <ChannelTable
        channels={paginatedChannels}
        pagination={pagination}
        onPageChange={goToPage}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        onItemsPerPageChange={setItemsPerPage}
        onEdit={handleEditChannel}
        onGrantAuth={handleGrantAuth}
        onCheckAuth={handleCheckAuthStatus}
        onRevokeAuth={handleRevokeAuth}
        onSync={handleSyncChannel}
        onDelete={handleDeleteChannel}
      />

      {/* Add Modal */}
      <AddChannelModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSubmit={handleAddChannel}
      />

      {/* Edit Modal */}
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
