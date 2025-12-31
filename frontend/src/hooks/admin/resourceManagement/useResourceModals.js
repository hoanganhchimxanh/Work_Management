import { useState } from "react";

/**
 * Custom hook để quản lý modal states
 * @returns {Object} { modals, selectedResource, handlers }
 */
function useResourceModals() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkAssignUserModal, setShowBulkAssignUserModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  /**
   * Open create modal
   */
  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  /**
   * Close create modal
   */
  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  /**
   * Open edit modal
   */
  const openEditModal = (resource) => {
    setSelectedResource(resource);
    setShowEditModal(true);
  };

  /**
   * Close edit modal
   */
  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedResource(null);
  };

  /**
   * Open assign modal
   */
  const openAssignModal = (resource) => {
    setSelectedResource(resource);
    setShowAssignModal(true);
  };

  /**
   * Close assign modal
   */
  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedResource(null);
  };

  /**
   * Open import modal
   */
  const openImportModal = () => {
    setShowImportModal(true);
  };

  /**
   * Close import modal
   */
  const closeImportModal = () => {
    setShowImportModal(false);
  };

  /**
   * Open bulk assign user modal
   */
  const openBulkAssignUserModal = () => {
    setShowBulkAssignUserModal(true);
  };

  /**
   * Close bulk assign user modal
   */
  const closeBulkAssignUserModal = () => {
    setShowBulkAssignUserModal(false);
  };

  return {
    // Modal states
    modals: {
      showCreateModal,
      showEditModal,
      showAssignModal,
      showImportModal,
      showBulkAssignUserModal,
    },

    // Selected resource
    selectedResource,

    // Handlers
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openAssignModal,
    closeAssignModal,
    openImportModal,
    closeImportModal,
    openBulkAssignUserModal,
    closeBulkAssignUserModal,
  };
}

export default useResourceModals;
