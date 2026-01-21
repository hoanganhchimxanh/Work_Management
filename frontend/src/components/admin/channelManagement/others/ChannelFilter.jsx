import React from "react";
import { Row, Col, Form, Button } from "react-bootstrap";

function ChannelFilter({
  users,
  searchName,
  setSearchName,
  filterUser,
  setFilterUser,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  onClear,
}) {
  return (
    <Row className="mb-3">
      <Col md={3}>
        <Form.Control
          type="text"
          placeholder="Tìm kiếm theo tên kênh..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </Col>

      <Col md={3}>
        <Form.Select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        >
          <option value="">Tất cả nhân sự</option>
          {users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.fullName}
            </option>
          ))}
        </Form.Select>
      </Col>

      <Col md={2}>
        <Form.Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="HIDDEN">HIDDEN</option>
          <option value="LOCKED">LOCKED</option>
          <option value="STRIKED">STRIKED</option>
        </Form.Select>
      </Col>

      <Col md={2}>
        <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sắp xếp theo...</option>
          <option value="revenue">Doanh thu cao nhất</option>
          <option value="subscribers">Lượt đăng ký cao nhất</option>
        </Form.Select>
      </Col>

      <Col md={2}>
        <Button variant="secondary" onClick={onClear}>
          Xóa bộ lọc
        </Button>
      </Col>
    </Row>
  );
}

export default ChannelFilter;
