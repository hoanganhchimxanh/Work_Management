import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Spinner,
  Badge,
  Collapse,
  Alert,
  Card,
} from "react-bootstrap";
import { format } from "date-fns";
import config from "../../../configs/api";
import axios from "axios";
import {
  PencilSquare,
  Trash,
  ChevronDown,
  ChevronRight,
  PersonFill,
  CalendarEvent,
  FileEarmarkText,
} from "react-bootstrap-icons";
import EditResourceBatchModal from "./EditResourceBatchModal";

const ResourceBatchTable = React.forwardRef(({ onBatchUpdated }, ref) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedBatchId, setExpandedBatchId] = useState(null);
  const [batchResources, setBatchResources] = useState({});
  const [loadingResources, setLoadingResources] = useState({});

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  React.useImperativeHandle(ref, () => ({
    fetchBatches,
  }));

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${config.backendBase}/resource-batch/get-all`
      );
      setBatches(response.data.data || []);
    } catch (err) {
      console.error("Error fetching batches:", err);
      setError("Không thể tải danh sách batch");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchResources = async (batchId) => {
    if (batchResources[batchId]) {
      return; // Đã load rồi
    }

    try {
      setLoadingResources((prev) => ({ ...prev, [batchId]: true }));
      const response = await axios.get(
        `${config.backendBase}/resource-batch/${batchId}/resources`
      );
      setBatchResources((prev) => ({
        ...prev,
        [batchId]: response.data.data.resources || [],
      }));
    } catch (err) {
      console.error("Error fetching batch resources:", err);
      setError("Không thể tải resources của batch");
    } finally {
      setLoadingResources((prev) => ({ ...prev, [batchId]: false }));
    }
  };

  const handleToggleExpand = (batchId) => {
    if (expandedBatchId === batchId) {
      setExpandedBatchId(null);
    } else {
      setExpandedBatchId(batchId);
      fetchBatchResources(batchId);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa batch này?")) return;

    try {
      await axios.delete(`${config.backendBase}/resource-batch/delete/${id}`);
      setBatches(batches.filter((batch) => batch._id !== id));
      if (onBatchUpdated) onBatchUpdated();
    } catch (err) {
      alert("Xóa thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (batchId) => {
    setSelectedBatchId(batchId);
    setShowEditModal(true);
  };

  const handleBatchUpdated = () => {
    fetchBatches();
    if (onBatchUpdated) onBatchUpdated();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      ACTIVE: { bg: "success", text: "Đang hoạt động" },
      PENDING: { bg: "warning", text: "Chờ xử lý" },
      ARCHIVED: { bg: "secondary", text: "Đã lưu trữ" },
    };
    const config = statusConfig[status] || statusConfig.ACTIVE;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  const getResourceStatusBadge = (status) => {
    const statusConfig = {
      AVAILABLE: { bg: "success", text: "Khả dụng" },
      ASSIGNED: { bg: "primary", text: "Đã gán" },
      DISABLED: { bg: "secondary", text: "Vô hiệu hóa" },
    };
    const config = statusConfig[status] || statusConfig.AVAILABLE;
    return <Badge bg={config.bg}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải danh sách batch...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
        <Button
          variant="outline-danger"
          size="sm"
          className="ms-3"
          onClick={fetchBatches}
        >
          Thử lại
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {batches.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <FileEarmarkText size={48} className="mb-3 opacity-50" />
              <p>Chưa có batch tài nguyên nào</p>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "50px" }}></th>
                  <th style={{ width: "60px" }}>STT</th>
                  <th>Tên File Excel</th>
                  <th>Người quản lý</th>
                  <th>Thời gian tạo</th>
                  <th className="text-center">Số lượng</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "140px" }} className="text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch, index) => (
                  <React.Fragment key={batch._id}>
                    {/* Main Row */}
                    <tr
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggleExpand(batch._id)}
                    >
                      <td className="text-center">
                        {expandedBatchId === batch._id ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </td>
                      <td className="text-center">{index + 1}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <FileEarmarkText
                            size={20}
                            className="me-2 text-primary"
                          />
                          <div>
                            <strong>{batch.excelFileName}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <PersonFill
                            size={16}
                            className="me-2 text-secondary"
                          />
                          <div>
                            {batch.assignedUser?.fullName || (
                              <span className="text-muted">Chưa gán</span>
                            )}
                            {batch.assignedUser?.personalEmail && (
                              <>
                                <br />
                                <small className="text-muted">
                                  {batch.assignedUser.personalEmail}
                                </small>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <CalendarEvent
                            size={16}
                            className="me-2 text-secondary"
                          />
                          {format(
                            new Date(batch.createdAt),
                            "dd/MM/yyyy HH:mm"
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge bg="info" pill>
                          {batch.resources?.length || 0}
                        </Badge>
                      </td>
                      <td>{getStatusBadge(batch.status)}</td>
                      <td className="text-center">
                        <div
                          className="d-flex gap-1 justify-content-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="outline-warning"
                            title="Chỉnh sửa"
                            onClick={() => handleEdit(batch._id)}
                          >
                            <PencilSquare size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            title="Xóa"
                            onClick={() => handleDelete(batch._id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row - Resources Detail */}
                    <tr>
                      <td colSpan="8" className="p-0 border-0">
                        <Collapse in={expandedBatchId === batch._id}>
                          <div>
                            <div className="bg-light p-4">
                              {loadingResources[batch._id] ? (
                                <div className="text-center py-3">
                                  <Spinner
                                    animation="border"
                                    size="sm"
                                    variant="primary"
                                  />
                                  <span className="ms-2">
                                    Đang tải resources...
                                  </span>
                                </div>
                              ) : batchResources[batch._id]?.length > 0 ? (
                                <>
                                  <h6 className="mb-3">
                                    Danh sách Resources (
                                    {batchResources[batch._id].length})
                                  </h6>
                                  <Table
                                    striped
                                    bordered
                                    size="sm"
                                    className="mb-0"
                                  >
                                    <thead className="table-secondary">
                                      <tr>
                                        <th style={{ width: "50px" }}>STT</th>
                                        <th>Email</th>
                                        <th>Recovery Email</th>
                                        <th>Trạng thái</th>
                                        <th>Người được gán</th>
                                        <th>Channel</th>
                                        <th>Ghi chú</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {batchResources[batch._id].map(
                                        (resource, idx) => (
                                          <tr key={resource._id}>
                                            <td className="text-center">
                                              {idx + 1}
                                            </td>
                                            <td>
                                              <strong>{resource.email}</strong>
                                            </td>
                                            <td>
                                              {resource.recoveryEmail || "-"}
                                            </td>
                                            <td>
                                              {getResourceStatusBadge(
                                                resource.status
                                              )}
                                            </td>
                                            <td>
                                              {resource.assignedUser
                                                ?.fullName || (
                                                <span className="text-muted">
                                                  Chưa gán
                                                </span>
                                              )}
                                            </td>
                                            <td>
                                              {resource.assignedChannel
                                                ?.name || (
                                                <span className="text-muted">
                                                  Chưa gán
                                                </span>
                                              )}
                                            </td>
                                            <td>
                                              <small className="text-muted">
                                                {resource.note || "-"}
                                              </small>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </Table>
                                </>
                              ) : (
                                <div className="text-center py-3 text-muted">
                                  <p className="mb-0">
                                    Batch này chưa có resources nào
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <EditResourceBatchModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        batchId={selectedBatchId}
        onBatchUpdated={handleBatchUpdated}
      />
    </>
  );
});

export default ResourceBatchTable;
