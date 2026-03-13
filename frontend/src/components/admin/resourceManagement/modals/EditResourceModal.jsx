import React from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import useEditResourceModal from "../../../../hooks/admin/resourceManagement/useEditResourceModal";

function EditResourceModal({
  show,
  onHide,
  onUpdate,
  resource,
  users,
  channels,
}) {
  const {
    formData,
    errors,
    changePassword,
    setChangePassword,
    handleChange,
    handleSubmit,
    handleClose,
  } = useEditResourceModal(resource, onUpdate, onHide);

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa Resource</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Đổi mật khẩu"
              checked={changePassword}
              onChange={(e) => setChangePassword(e.target.checked)}
            />
          </Form.Group>

          {changePassword && (
            <Form.Group className="mb-3">
              <Form.Label>
                Mật khẩu mới <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="defaultPassword"
                value={formData.defaultPassword}
                onChange={handleChange}
                isInvalid={!!errors.defaultPassword}
                placeholder="Nhập mật khẩu mới"
              />
              <Form.Control.Feedback type="invalid">
                {errors.defaultPassword}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              Recovery Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              name="recoveryEmail"
              value={formData.recoveryEmail}
              onChange={handleChange}
              isInvalid={!!errors.recoveryEmail}
            />
            <Form.Control.Feedback type="invalid">
              {errors.recoveryEmail}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="AVAILABLE">Khả dụng</option>
              <option value="ASSIGNED">Đang sử dụng</option>
              <option value="DISABLED">Vô hiệu hóa</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gán cho nhân viên</Form.Label>
            <Form.Control
              type="text"
              value={
                resource?.assignedUser
                  ? `${resource.assignedUser.fullName} (${resource.assignedUser.phoneNumber})`
                  : "Chưa gán"
              }
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gán cho kênh</Form.Label>
            <Form.Select
              name="assignedChannel"
              value={formData.assignedChannel}
              onChange={handleChange}
            >
              <option value="">-- Chọn kênh --</option>
              {channels?.map((channel) => (
                <option key={channel._id} value={channel._id}>
                  {channel.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="note"
              value={formData.note}
              onChange={handleChange}
            />
          </Form.Group>

          {resource?.status === "ASSIGNED" && (
            <Alert variant="warning">
              <small>
                Resource này đang được gán. Thay đổi trạng thái có thể ảnh hưởng
                đến việc sử dụng.
              </small>
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Cập nhật
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EditResourceModal;
