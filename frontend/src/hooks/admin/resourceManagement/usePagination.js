import { useState, useMemo, useEffect } from "react";

/**
 * Custom hook để quản lý pagination
 * @param {Array} items - Danh sách items cần phân trang
 * @param {number} defaultItemsPerPage - Số items mặc định mỗi trang
 * @returns {Object} { paginatedItems, pagination, setters }
 */
function usePagination(items, defaultItemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);

  /**
   * Reset về trang 1 khi items thay đổi
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length, itemsPerPage]);

  /**
   * Tính toán pagination data
   */
  const pagination = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [items.length, currentPage, itemsPerPage]);

  /**
   * Get items cho trang hiện tại
   */
  const paginatedItems = useMemo(() => {
    return items.slice(pagination.startIndex, pagination.endIndex);
  }, [items, pagination.startIndex, pagination.endIndex]);

  /**
   * Go to page
   */
  const goToPage = (page) => {
    const validPage = Math.max(1, Math.min(page, pagination.totalPages));
    setCurrentPage(validPage);
  };

  /**
   * Next page
   */
  const nextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * Previous page
   */
  const prevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * Change items per page
   */
  const changeItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  return {
    // Paginated data
    paginatedItems,

    // Pagination info
    pagination,

    // Setters
    setCurrentPage,
    setItemsPerPage: changeItemsPerPage,

    // Handlers
    goToPage,
    nextPage,
    prevPage,
  };
}

export default usePagination;
