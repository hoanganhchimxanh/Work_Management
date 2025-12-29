import { useState } from "react";

/**
 * Custom hook để quản lý modal states cho User Management
 * @returns {Object} { modals, selected, handlers }
 */
function useUserManagementModals() {
  // User modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserImportModal, setShowUserImportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Team modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTeamImportModal, setShowTeamImportModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  /**
   * User Modal Handlers
   */
  const openUserModal = (user = null) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const openUserImportModal = () => {
    setShowUserImportModal(true);
  };

  const closeUserImportModal = () => {
    setShowUserImportModal(false);
  };

  /**
   * Team Modal Handlers
   */
  const openTeamModal = (team = null) => {
    setSelectedTeam(team);
    setShowTeamModal(true);
  };

  const closeTeamModal = () => {
    setShowTeamModal(false);
    setSelectedTeam(null);
  };

  const openTeamImportModal = () => {
    setShowTeamImportModal(true);
  };

  const closeTeamImportModal = () => {
    setShowTeamImportModal(false);
  };

  return {
    // Modal states
    modals: {
      showUserModal,
      showUserImportModal,
      showTeamModal,
      showTeamImportModal,
    },

    // Selected items
    selected: {
      user: selectedUser,
      team: selectedTeam,
    },

    // User handlers
    openUserModal,
    closeUserModal,
    openUserImportModal,
    closeUserImportModal,

    // Team handlers
    openTeamModal,
    closeTeamModal,
    openTeamImportModal,
    closeTeamImportModal,
  };
}

export default useUserManagementModals;
