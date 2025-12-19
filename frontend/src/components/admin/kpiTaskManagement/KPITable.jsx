import React, { useState } from "react";
import {
  Table,
  Badge,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  InputGroup,
  ProgressBar,
} from "react-bootstrap";
import axios from "axios";

function KPITable({ kpis, loading, onEdit, onRefresh, onDeleted }) {
  const [deleting, setDeleting] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSort, setFilterSort] = useState("NEWEST");
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleDelete = async (kpiId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa KPI này?")) {
      return;
    }

    try {
      setDeleting(kpiId);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:9999/kpi/delete/${kpiId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onDeleted();
    } catch (err) {
      alert(
        "Không thể xóa KPI: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setDeleting(null);
    }
  };

  // Filter và sort KPIs
  const getFilteredAndSortedKPIs = () => {
    let filtered = kpis;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((kpi) => kpi.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (kpi) =>
          kpi.user?.fullName.toLowerCase().includes(searchLower) ||
          kpi.team?.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (filterSort === "NEWEST") {
        return new Date(b.startDate) - new Date(a.startDate);
      } else if (filterSort === "OLDEST") {
        return new Date(a.startDate) - new Date(b.startDate);
      } else if (filterSort === "REVENUE_DESC") {
        return b.revenueTarget - a.revenueTarget;
      } else if (filterSort === "REVENUE_ASC") {
        return a.revenueTarget - b.revenueTarget;
      }
      return 0;
    });

    return sorted;
  };

  const filteredKPIs = getFilteredAndSortedKPIs();

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
      {/* Filters */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Tìm kiếm</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Tên nhân viên, team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Form.Group>
        </Col>

        <Col md={4}>
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

        <Col md={4}>
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
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Stats */}
      <div className="mb-3">
        <small className="text-muted">
          Hiển thị {filteredKPIs.length} / {kpis.length} KPI
          {filterStatus !== "ALL" && ` (Trạng thái: ${filterStatus})`}
        </small>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nhân viên / Team</th>
              <th>KPI Doanh thu</th>
              <th>KPI Kênh BKT</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredKPIs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  {searchTerm || filterStatus !== "ALL"
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
                      <div>
                        <Badge bg="primary">{kpi.team.name}</Badge>
                      </div>
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
                          style={{ height: "25px" }}
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
                          style={{ height: "25px" }}
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
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => onEdit(kpi)}
                      className="me-2"
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(kpi._id)}
                      disabled={deleting === kpi._id}
                    >
                      {deleting === kpi._id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <i className="bi bi-trash"></i>
                      )}
                    </Button>
                  </td>
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

export default KPITable;
