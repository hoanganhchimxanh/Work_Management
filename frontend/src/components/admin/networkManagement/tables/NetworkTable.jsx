import React from "react";
import { Table, Button, Badge, Spinner } from "react-bootstrap";
import { Pencil, Trash } from "react-bootstrap-icons";

const NetworkTable = ({ networks, loading, onEdit, onDelete, onRefresh }) => {
  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: "success",
      STRIKE: "warning",
      DEMONETIZED: "danger",
      DEAD: "dark",
    };
    const labels = {
      ACTIVE: "Hoạt động",
      STRIKE: "Bị gậy",
      DEMONETIZED: "TKT",
      DEAD: "Die",
    };
    return (
      <Badge bg={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getNoteBadge = (note) => {
    const variants = {
      PENDING_ACTIVATION: "warning",
      REJECTED: "danger",
      PENDING_IDENTITY_VERIFICATION: "info",
      IDENTITY_VERIFICATION_REVIEW: "primary",
      PENDING_32: "secondary",
      PENDING_PIN: "info",
      ACTIVATED: "success",
    };
    const labels = {
      PENDING_ACTIVATION: "Chờ active",
      REJECTED: "Từ chối",
      PENDING_IDENTITY_VERIFICATION: "Chờ XMDT",
      IDENTITY_VERIFICATION_REVIEW: "XMDT chờ duyệt",
      PENDING_32: "Chờ 32 ngày",
      PENDING_PIN: "Chờ PIN",
      ACTIVATED: "Active",
    };
    return (
      <Badge bg={variants[note] || "secondary"}>{labels[note] || note}</Badge>
    );
  };

  const getLocationBadge = (location) => {
    const variants = {
      HOME: "primary",
      OFFICE: "info",
      OTHER: "secondary",
    };
    const labels = {
      HOME: "Nhà",
      OFFICE: "Văn phòng",
      OTHER: "Khác",
    };
    return (
      <Badge bg={variants[location] || "secondary"}>
        {labels[location] || location}
      </Badge>
    );
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
      <Table
        striped
        bordered
        hover
        style={{
          tableLayout: "fixed",
          width: "100%",
        }}
      >
        <thead>
          <tr>
            <th style={{ width: "50px" }}>STT</th>
            <th style={{ width: "170px" }}>Mã định danh</th>
            <th style={{ width: "160px" }}>Employment</th>
            <th style={{ width: "260px" }}>Account</th>
            <th style={{ width: "100px" }}>Tax Form</th>
            <th style={{ width: "180px" }}>Linked Channel</th>
            <th style={{ width: "120px" }}>Location</th>
            <th style={{ width: "110px" }}>Ngày tạo</th>
            <th style={{ width: "110px" }}>Ngày nhắc</th>
            <th style={{ width: "100px" }}>Trạng thái</th>
            <th style={{ width: "100px" }}>Note</th>
            <th style={{ width: "90px" }}>Thao tác</th>
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
                  <div className="d-flex flex-column gap-1">
                    {/* PUB-ID */}
                    <div>
                      <small className="text-muted fw-semibold">PUB-ID:</small>{" "}
                      <small className="text-monospace">
                        {network.pubId || "N/A"}
                      </small>
                    </div>

                    {/* Profile AdSense */}
                    <div>
                      <small className="text-muted fw-semibold">
                        AdSense-ID:
                      </small>{" "}
                      <small className="text-monospace">
                        {network.profileAdsenseId || "N/A"}
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  {network.employment?.fullName || network.employment || "N/A"}
                </td>

                <td>
                  <div className="d-flex flex-column gap-1">
                    {/* Email */}
                    <div>
                      <strong className="text-muted">Email:</strong>{" "}
                      <small>{network.emailAddress || "N/A"}</small>
                    </div>

                    {/* Password */}
                    <div>
                      <strong className="text-muted">Pass:</strong>{" "}
                      <small>{network.password || "N/A"}</small>
                    </div>

                    {/* Recovery */}
                    <div>
                      <strong className="text-muted">Recovery:</strong>{" "}
                      <small>{network.recoveryEmail || "N/A"}</small>
                    </div>

                    {/* 2FA */}
                    <div>
                      <strong className="text-muted">2FA:</strong>{" "}
                      {network.twoFA ? (
                        <Badge bg="success" className="ms-1">
                          Có
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="ms-1">
                          Không
                        </Badge>
                      )}
                    </div>
                  </div>
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
                <td>{getNoteBadge(network.note)}</td>
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
