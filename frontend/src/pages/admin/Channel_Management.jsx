import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Alert,
  Modal,
  Spinner,
  Form,
  Badge,
  ProgressBar,
} from "react-bootstrap";
import ChannelTable from "../../components/admin/channelManagement/ChannelTable";
import axios from "axios";

function Channel_Management() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Sync states
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(null);
  const [syncStartDate, setSyncStartDate] = useState("");
  const [syncEndDate, setSyncEndDate] = useState("");

  useEffect(() => {
    // Set default dates (last 28 days)
    const today = new Date();
    const last28Days = new Date();
    last28Days.setDate(today.getDate() - 28);

    setSyncEndDate(today.toISOString().split("T")[0]);
    setSyncStartDate(last28Days.toISOString().split("T")[0]);
  }, []);

  const handleSyncAll = async () => {
    if (!syncStartDate || !syncEndDate) {
      setError("Vui lòng chọn khoảng thời gian đồng bộ!");
      return;
    }

    if (new Date(syncStartDate) > new Date(syncEndDate)) {
      setError("Ngày bắt đầu phải nhỏ hơn ngày kết thúc!");
      return;
    }

    setSyncing(true);
    setError(null);
    setSuccess(null);
    setSyncProgress(null);

    try {
      const response = await axios.post(
        `http://localhost:9999/youtube-analytics/sync-all`,
        null,
        {
          params: {
            startDate: syncStartDate,
            endDate: syncEndDate,
          },
        }
      );

      const data = response.data.data;

      setSyncProgress({
        successful: data.successful || [],
        failed: data.failed || [],
        totalChannels: data.totalChannels || 0,
      });

      if (data.failed && data.failed.length > 0) {
        setError(`Đồng bộ hoàn tất với ${data.failed.length} kênh thất bại!`);
      } else {
        setSuccess(
          `Đồng bộ thành công ${data.successful.length}/${data.totalChannels} kênh!`
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Không thể đồng bộ dữ liệu! Vui lòng thử lại."
      );
    } finally {
      setSyncing(false);
    }
  };

  const closeSyncModal = () => {
    setShowSyncModal(false);
    setSyncProgress(null);
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Quản lý kênh Youtube</h1>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <Alert.Heading>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Lỗi!
          </Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <Alert.Heading>
            <i className="bi bi-check-circle-fill me-2"></i>
            Thành công!
          </Alert.Heading>
          <p className="mb-0">{success}</p>
        </Alert>
      )}

      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h5>Thống kê Analytics</h5>
            <div className="d-flex gap-2">
              <Button
                variant="success"
                onClick={() => setShowSyncModal(true)}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Đang đồng bộ...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Đồng bộ tất cả
                  </>
                )}
              </Button>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                <i className="bi bi-plus-circle me-2"></i>
                Thêm kênh mới
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <ChannelTable />
        </Col>
      </Row>

      {/* Sync Modal */}
      <Modal
        show={showSyncModal}
        onHide={closeSyncModal}
        centered
        backdrop={syncing ? "static" : true}
        keyboard={!syncing}
      >
        <Modal.Header closeButton={!syncing}>
          <Modal.Title>
            <i className="bi bi-arrow-repeat me-2"></i>
            Đồng bộ dữ liệu Analytics
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {!syncProgress ? (
            <>
              <p className="text-muted mb-3">
                Đồng bộ dữ liệu YouTube Analytics cho tất cả các kênh đã được ủy
                quyền trong khoảng thời gian được chọn.
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Từ ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={syncStartDate}
                  onChange={(e) => setSyncStartDate(e.target.value)}
                  disabled={syncing}
                  max={syncEndDate}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Đến ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={syncEndDate}
                  onChange={(e) => setSyncEndDate(e.target.value)}
                  disabled={syncing}
                  min={syncStartDate}
                  max={new Date().toISOString().split("T")[0]}
                />
              </Form.Group>

              <Alert variant="info" className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                <strong>Lưu ý:</strong> Quá trình đồng bộ có thể mất vài phút
                tùy thuộc vào số lượng kênh.
              </Alert>
            </>
          ) : (
            <div>
              <h5 className="mb-3">Kết quả đồng bộ</h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Tiến độ:</span>
                  <span>
                    <strong>
                      {syncProgress.successful.length}/
                      {syncProgress.totalChannels}
                    </strong>
                  </span>
                </div>
                <ProgressBar
                  now={
                    (syncProgress.successful.length /
                      syncProgress.totalChannels) *
                    100
                  }
                  variant="success"
                  animated={syncing}
                />
              </div>

              {syncProgress.successful.length > 0 && (
                <Alert variant="success">
                  <strong>
                    <i className="bi bi-check-circle me-2"></i>
                    Thành công: {syncProgress.successful.length} kênh
                  </strong>
                  <div
                    className="mt-2"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {syncProgress.successful.map((item, idx) => (
                      <div key={idx} className="small border-bottom py-1">
                        <Badge bg="success" className="me-2">
                          {item.recordCount || 0}
                        </Badge>
                        {item.channelName}
                      </div>
                    ))}
                  </div>
                </Alert>
              )}

              {syncProgress.failed.length > 0 && (
                <Alert variant="danger">
                  <strong>
                    <i className="bi bi-x-circle me-2"></i>
                    Thất bại: {syncProgress.failed.length} kênh
                  </strong>
                  <div
                    className="mt-2"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {syncProgress.failed.map((item, idx) => (
                      <div key={idx} className="small border-bottom py-1">
                        <strong>{item.channelName}:</strong>
                        <div className="text-muted">{item.error}</div>
                      </div>
                    ))}
                  </div>
                </Alert>
              )}
            </div>
          )}

          {syncing && (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 mb-0 text-muted">
                Đang đồng bộ dữ liệu, vui lòng đợi...
              </p>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeSyncModal}
            disabled={syncing}
          >
            {syncProgress ? "Đóng" : "Hủy"}
          </Button>
          {!syncProgress && (
            <Button
              variant="success"
              onClick={handleSyncAll}
              disabled={syncing || !syncStartDate || !syncEndDate}
            >
              {syncing ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Bắt đầu đồng bộ
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Channel_Management;
