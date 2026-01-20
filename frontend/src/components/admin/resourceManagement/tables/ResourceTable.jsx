import React from "react";
import { Table, Badge, Button, Form } from "react-bootstrap";
import { PencilSquare, Archive, Power } from "react-bootstrap-icons";

function ResourceTable({
  resources,
  onEdit,
  onDisable,
  onEnable,
  selectedResources = [],
  onSelectResource,
  onSelectAll,
  bulkAssignMode = false,
}) {
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
        <p className="text-muted">Chưa có resource nào</p>
      </div>
    );
  }

  // Chỉ cho phép chọn resources có status AVAILABLE
  const availableResources = resources.filter((r) => r.status === "AVAILABLE");
  const allAvailableSelected =
    availableResources.length > 0 &&
    availableResources.every((r) => selectedResources.includes(r._id));

  return (
    <div className="table-responsive">
      <Table hover className="align-middle" striped bordered>
        <thead className="table-light">
          <tr>
            {bulkAssignMode && (
              <th style={{ width: "50px" }}>
                <Form.Check
                  type="checkbox"
                  checked={allAvailableSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  disabled={availableResources.length === 0}
                />
              </th>
            )}
            <th>Email</th>
            <th>Recovery Email</th>
            <th>Trạng thái</th>
            <th>Người quản lý</th>
            <th>Kênh</th>
            <th>Ghi chú</th>
            {!bulkAssignMode && <th className="text-end">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => {
            const statusInfo = getStatusBadge(resource.status);
            const isSelectable = resource.status === "AVAILABLE";

            return (
              <tr key={resource._id}>
                {bulkAssignMode && (
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedResources.includes(resource._id)}
                      onChange={(e) =>
                        onSelectResource(resource._id, e.target.checked)
                      }
                      disabled={!isSelectable}
                    />
                  </td>
                )}
                <td>
                  <div className="fw-medium">{resource.email}</div>
                </td>
                <td>
                  <small className="text-muted">{resource.recoveryEmail}</small>
                </td>
                <td>
                  <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>
                </td>
                <td>
                  {resource.assignedUser ? (
                    <div>
                      <div className="fw-medium">
                        {resource.assignedUser.fullName}
                      </div>
                      <small className="text-muted">
                        {resource.assignedUser.phoneNumber}
                      </small>
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  {resource.assignedChannel ? (
                    <div>
                      <div className="fw-medium">
                        {resource.assignedChannel.name}
                      </div>
                      <small className="text-muted">
                        {resource.assignedChannel.status}
                      </small>
                    </div>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
                <td>
                  <small className="text-muted">{resource.note || "-"}</small>
                </td>
                {!bulkAssignMode && (
                  <td>
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => onEdit(resource)}
                      >
                        <PencilSquare size={16} />
                      </Button>

                      <Button
                        size="sm"
                        variant={
                          resource.status === "DISABLED"
                            ? "outline-success"
                            : "outline-warning"
                        }
                        onClick={() =>
                          resource.status === "DISABLED"
                            ? onEnable(resource)
                            : onDisable(resource)
                        }
                      >
                        {resource.status === "DISABLED" ? (
                          <Power size={16} />
                        ) : (
                          <Power size={16} />
                        )}
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default ResourceTable;
