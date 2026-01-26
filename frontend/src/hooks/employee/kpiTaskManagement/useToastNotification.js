import { useState } from "react";

/**
 * Custom hook để quản lý toast notifications
 * @returns {Object} {
 *   showToast,
 *   toastMessage,
 *   toastVariant,
 *   showNotification,
 *   hideToast
 * }
 */
function useToastNotification() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  /**
   * Hiển thị toast notification
   * @param {string} message - Nội dung thông báo
   * @param {string} variant - Loại thông báo (success, danger, warning, info)
   */
  const showNotification = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  /**
   * Ẩn toast notification
   */
  const hideToast = () => {
    setShowToast(false);
  };

  return {
    showToast,
    toastMessage,
    toastVariant,
    showNotification,
    hideToast,
  };
}

export default useToastNotification;
