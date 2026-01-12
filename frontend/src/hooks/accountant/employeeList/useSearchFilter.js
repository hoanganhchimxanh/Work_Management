import { useState, useMemo } from "react";

/**
 * Custom hook để quản lý search/filter cho danh sách
 * @param {Array} items - Danh sách items cần filter
 * @param {Function} filterFn - Function để filter items (item, searchTerm) => boolean
 * @returns {Object} { searchTerm, setSearchTerm, filteredItems }
 */
function useSearchFilter(items, filterFn) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    if (filterFn) {
      return items.filter((item) => filterFn(item, searchTerm));
    }

    // Default filter: tìm theo fullName
    return items.filter((item) =>
      item.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm, filterFn]);

  return {
    searchTerm,
    setSearchTerm,
    filteredItems,
  };
}

export default useSearchFilter;
