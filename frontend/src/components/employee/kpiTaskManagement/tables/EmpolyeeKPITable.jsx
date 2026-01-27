import React from "react";
import {
  Table,
  Badge,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  ProgressBar,
} from "react-bootstrap";

import useKPIFilters from "../../../../hooks/employee/kpiTaskManagement/useKPIFilters";

function EmployeeKPITable({ kpis, loading, onRefresh }) {
  // Use filters hook
  const {
    filterStatus,
    setFilterStatus,
    filterSort,
    setFilterSort,
    filteredKPIs,
  } = useKPIFilters(kpis);

  const getStatusBadge = (status) => {
    const variants = {
      ongoing: "success",
      completed: "secondary",
      upcoming: "warning",
    };
    const labels = {
      ongoing: "Đang diễn ra",
      completed: "Đã hoàn thành",
      upcoming: "Sắp diễn ra",
    };
    return <Badge bg={variants[status] || "secondary"}>{labels[status]}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getProgressVariant = (progress) => {
    if (progress >= 100) return "success";
    if (progress >= 75) return "info";
    if (progress >= 50) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Lọc theo trạng thái</Form.Label>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả</option>
              <option value="ongoing">Đang diễn ra</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="upcoming">Sắp diễn ra</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Sắp xếp</Form.Label>
            <Form.Select
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value)}
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="OLDEST">Cũ nhất</option>
              <option value="REVENUE_DESC">Doanh thu cao nhất</option>
              <option value="REVENUE_ASC">Doanh thu thấp nhất</option>
              <option value="PROGRESS_DESC">Tiến độ cao nhất</option>
              <option value="PROGRESS_ASC">Tiến độ thấp nhất</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="mb-3">
        <small className="text-muted">
          Hiển thị {filteredKPIs.length} / {kpis.length} KPI
          {filterStatus !== "ALL" && ` (Trạng thái: ${filterStatus})`}
        </small>
      </div>

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Đối tượng</th>
              <th>KPI Doanh thu</th>
              <th>KPI Kênh BKT</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredKPIs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  {filterStatus !== "ALL"
                    ? "Không tìm thấy KPI phù hợp"
                    : "Chưa có KPI nào"}
                </td>
              </tr>
            ) : (
              filteredKPIs.map((kpi) => (
                <tr key={kpi._id}>
                  <td>
                    {kpi.user ? (
                      <div>
                        <strong>{kpi.user.fullName}</strong>
                        <div className="small text-muted">{kpi.user.role}</div>
                      </div>
                    ) : kpi.team ? (
                      <Badge bg="primary">{kpi.team.name}</Badge>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>
                    <div className="mb-2">
                      <strong>Mục tiêu:</strong>{" "}
                      {formatCurrency(kpi.revenueTarget)}
                    </div>
                    {kpi.status === "upcoming" ? (
                      <div className="text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        Chưa bắt đầu
                      </div>
                    ) : (
                      <>
                        <div className="mb-1">
                          <strong>Thực tế:</strong>{" "}
                          {formatCurrency(kpi.actualRevenue || 0)}
                        </div>
                        <ProgressBar
                          now={kpi.revenueProgress || 0}
                          variant={getProgressVariant(kpi.revenueProgress || 0)}
                          label={`${kpi.revenueProgress || 0}%`}
                          style={{
                            height: "22px",
                            backgroundColor: "#d1e9ff",
                            borderRadius: "6px",
                            fontWeight: 500,
                          }}
                        />
                      </>
                    )}
                  </td>
                  <td>
                    <div className="mb-2">
                      <strong>Mục tiêu:</strong> {kpi.bktTarget} kênh
                    </div>
                    {kpi.status === "upcoming" ? (
                      <div className="text-muted small">
                        <i className="bi bi-info-circle me-1"></i>
                        Chưa bắt đầu
                      </div>
                    ) : (
                      <>
                        <div className="mb-1">
                          <strong>Thực tế:</strong> {kpi.actualBkt || 0} kênh
                        </div>
                        <ProgressBar
                          now={kpi.bktProgress || 0}
                          variant={getProgressVariant(kpi.bktProgress || 0)}
                          label={`${kpi.bktProgress || 0}%`}
                          style={{
                            height: "22px",
                            backgroundColor: "#d1e9ff",
                            borderRadius: "6px",
                            fontWeight: 500,
                          }}
                        />
                      </>
                    )}
                  </td>
                  <td>
                    <div className="small">
                      <div>
                        <strong>Bắt đầu:</strong> {formatDate(kpi.startDate)}
                      </div>
                      <div>
                        <strong>Kết thúc:</strong> {formatDate(kpi.endDate)}
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(kpi.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <Button variant="outline-secondary" size="sm" onClick={onRefresh}>
          <i className="bi bi-arrow-clockwise me-1"></i>
          Làm mới
        </Button>
      </div>
    </>
  );
}

export default EmployeeKPITable;
