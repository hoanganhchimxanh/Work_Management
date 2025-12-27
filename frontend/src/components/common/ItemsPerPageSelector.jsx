import React from "react";
import { Form } from "react-bootstrap";

/**
 * Component cho phép user chọn số items hiển thị mỗi page
 */
function ItemsPerPageSelector({
  value,
  onChange,
  options = [10, 25, 50, 100],
}) {
  return (
    <div className="d-flex align-items-center gap-2">
      <small className="text-muted">Hiển thị</small>
      <Form.Select
        size="sm"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "80px" }}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Form.Select>
      <small className="text-muted">mục</small>
    </div>
  );
}

export default ItemsPerPageSelector;
