import React from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import useAddNetworkModal from "../../../../hooks/admin/networkManagement/useAddNetworkModal";

const AddNetworkModal = ({ show, onHide, onSubmit }) => {
  const {
    formData,
    loading,
    error,
    setError,
    showPassword,
    setShowPassword,
    employees,
    loadingEmployees,
    handleChange,
    handleSubmit,
    handleClose,
  } = useAddNetworkModal(show, onSubmit, onHide);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Thêm Network mới</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>PUB-ID</Form.Label>
                <Form.Control
                  type="text"
                  name="pubId"
                  value={formData.pubId}
                  onChange={handleChange}
                  placeholder="pub-1234567890123456"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Profile AdSense ID <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="profileAdsenseId"
                  value={formData.profileAdsenseId}
                  onChange={handleChange}
                  placeholder="pub-1234567890123456"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>
                  Nhân viên phụ trách <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="employment"
                  value={formData.employment}
                  onChange={handleChange}
                  disabled={loadingEmployees}
                  required
                >
                  <option value="">
                    {loadingEmployees
                      ? "Đang tải..."
                      : employees.length === 0
                        ? "Không có nhân viên nào"
                        : "-- Chọn nhân viên --"}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.userId} value={emp.userId}>
                      {emp.fullName} - {emp.phoneNumber}
                      {emp.team && ` (${emp.team})`}
                    </option>
                  ))}
                </Form.Select>
                {loadingEmployees && (
                  <Form.Text className="text-muted">
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Đang tải danh sách nhân viên...
                  </Form.Text>
                )}
                {!loadingEmployees && employees.length > 0 && (
                  <Form.Text className="text-success">
                    ✓ Đã tải {employees.length} nhân viên
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="email@gmail.com"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Ẩn" : "Hiện"}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Recovery Email</Form.Label>
                <Form.Control
                  type="email"
                  name="recoveryEmail"
                  value={formData.recoveryEmail}
                  onChange={handleChange}
                  placeholder="recovery@gmail.com"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3 d-flex align-items-center">
              <Form.Group>
                <Form.Check
                  type="checkbox"
                  name="twoFA"
                  label="Bật xác thực 2 yếu tố (2FA)"
                  checked={formData.twoFA}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Ngày tạo Profile AdSense</Form.Label>
                <Form.Control
                  type="date"
                  name="creationDate"
                  value={formData.creationDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Tax Form</Form.Label>
                <Form.Control
                  type="text"
                  name="taxForm"
                  value={formData.taxForm}
                  onChange={handleChange}
                  placeholder="W-8BEN, W-9, etc."
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Vị trí làm việc</Form.Label>
                <Form.Select
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                >
                  <option value="HOME">HOME</option>
                  <option value="OFFICE">OFFICE</option>
                  <option value="OTHER">OTHER</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Linked Channel URL</Form.Label>
                <Form.Control
                  type="url"
                  name="linkedChannelUrl"
                  value={formData.linkedChannelUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/@channelname"
                />
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="STRIKE">STRIKE</option>
                  <option value="DEMONETIZED">DEMONETIZED</option>
                  <option value="DEAD">DEAD</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Ghi chú trạng thái</Form.Label>
                <Form.Select
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                >
                  <option value="PENDING_ACTIVATION">Chờ active</option>
                  <option value="REJECTED">Từ chối</option>
                  <option value="PENDING_IDENTITY_VERIFICATION">
                    Chờ XMDT
                  </option>
                  <option value="IDENTITY_VERIFICATION_REVIEW">
                    XMDT chờ duyệt
                  </option>
                  <option value="PENDING_32">Chờ 32</option>
                  <option value="PENDING_PIN">Chờ PIN</option>
                  <option value="ACTIVATED">Active</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12} className="mb-3">
              <Form.Group>
                <Form.Label>Ngày kiểm tra (Reminder)</Form.Label>
                <Form.Control
                  type="date"
                  name="reminderDate"
                  value={formData.reminderDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || loadingEmployees}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Đang tạo...
              </>
            ) : (
              "Tạo Network"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddNetworkModal;
