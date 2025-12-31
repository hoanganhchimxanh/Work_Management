import { useState } from "react";

/**
 * Custom hook để quản lý bulk assign mode
 * @param {Array} resources - Danh sách resources
 * @returns {Object} { bulkAssignMode, selectedResources, handlers }
 */
function useBulkAssign(resources) {
  const [bulkAssignMode, setBulkAssignMode] = useState(false);
  const [selectedResources, setSelectedResources] = useState([]);

  /**
   * Toggle bulk assign mode
   */
  const toggleBulkAssignMode = () => {
    setBulkAssignMode(!bulkAssignMode);
    setSelectedResources([]);
  };

  /**
   * Cancel bulk assign mode
   */
  const cancelBulkAssignMode = () => {
    setBulkAssignMode(false);
    setSelectedResources([]);
  };

  /**
   * Select/Deselect resource
   */
  const handleSelectResource = (resourceId, checked) => {
    if (checked) {
      setSelectedResources([...selectedResources, resourceId]);
    } else {
      setSelectedResources(selectedResources.filter((id) => id !== resourceId));
    }
  };

  /**
   * Select/Deselect all available resources
   */
  const handleSelectAll = (checked) => {
    if (checked) {
      const availableIds = resources
        .filter((r) => r.status === "AVAILABLE")
        .map((r) => r._id);
      setSelectedResources(availableIds);
    } else {
      setSelectedResources([]);
    }
  };

  /**
   * Reset selection
   */
  const resetSelection = () => {
    setSelectedResources([]);
  };

  return {
    // State
    bulkAssignMode,
    selectedResources,
    selectedCount: selectedResources.length,

    // Handlers
    toggleBulkAssignMode,
    cancelBulkAssignMode,
    handleSelectResource,
    handleSelectAll,
    resetSelection,
  };
}

export default useBulkAssign;
