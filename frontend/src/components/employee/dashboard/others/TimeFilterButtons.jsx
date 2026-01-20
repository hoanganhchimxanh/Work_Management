import React from "react";
import { ButtonGroup, Button } from "react-bootstrap";

function TimeFilterButtons({ currentFilter, onFilterChange }) {
  const filters = [
    { value: "7days", label: "7 ngày" },
    { value: "28days", label: "28 ngày" },
    { value: "90days", label: "90 ngày" },
    { value: "365days", label: "365 ngày" },
    { value: "lifetime", label: "Toàn thời gian" },
  ];

  return (
    <ButtonGroup size="sm">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={
            currentFilter === filter.value ? "primary" : "outline-primary"
          }
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}

export default TimeFilterButtons;
