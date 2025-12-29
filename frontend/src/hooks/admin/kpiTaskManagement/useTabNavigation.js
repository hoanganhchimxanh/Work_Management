import { useState } from "react";

/**
 * Custom hook để quản lý tab navigation
 * @param {string} defaultTab - Default active tab
 * @returns {Object} { activeTab, setActiveTab, isActive }
 */
function useTabNavigation(defaultTab = "kpi") {
  const [activeTab, setActiveTab] = useState(defaultTab);

  /**
   * Check if a tab is active
   */
  const isActive = (tabKey) => {
    return activeTab === tabKey;
  };

  /**
   * Switch to a specific tab
   */
  const switchTo = (tabKey) => {
    setActiveTab(tabKey);
  };

  return {
    // Current active tab
    activeTab,

    // Setters
    setActiveTab,
    switchTo,

    // Utilities
    isActive,
  };
}

export default useTabNavigation;
