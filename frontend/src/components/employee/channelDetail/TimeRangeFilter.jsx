import React from "react";
import { ButtonGroup, Button } from "react-bootstrap";

function TimeRangeFilter({ selectedDays, onSelectDays }) {
  const timeRanges = [
    { label: "7 ngày", value: 7 },
    { label: "28 ngày", value: 28 },
    { label: "90 ngày", value: 90 },
    { label: "365 ngày", value: 365 },
  ];

  return (
    <div className="d-flex justify-content-end mt-3">
      <ButtonGroup>
        {timeRanges.map((range) => (
          <Button
            key={range.value}
            variant={
              selectedDays === range.value ? "primary" : "outline-primary"
            }
            onClick={() => onSelectDays(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
}

export default TimeRangeFilter;
