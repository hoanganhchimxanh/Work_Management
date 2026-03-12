import {
  Modal,
  Table,
  Button,
  Form,
  Badge,
  Alert,
  Row,
  Col,
  Spinner,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import {
  Calendar,
  Lock,
  Unlock,
  Calculator,
  Trash,
  CloudDownload,
  InfoCircle,
} from "react-bootstrap-icons";
import { useChannelRevenue } from "../../../../hooks/admin/channelManagement/useChannelRevenue";
import { useRevenueActions } from "../../../../hooks/admin/channelManagement/useRevenueActions";
import { useRevenueUtils } from "../../../../hooks/admin/channelManagement/useRevenueUtils";
import { useState } from "react";

function ChannelMonthRevenueModal({ show, onHide, channelId, channelName }) {
  const {
    loading,
    error,
    channelData,
    revenues,
    totals,
    setRevenues,
    fetchRevenueData,
  } = useChannelRevenue(channelId, show);

  const {
    handleSyncAnalytics,
    handleUpdateRevenue,
    handleToggleLock,
    handleDeleteRevenue,
  } = useRevenueActions(channelId, revenues, setRevenues, fetchRevenueData);

  const { formatNumber, getFormulaText } = useRevenueUtils(channelData);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const totalPages = Math.ceil((revenues?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRevenues = revenues?.slice(startIndex, startIndex + itemsPerPage) || [];

  // Helper để render tooltip
  const renderTooltip = (text) => <Tooltip id="button-tooltip">{text}</Tooltip>;

  return (
    <Modal show={show} onHide={onHide} size="xl" centered fullscreen="lg-down">
      <Modal.Header closeButton className="border-0 pb-3 bg-light">
        <Modal.Title className="fw-bold">
          <Calendar className="me-2 text-primary" />
          Doanh thu theo tháng: <span className="text-dark">{channelName}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">
            <strong>Lỗi:</strong> {error}
          </Alert>
        ) : (
          <>
            {/* Thông tin kênh */}
            <Alert variant="light" className="border mb-4">
              <Row>
                <Col md={4}>
                  <small className="text-muted d-block">
                    Trạng thái kiếm tiền:
                  </small>
                  <div className="mt-1">
                    {channelData?.isMonetized ? (
                      <Badge bg="success" className="px-3 py-2">
                        <i className="bi bi-check-circle me-1"></i>
                        Đã bật kiếm tiền
                      </Badge>
                    ) : (
                      <Badge bg="secondary" className="px-3 py-2">
                        <i className="bi bi-x-circle me-1"></i>
                        Chưa bật
                      </Badge>
                    )}
                  </div>
                </Col>
                <Col md={4}>
                  <small className="text-muted d-block">Thuộc Network:</small>
                  <div className="mt-1">
                    {channelData?.hasNetwork ? (
                      <Badge bg="primary" className="px-3 py-2">
                        <i className="bi bi-diagram-3 me-1"></i>
                        Có (MCN)
                      </Badge>
                    ) : (
                      <Badge bg="warning" text="dark" className="px-3 py-2">
                        <i className="bi bi-person me-1"></i>
                        Không (Trực tiếp)
                      </Badge>
                    )}
                  </div>
                </Col>
                {channelData?.monetizeDate && (
                  <Col md={4}>
                    <small className="text-muted d-block">
                      Ngày bật kiếm tiền:
                    </small>
                    <div className="mt-1 fw-bold">
                      {new Date(channelData.monetizeDate).toLocaleDateString(
                        "vi-VN",
                      )}
                    </div>
                  </Col>
                )}
              </Row>
            </Alert>

            {/* Tổng quan */}
            <Alert
              variant="primary"
              className="bg-primary bg-opacity-10 border-primary mb-4"
            >
              <Row className="text-center">
                <Col md={3}>
                  <small className="text-muted d-block">Tổng DT Ước tính</small>
                  <div className="fw-bold fs-5 text-primary mt-1">
                    ${totals.totalEstimated.toLocaleString()}
                  </div>
                </Col>
                <Col md={3}>
                  <small className="text-muted d-block">DT từ Mỹ</small>
                  <div className="fw-bold fs-5 text-info mt-1">
                    ${totals.totalUsRevenue?.toLocaleString() || "0"}
                  </div>
                </Col>
                <Col md={3}>
                  <small className="text-muted d-block">DT ngoài Mỹ</small>
                  <div className="fw-bold fs-5 text-secondary mt-1">
                    ${totals.totalNonUsRevenue?.toLocaleString() || "0"}
                  </div>
                </Col>
                <Col md={3}>
                  <small className="text-muted d-block">Tổng DT Thực tế</small>
                  <div className="fw-bold fs-4 text-success mt-1">
                    ${totals.totalActual.toFixed(2).toLocaleString()}
                  </div>
                </Col>
              </Row>
            </Alert>

            {/* Nút đồng bộ */}
            <div className="mb-3 d-flex gap-2 align-items-center">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleSyncAnalytics}
                disabled={!channelData?.isMonetized}
              >
                <CloudDownload className="me-1" />
                Đồng bộ từ Analytics (12 tháng gần nhất)
              </Button>

              <OverlayTrigger
                placement="right"
                overlay={renderTooltip(
                  "Dữ liệu bao gồm: Tổng DT, DT từ Mỹ (API), Tổng views, Views từ Mỹ",
                )}
              >
                <InfoCircle className="text-muted" />
              </OverlayTrigger>

              {!channelData?.isMonetized && (
                <small className="text-danger ms-2">
                  * Kênh chưa bật kiếm tiền
                </small>
              )}
            </div>

            {/* Bảng dữ liệu */}
            <div className="table-responsive">
              <Table bordered hover className="table-sm align-middle mb-0">
                <thead className="bg-primary text-white">
                  <tr>
                    <th
                      className="text-center"
                      rowSpan="2"
                      style={{ verticalAlign: "middle" }}
                    >
                      Tháng
                    </th>
                    <th className="text-center" colSpan="4">
                      Dữ liệu từ YouTube Analytics
                    </th>
                    <th className="text-center" colSpan="3">
                      Các khoản khấu trừ (%)
                    </th>
                    <th
                      className="text-center"
                      rowSpan="2"
                      style={{ verticalAlign: "middle" }}
                    >
                      DT Thực tế ($)
                    </th>
                    <th
                      className="text-center"
                      rowSpan="2"
                      style={{ verticalAlign: "middle" }}
                    >
                      Trạng thái
                    </th>
                    <th
                      className="text-center"
                      rowSpan="2"
                      style={{ verticalAlign: "middle" }}
                    >
                      Thao tác
                    </th>
                  </tr>
                  <tr>
                    <th className="text-center">DT Ước tính ($)</th>
                    <th className="text-center">Tổng Views</th>
                    <th className="text-center">DT từ Mỹ ($)</th>
                    <th className="text-center">Views Mỹ</th>
                    <th className="text-center">Thuế Mỹ</th>
                    <th className="text-center">Net Network</th>
                    <th className="text-center">Thuế TNCN</th>
                  </tr>
                </thead>
                <tbody>
                  {!revenues || revenues.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center text-muted py-5">
                        <div className="d-flex flex-column align-items-center">
                          <InfoCircle
                            size={24}
                            className="mb-2 d-block mx-auto"
                          />
                          Chưa có dữ liệu. Hãy đồng bộ từ Analytics hoặc nhập
                          thủ công.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentRevenues.map((rev) => (
                      <tr
                        key={rev.month}
                        className={rev.locked ? "table-light" : ""}
                      >
                        {/* Tháng */}
                        <td className="text-center fw-bold">{rev.month}</td>

                        {/* DT Ước tính */}
                        <td className="text-center">
                          {formatNumber(rev.estimatedRevenue)}
                        </td>

                        {/* Tổng Views */}
                        <td className="text-center text-muted">
                          {rev.totalViews?.toLocaleString() || "-"}
                        </td>

                        {/* ✅ DT từ Mỹ (API) */}
                        <td className="text-center">
                          <span className="text-info fw-bold">
                            {formatNumber(rev.usRevenue)}
                          </span>
                        </td>

                        {/* Views Mỹ */}
                        <td className="text-center text-info">
                          {rev.usViews?.toLocaleString() || "-"}
                          {rev.usViewsPercentage > 0 && (
                            <div>
                              <small className="text-muted">
                                ({formatNumber(rev.usViewsPercentage)}%)
                              </small>
                            </div>
                          )}
                        </td>

                        {/* Thuế Mỹ */}
                        <td className="text-center">
                          <Form.Control
                            type="number"
                            size="sm"
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={rev.locked}
                            value={rev.taxUS}
                            onChange={(e) =>
                              handleUpdateRevenue(
                                rev.month,
                                "taxUS",
                                e.target.value,
                              )
                            }
                            className="text-center"
                            style={{ width: "80px" }}
                          />
                        </td>

                        {/* Net Network */}
                        <td className="text-center">
                          {!channelData?.hasNetwork ? (
                            <span className="text-muted">N/A</span>
                          ) : (
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              max="100"
                              step="0.1"
                              disabled={rev.locked}
                              value={rev.netNetwork}
                              onChange={(e) =>
                                handleUpdateRevenue(
                                  rev.month,
                                  "netNetwork",
                                  e.target.value,
                                )
                              }
                              className="text-center"
                              style={{ width: "80px" }}
                            />
                          )}
                        </td>

                        {/* Thuế TNCN */}
                        <td className="text-center">
                          <Form.Control
                            type="number"
                            size="sm"
                            min="0"
                            max="100"
                            step="0.1"
                            disabled={rev.locked}
                            value={rev.taxPIT}
                            onChange={(e) =>
                              handleUpdateRevenue(
                                rev.month,
                                "taxPIT",
                                e.target.value,
                              )
                            }
                            className="text-center"
                            style={{ width: "80px" }}
                          />
                        </td>

                        {/* DT Thực tế */}
                        <td className="text-center">
                          <span className="fw-bold text-success fs-6">
                            {formatNumber(rev.actualRevenue)}
                          </span>
                        </td>

                        {/* Trạng thái */}
                        <td className="text-center">
                          {rev.locked ? (
                            <Badge bg="secondary" pill>
                              <Lock size={12} className="me-1" />
                              Đã khóa
                            </Badge>
                          ) : (
                            <Badge bg="warning" text="dark" pill>
                              <Unlock size={12} className="me-1" />
                              Có thể sửa
                            </Badge>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <OverlayTrigger
                              placement="top"
                              overlay={renderTooltip(
                                rev.locked ? "Mở khóa" : "Khóa",
                              )}
                            >
                              <Button
                                variant={
                                  rev.locked
                                    ? "outline-success"
                                    : "outline-secondary"
                                }
                                size="sm"
                                onClick={() => handleToggleLock(rev.month)}
                              >
                                {rev.locked ? (
                                  <Unlock size={14} />
                                ) : (
                                  <Lock size={14} />
                                )}
                              </Button>
                            </OverlayTrigger>

                            {!rev.locked && (
                              <OverlayTrigger
                                placement="top"
                                overlay={renderTooltip("Xóa")}
                              >
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteRevenue(rev.month)}
                                >
                                  <Trash size={14} />
                                </Button>
                              </OverlayTrigger>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>

            {/* Công thức tính */}
            <Alert variant="info" className="mt-4 mb-0">
              <div className="d-flex align-items-start">
                <Calculator className="me-2 mt-1 flex-shrink-0" size={20} />
                <div className="flex-grow-1">
                  <strong className="d-block mb-2">
                    Công thức tính doanh thu thực tế:
                  </strong>
                  {getFormulaText()}
                </div>
              </div>
            </Alert>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted small">
                  Hiển thị từ {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, revenues.length)} trong tổng số {revenues.length} tháng
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Trang trước
                  </Button>
                  <div className="px-3 py-1 bg-light border rounded">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ChannelMonthRevenueModal;
