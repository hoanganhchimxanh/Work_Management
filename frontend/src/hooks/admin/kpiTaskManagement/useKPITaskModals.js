import { useState } from "react";

/**
 * Custom hook để quản lý modal states cho KPI & Task Management
 * @returns {Object} { modals, selected, handlers }
 */
function useKPITaskModals() {
  // KPI modal
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);

  // Task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  /**
   * KPI Modal Handlers
   */
  const openKPIModal = (kpi = null) => {
    setSelectedKPI(kpi);
    setShowKPIModal(true);
  };

  const closeKPIModal = () => {
    setShowKPIModal(false);
    setSelectedKPI(null);
  };

  /**
   * Task Modal Handlers
   */
  const openTaskModal = (task = null) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  return {
    // Modal states
    modals: {
      showKPIModal,
      showTaskModal,
    },

    // Selected items
    selected: {
      kpi: selectedKPI,
      task: selectedTask,
    },

    // KPI handlers
    openKPIModal,
    closeKPIModal,

    // Task handlers
    openTaskModal,
    closeTaskModal,
  };
}

export default useKPITaskModals;
