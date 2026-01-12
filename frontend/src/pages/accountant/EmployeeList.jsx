import React from "react";
import {
  Container,
  Table,
  Form,
  Badge,
  Button,
  InputGroup,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Search, ArrowRightCircle } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

// Custom hooks
import useAuth from "../../hooks/useAuth";
import useEmployeeRevenue from "../../hooks/accountant/EmployeeList/useEmployeeRevenue";
import useMonthYearFilter from "../../hooks/accountant/EmployeeList/useMonthYearFilter";
import useSearchFilter from "../../hooks/accountant/EmployeeList/useSearchFilter";
import usePagination from "../../hooks/usePagination";

function EmployeeList() {
  const navigate = useNavigate();

  // Month/Year filter
  const {
    selectedMonth,
    selectedYear,
    months,
    years,
    monthLabel,
    setMonth,
    setYear,
  } = useMonthYearFilter();

  // Employee revenue data
  const { employees, loading, error, clearError } = useEmployeeRevenue(
    selectedMonth,
    selectedYear
  );

  // Search filter
  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(
    employees,
    (employee, term) =>
      employee.fullName.toLowerCase().includes(term.toLowerCase())
  );

  // Handlers
  const handleViewRevenue = (employee) => {
    navigate(`/accountant/channels-revenue/${employee.userId}`, {
      state: {
        employeeId: employee.userId,
        employeeName: employee.fullName,
        month: selectedMonth,
        year: selectedYear,
      },
    });
  };

  // Helper functions
  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { bg: "success", text: "Hoạt động" },
      PENDING: { bg: "warning", text: "Chờ duyệt" },
      QUIT: { bg: "secondary", text: "Đã nghỉ" },
    };

    const statusInfo = statusMap[status] || {
      bg: "secondary",
      text: status,
    };

    return <Badge bg={statusInfo.bg}>{statusInfo.text}</Badge>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalRevenue = filteredItems.reduce(
    (sum, emp) => sum + emp.totalRevenue,
    0
  );

  // Loading state
  if (loading) {
    return (
      <Container
        fluid
        className="py-4 d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h3 className="mb-4">Danh Sách Nhân Viên & Doanh Thu</h3>

      {error && (
        <Alert variant="danger" dismissible onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Row className="mb-4 align-items-end">
        <Col md={6} lg={5}>
          <Form.Group>
            <Form.Label>Chọn tháng và năm xem doanh thu</Form.Label>
            <Row>
              <Col xs={6}>
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={6}>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setYear(e.target.value)}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Form.Group>
        </Col>

        <Col md={6} lg={4}>
          <Form className="mb-3 mb-md-0">
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form>
        </Col>

        <Col md={12} lg={3} className="text-md-end">
          <h5 className="mb-0 text-primary">
            {monthLabel} / {selectedYear}
          </h5>
        </Col>
      </Row>

      {/* Table */}
      <Table
        striped
        bordered
        hover
        responsive
        className="text-center align-middle"
      >
        <thead>
          <tr>
            <th style={{ width: "60px" }}>STT</th>
            <th>Tên nhân viên</th>
            <th>Email cá nhân</th>
            <th>Email đăng nhập</th>
            <th>Team</th>
            <th>Số kênh</th>
            <th>Tổng doanh thu</th>
            <th>Trạng thái</th>
            <th style={{ width: "140px" }}>Xem chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length > 0 ? (
            filteredItems.map((employee, index) => (
              <tr key={employee.userId}>
                <td>{index + 1}</td>
                <td
                  className="text-start fw-medium"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleViewRevenue(employee)}
                >
                  <span className="text-primary text-decoration-underline">
                    {employee.fullName}
                  </span>
                </td>
                <td>{employee.personalEmail}</td>
                <td>{employee.loginEmail || "–"}</td>
                <td>{employee.team || "–"}</td>
                <td>
                  <Badge bg="info">{employee.channelCount}</Badge>
                </td>
                <td className="fw-bold text-success">
                  {formatCurrency(employee.totalRevenue)}
                </td>
                <td>{getStatusBadge(employee.status)}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewRevenue(employee)}
                  >
                    <ArrowRightCircle className="me-1" />
                    Xem kênh
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-muted py-4">
                Không tìm thấy nhân viên nào phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Summary */}
      {filteredItems.length > 0 && (
        <Row className="mt-4">
          <Col md={6}>
            <Alert variant="info">
              <strong>Tổng số nhân viên:</strong> {filteredItems.length}
            </Alert>
          </Col>
          <Col md={6} className="text-end">
            <Alert variant="success">
              <strong>Tổng doanh thu:</strong> {formatCurrency(totalRevenue)}
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default EmployeeList;
