import { useState } from "react";

/**
 * Custom hook để quản lý các modals của Network
 * @returns {Object} { modals, selectedNetwork, handlers }
 */
function useNetworkModals() {
  const [modals, setModals] = useState({
    showAddModal: false,
    showImportModal: false,
    showEditModal: false,
  });

  const [selectedNetwork, setSelectedNetwork] = useState(null);

  // ========== ADD MODAL ==========
  const openAddModal = () => {
    setModals((prev) => ({ ...prev, showAddModal: true }));
  };

  const closeAddModal = () => {
    setModals((prev) => ({ ...prev, showAddModal: false }));
  };

  // ========== IMPORT MODAL ==========
  const openImportModal = () => {
    setModals((prev) => ({ ...prev, showImportModal: true }));
  };

  const closeImportModal = () => {
    setModals((prev) => ({ ...prev, showImportModal: false }));
  };

  // ========== EDIT MODAL ==========
  const openEditModal = (network) => {
    setSelectedNetwork(network);
    setModals((prev) => ({ ...prev, showEditModal: true }));
  };

  const closeEditModal = () => {
    setSelectedNetwork(null);
    setModals((prev) => ({ ...prev, showEditModal: false }));
  };

  return {
    // Modal states
    modals,
    selectedNetwork,

    // Add handlers
    openAddModal,
    closeAddModal,

    // Import handlers
    openImportModal,
    closeImportModal,

    // Edit handlers
    openEditModal,
    closeEditModal,
  };
}

export default useNetworkModals;
