import { useState } from "react";

/**
 * Custom hook để quản lý filter tháng và năm
 * @returns {Object} { selectedMonth, selectedYear, months, years, setMonth, setYear, monthLabel }
 */
function useMonthYearFilter() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return String(now.getMonth() + 1).padStart(2, "0");
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear());
  });

  const months = [
    { value: "01", label: "Tháng 1" },
    { value: "02", label: "Tháng 2" },
    { value: "03", label: "Tháng 3" },
    { value: "04", label: "Tháng 4" },
    { value: "05", label: "Tháng 5" },
    { value: "06", label: "Tháng 6" },
    { value: "07", label: "Tháng 7" },
    { value: "08", label: "Tháng 8" },
    { value: "09", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  const years = ["2024", "2025", "2026", "2027"];

  const monthLabel =
    months.find((m) => m.value === selectedMonth)?.label || "Tháng";

  return {
    selectedMonth,
    selectedYear,
    months,
    years,
    monthLabel,
    setMonth: setSelectedMonth,
    setYear: setSelectedYear,
  };
}

export default useMonthYearFilter;
