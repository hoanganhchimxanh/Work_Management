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
        <thead>
          <tr>
            <th style={{ width: "50px" }}>STT</th>
            <th>Profile AdSense ID</th>
            <th>Nhân viên quản lý</th>
            <th>Email Address</th>
            <th>Recovery Email</th>
            <th>Tên thuế</th>
            <th>Kênh liên kết</th>
            <th>Email kênh liên kết</th>
            <th>Ngày tạo kênh</th>
            <th>Vị trí làm việc</th>
            <th>Quốc gia</th>
            <th>Ngày tạo network</th>
            <th>Ngày kiểm tra</th>
            <th>Trạng thái</th>
            <th>Note</th>
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
                <td>
                  {network.assignedUser?.fullName || "N/A"}
                  <br />
                  <small className="text-muted">
                    {network.assignedUser?.personalEmail}
                  </small>
                </td>
                <td>{network.emailAddress}</td>
                <td>{network.recoveryEmail}</td>
                <td>{network.taxName}</td>
                <td>{network.linkedChannelUrl}</td>
                <td>{network.emailChannel}</td>
                <td>{formatDate(network.channelJoinDate)}</td>
                <td>
                  <Badge bg="info">{network.location}</Badge>
                </td>
                <td>{network.country}</td>
                <td>{formatDate(network.creationDate)}</td>
                <td>{formatDate(network.reminderDate)}</td>
                <td>{getStatusBadge(network.status)}</td>
                <td>{network.note}</td>
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
