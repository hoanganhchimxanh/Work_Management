import { useState } from "react";

/**
 * Custom hook để quản lý modal states cho Network Management
 * @returns {Object} { modals, selectedNetwork, handlers }
 */
function useNetworkModals() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  /**
   * Import Modal Handlers
   */
  const openImportModal = () => {
    setShowImportModal(true);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
  };

  /**
   * Edit Modal Handlers
   */
  const openEditModal = (network) => {
    setSelectedNetwork(network);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedNetwork(null);
  };

  return {
    // Modal states
    modals: {
      showImportModal,
      showEditModal,
    },

    // Selected network
    selectedNetwork,

    // Import handlers
    openImportModal,
    closeImportModal,

    // Edit handlers
    openEditModal,
    closeEditModal,
  };
}

export default useNetworkModals;
