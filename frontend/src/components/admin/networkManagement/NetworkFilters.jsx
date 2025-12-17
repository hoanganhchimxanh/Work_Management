// src/pages/NetworkManagement/components/NetworkFilters.jsx
import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FileEarmarkSpreadsheet } from "react-bootstrap-icons";

const NetworkFilters = ({ filters, onFilterChange, onExport }) => {
  return (
    <Row className="mb-4 g-3">
      <Col md={4}>
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
      <Col md={2}>
        <Button variant="success" className="w-100" onClick={onExport}>
          <FileEarmarkSpreadsheet className="me-2" />
          Xuất Excel
        </Button>
      </Col>
    </Row>
  );
};

export default NetworkFilters;
