import React, { useState, useEffect, useContext } from "react";
import { Container, Alert, Spinner } from "react-bootstrap";
import { AuthContext } from "../../contexts/AuthContext";
import ChannelActionButtons from "../../components/employee/channelManagement/others/ChannelActionButtons";
import ChannelTable from "../../components/employee/channelManagement/tables/ChannelTable";
import AddChannelModal from "../../components/employee/channelManagement/modals/AddChannelModal";
import EditChannelModal from "../../components/employee/channelManagement/modals/EditChannelModal";
import SyncChannelModal from "../../components/employee/channelManagement/modals/SyncChannelModal";

import useChannels from "../../hooks/employee/channelManagement/useChannels";
import useYouTubeAuth from "../../hooks/employee/channelManagement/useYoutubeAuth";
import usePagination from "../../hooks/usePagination";

function EmployeeChannelManagement() {
  const { user } = useContext(AuthContext);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [channelToSync, setChannelToSync] = useState(null); // Lưu ID kênh đang chọn để sync

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

  // ... (Giữ nguyên useEffect xử lý OAuth callback) ...
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

  // ... (Giữ nguyên handleAddChannel, handleEditChannel, handleUpdateChannel, handleDeleteChannel) ...
  const handleAddChannel = async (channelData) => {
    const result = await operations.add(channelData);
    if (result.success) {
      alert(result.message);
      setShowAddModal(false);
    } else {
      alert(result.message);
    }
  };

  const handleEditChannel = (channel) => {
    setSelectedChannel(channel);
    setShowEditModal(true);
  };

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

  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm("Bạn có chắc muốn xóa kênh này?")) {
      return;
    }
    const result = await operations.delete(channelId);
    alert(result.message);
  };

  const handleGrantAuth = async (channelId) => {
    const result = await authOperations.getAuthUrl(channelId);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleCheckAuthStatus = async (channelId) => {
    const result = await authOperations.checkAuthStatus(channelId);
    alert(result.message);
  };

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

  const handleOpenSyncModal = (channelId) => {
    setChannelToSync(channelId); // Lưu lại ID kênh cần sync
    setShowSyncModal(true); // Mở modal
  };

  const handleConfirmSync = async (startDate, endDate) => {
    setShowSyncModal(false);

    if (channelToSync) {
      const result = await operations.sync(channelToSync, startDate, endDate);
      alert(result.message);
      setChannelToSync(null); // Reset ID
    }
  };

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
        onSync={handleOpenSyncModal}
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

      <SyncChannelModal
        show={showSyncModal}
        onHide={() => {
          setShowSyncModal(false);
          setChannelToSync(null);
        }}
        onSubmit={handleConfirmSync}
      />
    </Container>
  );
}

export default EmployeeChannelManagement;
