// src/pages/NetworkManagement/components/NetworkTable.jsx
import React from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import { Pencil, Trash } from "react-bootstrap-icons";

const NetworkTable = ({ networks, loading, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: "success",
      PROCESSING: "warning",
      INACTIVE: "secondary",
      LOCKED: "danger",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table striped bordered hover>
        <thead className="table-dark">
          <tr>
            <th style={{ width: "50px" }}>STT</th>
            <th>Profile AdSense ID</th>
            <th>Email Address</th>
            <th>Nhân viên</th>
            <th>Vị trí</th>
            <th>Ngày tạo</th>
            <th>Quốc gia</th>
            <th>Trạng thái</th>
            <th>Số kênh</th>
            <th style={{ width: "120px" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {networks.length === 0 ? (
            <tr>
              <td colSpan="10" className="text-center py-4">
                Không tìm thấy network nào
              </td>
            </tr>
          ) : (
            networks.map((network, index) => (
              <tr key={network._id}>
                <td>{index + 1}</td>
                <td>
                  <small className="text-muted">
                    {network.profileAdsenseId}
                  </small>
                </td>
                <td>{network.emailAddress}</td>
                <td>
                  {network.assignedUser?.fullName || "N/A"}
                  <br />
                  <small className="text-muted">
                    {network.assignedUser?.personalEmail}
                  </small>
                </td>
                <td>
                  <Badge bg="info">{network.location}</Badge>
                </td>
                <td>{formatDate(network.creationDate)}</td>
                <td>{network.country}</td>
                <td>{getStatusBadge(network.status)}</td>
                <td>
                  <Badge bg="primary">{network.channelCount || 0}</Badge>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => onEdit(network)}
                      title="Chỉnh sửa"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(network)}
                      title="Xóa"
                    >
                      <Trash />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default NetworkTable;
