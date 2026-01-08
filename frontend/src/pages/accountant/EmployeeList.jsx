import React, { useState, useEffect } from "react";
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
import axios from "axios";

function EmployeeList() {
  const navigate = useNavigate();

  // State cho bộ lọc tháng/năm
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return String(now.getMonth() + 1).padStart(2, "0");
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    return String(new Date().getFullYear());
  });

  // State cho ô tìm kiếm tên
  const [searchTerm, setSearchTerm] = useState("");

  // State cho data từ API
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch danh sách nhân viên và doanh thu
  useEffect(() => {
    fetchEmployeesRevenue();
  }, [selectedMonth, selectedYear]);

  const fetchEmployeesRevenue = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const monthQuery = `${selectedYear}-${selectedMonth}`;

      // ✅ FIX 1: Lấy tất cả users và filter chỉ lấy EMPLOYEE
      const usersResponse = await axios.get(
        `http://localhost:9999/user/get-all`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: "ACTIVE" },
        }
      );

      // Filter chỉ lấy EMPLOYEE (không lấy ADMIN và ACCOUNTANT)
      const employees = usersResponse.data.data.filter(
        (user) => user.role === "EMPLOYEE"
      );

      // Gọi API lấy tổng quan doanh thu tất cả kênh
      const revenueResponse = await axios.get(
        `http://localhost:9999/channel-revenue/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { month: monthQuery },
        }
      );

      const revenueData = revenueResponse.data.data.channels;

      // ✅ FIX 2: Tạo map để tra cứu nhanh doanh thu theo userId
      const revenueByUserId = {};

      revenueData.forEach((channel) => {
        // Backend trả về channelData với assignedUser
        const assignedUserId = channel.assignedUser?.userId;

        if (assignedUserId) {
          if (!revenueByUserId[assignedUserId]) {
            revenueByUserId[assignedUserId] = {
              totalRevenue: 0,
              channelCount: 0,
            };
          }

          revenueByUserId[assignedUserId].totalRevenue +=
            channel.totalActual || 0;
          revenueByUserId[assignedUserId].channelCount += 1;
        }
      });

      // Map doanh thu theo user
      const employeesWithRevenue = employees.map((user) => {
        const userRevenue = revenueByUserId[user._id] || {
          totalRevenue: 0,
          channelCount: 0,
        };

        return {
          ...user,
          totalRevenue: userRevenue.totalRevenue,
          channelCount: userRevenue.channelCount,
        };
      });

      setEmployees(employeesWithRevenue);
    } catch (err) {
      console.error("Error fetching employees revenue:", err);
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách nhân viên. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo tên
  const filteredEmployees = employees.filter((emp) =>
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm lấy nhãn tháng
  const monthLabel =
    months.find((m) => m.value === selectedMonth)?.label || "Tháng";

  // Hàm chuyển hướng đến trang doanh thu kênh của nhân viên
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
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee, index) => (
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
                <td>{employee.loginEmail || "—"}</td>
                <td>{employee.team || "—"}</td>
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

      {/* Tổng kết */}
      {filteredEmployees.length > 0 && (
        <Row className="mt-4">
          <Col md={6}>
            <Alert variant="info">
              <strong>Tổng số nhân viên:</strong> {filteredEmployees.length}
            </Alert>
          </Col>
          <Col md={6} className="text-end">
            <Alert variant="success">
              <strong>Tổng doanh thu:</strong>{" "}
              {formatCurrency(
                filteredEmployees.reduce(
                  (sum, emp) => sum + emp.totalRevenue,
                  0
                )
              )}
            </Alert>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default EmployeeList;
