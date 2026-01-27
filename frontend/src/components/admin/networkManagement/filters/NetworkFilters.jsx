import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
import { BoxArrowInDown, BoxArrowUp, PlusCircle } from "react-bootstrap-icons";

const NetworkFilters = ({ filters, onFilterChange, onExport, onAdd }) => {
  return (
    <div className="mb-4">
      <Row className="mb-3">
        <Col className="d-flex justify-content-end gap-2">
          <Button variant="success" onClick={onAdd}>
            <PlusCircle className="me-2" />
            Thêm Network
          </Button>
          <Button variant="info" onClick={onExport}>
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
            placeholder="Tìm kiếm theo PUB-ID, Profile ID, Email hoặc Employment..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
          />
        </Col>
        <Col md={3}>
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
        <Col md={3}>
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
      </Row>
    </div>
  );
};

export default NetworkFilters;
