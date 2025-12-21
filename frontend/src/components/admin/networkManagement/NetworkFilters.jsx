import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { BoxArrowInDown, BoxArrowUp } from "react-bootstrap-icons";

const NetworkFilters = ({ filters, onFilterChange, onExport, onImport }) => {
  return (
    <div className="mb-4">
      <Row className="mb-3">
        <Col className="d-flex justify-content-end gap-2">
          <Button variant="primary" onClick={onImport}>
            <BoxArrowInDown className="me-2" />
            Import Excel
          </Button>
          <Button variant="success" onClick={onExport}>
            <BoxArrowUp className="me-2" />
            Export Excel
          </Button>
        </Col>
      </Row>

      {/* Hàng dành cho bộ lọc (Filters) */}
      <Row className="g-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Tìm kiếm theo Profile ID hoặc Email..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Active</option>
            <option value="PROCESSING">Processing</option>
            <option value="INACTIVE">Inactive</option>
            <option value="LOCKED">Locked</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filters.location}
            onChange={(e) => onFilterChange("location", e.target.value)}
          >
            <option value="">Tất cả vị trí</option>
            <option value="HOME">Home</option>
            <option value="OFFICE">Office</option>
            <option value="OTHER">Other</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filters.country}
            onChange={(e) => onFilterChange("country", e.target.value)}
          >
            <option value="">Tất cả quốc gia</option>
            <option value="VN">Vietnam</option>
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
          </Form.Select>
        </Col>
      </Row>
    </div>
  );
};

export default NetworkFilters;
