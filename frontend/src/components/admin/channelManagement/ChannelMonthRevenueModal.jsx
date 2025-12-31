import React, { useState, useEffect } from "react";
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
} from "react-bootstrap";
import {
  Calendar,
  Lock,
  Unlock,
  Calculator,
  Trash,
  CloudDownload,
} from "react-bootstrap-icons";
import axios from "axios";
import config from "../../../configs/api";

function ChannelMonthRevenueModal({ show, onHide, channelId, channelName }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [channelData, setChannelData] = useState(null);
  const [revenues, setRevenues] = useState([]);
  const [totals, setTotals] = useState({ totalEstimated: 0, totalActual: 0 });
  const [editingMonth, setEditingMonth] = useState(null);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    if (show && channelId) {
      fetchRevenueData();
    }
  }, [show, channelId]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      const response = await axios.get(
        `${config.backendBase}/channel-revenue/${channelId}/monthly`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setChannelData(response.data.data.channel);
      setRevenues(response.data.data.revenues);
      setTotals(response.data.data.totals);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAnalytics = async () => {
    if (!window.confirm("Đồng bộ doanh thu từ YouTube Analytics?")) return;

    try {
      setLoading(true);
      const token = getToken();

      const now = new Date();
      const endMonth = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 11);
      const startMonth = `${startDate.getFullYear()}-${String(
        startDate.getMonth() + 1
      ).padStart(2, "0")}`;

      await axios.post(
        `${config.backendBase}/channel-revenue/${channelId}/sync-analytics`,
        { startMonth, endMonth },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Đồng bộ thành công!");
      fetchRevenueData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi đồng bộ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRevenue = async (month, field, value) => {
    try {
      const token = getToken();
      const updateData = { month, [field]: parseFloat(value) || 0 };

      await axios.post(
        `${config.backendBase}/channel-revenue/${channelId}/monthly`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedRevenues = revenues.map((rev) => {
        if (rev.month === month) {
          return { ...rev, [field]: parseFloat(value) || 0 };
        }
        return rev;
      });
      setRevenues(updatedRevenues);
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi cập nhật");
    }
  };

  const handleToggleLock = async (month) => {
    try {
      const token = getToken();
      await axios.patch(
        `${config.backendBase}/channel-revenue/${channelId}/monthly/${month}/toggle-lock`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchRevenueData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi khóa/mở khóa");
    }
  };

  const handleDeleteRevenue = async (month) => {
    if (!window.confirm(`Xóa dữ liệu tháng ${month}?`)) return;

    try {
      const token = getToken();
      await axios.delete(
        `${config.backendBase}/channel-revenue/${channelId}/monthly/${month}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchRevenueData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const getFormulaText = () => {
    if (!channelData?.isMonetized) {
      return <span>Kênh chưa bật kiếm tiền</span>;
    }

    return (
      <>
        <div>
          • <strong>Trường hợp có Network:</strong>
          <br />
          DT Thực tế = DT Ước tính × (100% − Net Network − Thuế TNCN)
        </div>

        <div className="mt-2">
          • <strong>Trường hợp không có Network:</strong>
          <br />
          DT Thực tế = DT Ước tính × (100% − Thuế Mỹ − Thuế TNCN)
        </div>
      </>
    );
  };

  // Hàm hỗ trợ lấy giá trị và nhãn của phần khấu trừ
  const getDeductionInfo = (rev) => {
    if (channelData?.hasNetwork) {
      return { value: rev.netNetwork, label: "Net Network" };
    } else {
      return { value: rev.taxUS, label: "Thuế Mỹ" };
    }
  };

  const getDeductionFieldName = () => {
    return channelData?.hasNetwork ? "netNetwork" : "taxUS";
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="border-0 pb-3">
        <Modal.Title className="fw-bold">
          <Calendar className="me-2 text-primary" />
          Doanh thu theo tháng: <span className="text-dark">{channelName}</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {/* Thông tin kênh */}
            <Alert variant="light" className="border mb-4">
              <Row>
                <Col md={6}>
                  <small className="text-muted">Trạng thái kiếm tiền:</small>
                  <div>
                    {channelData?.isMonetized ? (
                      <Badge bg="success">Đã bật kiếm tiền</Badge>
                    ) : (
                      <Badge bg="secondary">Chưa bật</Badge>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <small className="text-muted">Thuộc Network:</small>
                  <div>
                    {channelData?.hasNetwork ? (
                      <Badge bg="primary">Có</Badge>
                    ) : (
                      <Badge bg="warning" text="dark">
                        Không
                      </Badge>
                    )}
                  </div>
                </Col>
              </Row>
            </Alert>

            {/* Tổng quan */}
            <Alert variant="light" className="border mb-4">
              <Row className="text-center">
                <Col>
                  <small className="text-muted">Tổng DT Ước tính</small>
                  <div className="fw-bold fs-5">
                    ${totals.totalEstimated.toLocaleString()}
                  </div>
                </Col>
                <Col>
                  <small className="text-muted">Tổng DT Thực tế</small>
                  <div className="fw-bold fs-4 text-success">
                    ${totals.totalActual.toFixed(2).toLocaleString()}
                  </div>
                </Col>
              </Row>
            </Alert>

            {/* Nút đồng bộ */}
            <div className="mb-3">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleSyncAnalytics}
                disabled={!channelData?.isMonetized}
              >
                <CloudDownload className="me-1" />
                Đồng bộ từ Analytics (12 tháng gần nhất)
              </Button>
            </div>

            {/* Bảng dữ liệu */}
            <Table bordered hover responsive className="table-sm align-middle">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="text-center">Tháng</th>
                  <th className="text-center">DT Ước tính ($)</th>
                  <th className="text-center">Thuế / Network (%)</th>
                  <th className="text-center">Thuế TNCN (%)</th>
                  <th className="text-center">DT Thực tế ($)</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {revenues.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Chưa có dữ liệu. Hãy đồng bộ từ Analytics hoặc nhập thủ
                      công.
                    </td>
                  </tr>
                ) : (
                  revenues.map((rev) => {
                    const deduction = getDeductionInfo(rev);
                    return (
                      <tr
                        key={rev.month}
                        className={rev.locked ? "table-light" : ""}
                      >
                        <td className="text-center fw-bold">{rev.month}</td>
                        <td className="text-center">
                          {rev.estimatedRevenue.toFixed(2)}
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column align-items-center">
                            <Form.Control
                              type="number"
                              size="sm"
                              min="0"
                              max="100"
                              step="0.1"
                              disabled={rev.locked}
                              value={deduction.value}
                              onChange={(e) =>
                                handleUpdateRevenue(
                                  rev.month,
                                  getDeductionFieldName(),
                                  e.target.value
                                )
                              }
                              className="text-center mb-1"
                              style={{ width: "100px" }}
                            />
                            <small className="text-muted">
                              {deduction.label}
                            </small>
                          </div>
                        </td>
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
                                e.target.value
                              )
                            }
                            className="text-center"
                          />
                        </td>
                        <td className="text-center fw-bold text-success">
                          {rev.actualRevenue.toFixed(2)}
                        </td>
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
                        <td className="text-center">
                          <Button
                            variant={
                              rev.locked
                                ? "outline-success"
                                : "outline-secondary"
                            }
                            size="sm"
                            className="me-1"
                            onClick={() => handleToggleLock(rev.month)}
                          >
                            {rev.locked ? (
                              <Unlock size={14} />
                            ) : (
                              <Lock size={14} />
                            )}
                          </Button>
                          {!rev.locked && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteRevenue(rev.month)}
                            >
                              <Trash size={14} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>

            {/* Công thức tính */}
            <Alert variant="info" className="mt-4 mb-0">
              <Calculator className="me-2" />
              <strong>Công thức tính (áp dụng theo từng tháng):</strong>
              <div className="mt-2">{getFormulaText()}</div>
            </Alert>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ChannelMonthRevenueModal;
