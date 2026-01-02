import { useState } from "react";
import { Container, Pagination, Table, Row, Col, Form } from "react-bootstrap";

function ChannelRevenue() {
  // State để lưu tháng và năm được chọn
  const [selectedMonth, setSelectedMonth] = useState("01"); // Mặc định tháng 1
  const [selectedYear, setSelectedYear] = useState("2026"); // Mặc định năm hiện tại

  // Danh sách tháng và năm (có thể mở rộng thêm năm nếu cần)
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

  const years = ["2024", "2025", "2026", "2027"]; // Có thể generate động nếu cần

  // Dữ liệu mẫu - trong thực tế bạn sẽ fetch theo selectedMonth + selectedYear
  const channels = [
    { id: 1, name: "Kênh YouTube Chính", revenue: "125,400,000 VND" },
    { id: 2, name: "Kênh TikTok", revenue: "89,200,000 VND" },
    { id: 3, name: "Kênh Facebook", revenue: "67,800,000 VND" },
    { id: 4, name: "Kênh Affiliate Shopee", revenue: "45,500,000 VND" },
    { id: 5, name: "Kênh Instagram", revenue: "32,100,000 VND" },
  ];

  // Hàm format tiêu đề
  const monthLabel =
    months.find((m) => m.value === selectedMonth)?.label || "Tháng";

  return (
    <Container fluid className="py-4">
      {/* Bộ lọc Tháng - Năm */}
      <Row className="mb-4 align-items-end">
        <Col md={6} lg={4}>
          <Form.Group>
            <Form.Label>Chọn tháng và năm</Form.Label>
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
        <Col md={6} lg={8} className="text-md-end">
          <h4 className="mb-0">
            Doanh Thu Theo Kênh - {monthLabel} / {selectedYear}
          </h4>
        </Col>
      </Row>

      {/* Bảng Doanh Thu */}
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
            <th>Tên Kênh</th>
            <th style={{ width: "200px" }}>Doanh Thu Tháng</th>
          </tr>
        </thead>
        <tbody>
          {channels.length > 0 ? (
            channels.map((channel, index) => (
              <tr key={channel.id}>
                <td>{index + 1}</td>
                <td className="text-start">{channel.name}</td>
                <td className="fw-bold text-primary">{channel.revenue}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-muted">
                Không có dữ liệu cho tháng này
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Phân trang */}
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First disabled />
          <Pagination.Prev disabled />
          <Pagination.Item active>{1}</Pagination.Item>
          <Pagination.Item>{2}</Pagination.Item>
          <Pagination.Item>{3}</Pagination.Item>
          <Pagination.Ellipsis />
          <Pagination.Item>{8}</Pagination.Item>
          <Pagination.Item>{9}</Pagination.Item>
          <Pagination.Item>{10}</Pagination.Item>
          <Pagination.Next />
          <Pagination.Last />
        </Pagination>
      </div>
    </Container>
  );
}

export default ChannelRevenue;
