import React from "react";
import { Table, Badge, Button } from "react-bootstrap";
import { Archive, BroadcastPin, XCircle } from "react-bootstrap-icons";

function ResourceTable({ resources, onManageChannel, onRemoveChannel }) {
  const getStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: { variant: "info", text: "Khả dụng" },
      ASSIGNED: { variant: "success", text: "Đang sử dụng" },
      DISABLED: { variant: "danger", text: "Vô hiệu hóa" },
    };
    return statusConfig[status] || { variant: "secondary", text: status };
  };

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center py-5">
        <Archive size={48} className="text-muted mb-3" />
        <p className="text-muted">Chưa có resource nào được gán cho bạn</p>
        <small className="text-muted">
          Liên hệ Admin để được cấp tài nguyên email
        </small>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className="align-middle" striped bordered>
        <thead className="table-light">
          <tr>
            <th>Email</th>
            <th>Recovery Email</th>
            <th>Trạng thái</th>
            <th>Kênh</th>
            <th>Ghi chú</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => {
            const statusInfo = getStatusBadge(resource.status);
            return (
              <tr key={resource._id}>
                <td>
                  <div className="fw-medium">{resource.email}</div>
                  <small className="text-muted">Tài nguyên của bạn</small>
                </td>
                <td>
                  <small className="text-muted">{resource.recoveryEmail}</small>
                </td>
                <td>
                  <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>
                </td>
                <td>
                  {resource.assignedChannel ? (
                    <div>
                      <div className="fw-medium">
                        {resource.assignedChannel.link ? (
                          <a
                            href={resource.assignedChannel.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            {resource.assignedChannel.name}
                          </a>
                        ) : (
                          resource.assignedChannel.name
                        )}
                      </div>
                      <small className="text-muted">
                        {resource.assignedChannel.status}
                      </small>
                    </div>
                  ) : (
                    <span className="text-muted fst-italic">Chưa gán kênh</span>
                  )}
                </td>
                <td>
                  <small className="text-muted">{resource.note || "-"}</small>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    {resource.status !== "DISABLED" && (
                      <>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => onManageChannel(resource)}
                        >
                          <BroadcastPin size={16} className="me-1" />
                          {resource.assignedChannel ? "Đổi kênh" : "Gán kênh"}
                        </Button>

                        {resource.assignedChannel && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => onRemoveChannel(resource._id)}
                          >
                            <XCircle size={16} className="me-1" />
                            Bỏ kênh
                          </Button>
                        )}
                      </>
                    )}
                    {resource.status === "DISABLED" && (
                      <small className="text-muted">Đã vô hiệu hóa</small>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default ResourceTable;
