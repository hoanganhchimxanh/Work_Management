import React, { useState } from "react";
import {
  Container,
  Table,
  Form,
  Badge,
  Button,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";
import { Search, Pencil, Trash, ArrowRightCircle } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

function EmployeeList() {
  const navigate = useNavigate();

  // State cho bộ lọc tháng/năm
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedYear, setSelectedYear] = useState("2026");

  // State cho ô tìm kiếm tên
  const [searchTerm, setSearchTerm] = useState("");

  // Danh sách tháng
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

  // Dữ liệu mẫu nhân viên (trong thực tế sẽ fetch theo tháng/năm)
  const employees = [
    {
      id: 1,
      name: "Nguyễn Văn An",
      personalEmail: "an.nguyen@gmail.com",
      loginEmail: "an.nguyen@company.com",
      status: "active",
      totalRevenue: "312,500,000 VND",
    },
    {
      id: 2,
      name: "Trần Thị Bình",
      personalEmail: "binh.tran@yahoo.com",
      loginEmail: "binh.tran@company.com",
      status: "active",
      totalRevenue: "289,700,000 VND",
    },
    {
      id: 3,
      name: "Lê Văn Cường",
      personalEmail: "cuong.le@outlook.com",
      loginEmail: "cuong.le@company.com",
      status: "inactive",
      totalRevenue: "156,200,000 VND",
    },
    {
      id: 4,
      name: "Phạm Minh Duy",
      personalEmail: "duy.pham@gmail.com",
      loginEmail: "duy.pham@company.com",
      status: "active",
      totalRevenue: "423,800,000 VND",
    },
  ];

  // Lọc theo tên
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm lấy nhãn tháng
  const monthLabel =
    months.find((m) => m.value === selectedMonth)?.label || "Tháng";

  // Hàm chuyển hướng đến trang doanh thu kênh của nhân viên
  const handleViewRevenue = (employeeId, employeeName) => {
    // Có thể truyền thêm params nếu cần: employeeId, name, month, year...
    navigate("/accountant/channels-revenue", {
      state: {
        employeeId,
        employeeName,
        month: selectedMonth,
        year: selectedYear,
      },
    });
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge bg="success">Hoạt động</Badge>
    ) : (
      <Badge bg="secondary">Khóa</Badge>
    );
  };

  return (
    <Container fluid className="py-4">
      <h3 className="mb-4">Danh Sách Nhân Viên & Doanh Thu</h3>

      {/* Bộ lọc Tháng - Năm và Tìm kiếm */}
      <Row className="mb-4 align-items-end">
        <Col md={6} lg={5}>
          <Form.Group>
            <Form.Label>Chọn tháng và năm xem doanh thu</Form.Label>
            <Row>
              <Col xs={6}>
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
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
                  onChange={(e) => setSelectedYear(e.target.value)}
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

      {/* Bảng danh sách */}
      <Table
        striped
        bordered
        hover
        responsive
        className="text-center align-middle"
      >
        <thead>
          <tr>
            <th style={{ width: "80px" }}>STT</th>
            <th>Tên nhân viên</th>
            <th>Email cá nhân</th>
            <th>Email đăng nhập</th>
            <th>Tổng doanh thu</th>
            <th>Trạng thái</th>
            <th style={{ width: "160px" }}>Hành động</th>
            <th style={{ width: "140px" }}>Xem doanh thu</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee, index) => (
              <tr key={employee.id}>
                <td>{index + 1}</td>
                <td className="text-start fw-medium">{employee.name}</td>
                <td>{employee.personalEmail}</td>
                <td>{employee.loginEmail}</td>
                <td className="fw-bold text-success">
                  {employee.totalRevenue}
                </td>
                <td>{getStatusBadge(employee.status)}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">
                    <Pencil className="me-1" /> Sửa
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    <Trash className="me-1" /> Xóa
                  </Button>
                </td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      handleViewRevenue(employee.id, employee.name)
                    }
                  >
                    <ArrowRightCircle className="me-1" />
                    Xem chi tiết
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
    </Container>
  );
}

export default EmployeeList;
