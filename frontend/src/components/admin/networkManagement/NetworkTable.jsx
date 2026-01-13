import React from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import { Pencil, Trash } from "react-bootstrap-icons";

const NetworkTable = ({ networks, loading, onEdit, onDelete, onRefresh }) => {
  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: "success",
      PROCESSING: "warning",
      INACTIVE: "secondary",
      LOCKED: "danger",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const getLocationBadge = (location) => {
    const variants = {
      HOME: "primary",
      OFFICE: "info",
      OTHER: "secondary",
    };
    return <Badge bg={variants[location] || "secondary"}>{location}</Badge>;
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
            <th>PUB-ID</th>
            <th>Profile AdSense ID</th>
            <th>Employment</th>
            <th>Email Address</th>
            <th>Password</th>
            <th>Recovery Email</th>
            <th>2FA</th>
            <th>Tax Form</th>
            <th>Linked Channel</th>
            <th>Location</th>
            <th>Ngày tạo</th>
            <th>Ngày nhắc</th>
            <th>Trạng thái</th>
            <th>Note</th>
            <th style={{ width: "120px" }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {networks.length === 0 ? (
            <tr>
              <td colSpan="16" className="text-center py-4">
                Không tìm thấy network nào
              </td>
            </tr>
          ) : (
            networks.map((network, index) => (
              <tr key={network._id}>
                <td>{index + 1}</td>
                <td>
                  <small className="text-muted">{network.pubId || "N/A"}</small>
                </td>
                <td>
                  <small className="text-muted">
                    {network.profileAdsenseId}
                  </small>
                </td>
                <td>{network.employment || "N/A"}</td>
                <td>
                  <small>{network.emailAddress}</small>
                </td>
                <td>
                  <small className="text-muted">
                    {network.password ? "••••••••" : "N/A"}
                  </small>
                </td>
                <td>
                  <small>{network.recoveryEmail || "N/A"}</small>
                </td>
                <td className="text-center">
                  {network.twoFA ? (
                    <Badge bg="success">Có</Badge>
                  ) : (
                    <Badge bg="secondary">Không</Badge>
                  )}
                </td>
                <td>
                  <small>{network.taxForm || "N/A"}</small>
                </td>
                <td>
                  {network.linkedChannelUrl ? (
                    <a
                      href={network.linkedChannelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-truncate d-inline-block"
                      style={{ maxWidth: "150px" }}
                    >
                      {network.linkedChannelUrl}
                    </a>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>{getLocationBadge(network.location)}</td>
                <td>
                  <small>{formatDate(network.creationDate)}</small>
                </td>
                <td>
                  <small>{formatDate(network.reminderDate)}</small>
                </td>
                <td>{getStatusBadge(network.status)}</td>
                <td>
                  <small className="text-muted">{network.note || "N/A"}</small>
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
      <Button variant="outline-secondary" size="sm" onClick={onRefresh}>
        <i className="bi bi-arrow-clockwise me-1"></i>
        Làm mới
      </Button>
    </div>
  );
};

export default NetworkTable;
