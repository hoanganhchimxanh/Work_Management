import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { Upload, FileEarmark } from "react-bootstrap-icons";

import config from "../../../configs/api";

const SendResourcesModal = ({ show, user, onHide, onSent }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Kiểm tra kích thước file (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File không được vượt quá 10MB!");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Vui lòng chọn file!");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${config.backendBase}/user/send-resources/${user.userId || user._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.success) {
        onSent();
        handleClose();
      } else {
        setError(data.message || "Có lỗi xảy ra!");
      }
    } catch (err) {
      console.error("Error sending resources:", err);
      setError("Không thể gửi tài nguyên: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setSending(false);
    onHide();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <Upload className="me-2" />
          Gửi tài nguyên
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {user && (
            <div className="mb-3 p-3 bg-light rounded">
              <p className="mb-1">
                <strong>Người nhận:</strong> {user.fullName}
              </p>
              <p className="mb-0">
                <strong>Email:</strong> {user.personalEmail}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              Chọn file tài nguyên <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileChange}
              disabled={sending}
              accept="*/*"
            />
            <Form.Text className="text-muted">
              Chấp nhận mọi loại file. Kích thước tối đa: 10MB
            </Form.Text>
          </Form.Group>

          {file && (
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-center">
                <FileEarmark size={32} className="me-3 text-primary" />
                <div>
                  <div>
                    <strong>{file.name}</strong>
                  </div>
                  <small className="text-muted">
                    {formatFileSize(file.size)}
                  </small>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              File sẽ được gửi qua email cá nhân của người dùng dưới dạng đính
              kèm.
            </small>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={sending}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={!file || sending}>
            {sending ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Đang gửi...
              </>
            ) : (
              <>
                <Upload className="me-2" />
                Gửi tài nguyên
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SendResourcesModal;
