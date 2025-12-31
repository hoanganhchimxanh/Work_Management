import { useCallback } from "react";

/**
 * Custom hook để format currency
 * @returns {Object} { formatCurrency, formatShortCurrency }
 */
function useCurrency() {
  /**
   * Format đầy đủ với ký hiệu tiền tệ
   * @param {number} value - Giá trị cần format
   * @param {string} currency - Loại tiền tệ (default: USD)
   * @param {number} decimals - Số chữ số thập phân (default: 2)
   */
  const formatCurrency = useCallback(
    (value, currency = "USD", decimals = 2) => {
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
      return `$${formatted}`;
    },
    []
  );

  /**
   * Format ngắn gọn (K, M, B)
   * @param {number} value - Giá trị cần format
   */
  const formatShortCurrency = useCallback((value) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }, []);

  /**
   * Format không có ký hiệu tiền tệ
   */
  const formatNumber = useCallback((value, decimals = 0) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }, []);

  return {
    formatCurrency,
    formatShortCurrency,
    formatNumber,
  };
}

export default useCurrency;
