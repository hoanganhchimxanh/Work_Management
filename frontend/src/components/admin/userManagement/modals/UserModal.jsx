import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Row, Col } from "react-bootstrap";
import axios from "axios";

import config from "../../../../configs/api";

function UserModal({ show, onHide, user, teams, onSaved }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    facebookLink: "",
    bankInfo: {
      bankName: "",
      accountNumber: "",
    },
    role: "EMPLOYEE",
    team: "",
    joinDate: "",
    responsibilities: "",
    note: "",
    loginEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        facebookLink: user.facebookLink || "",
        bankInfo: {
          bankName: user.bankInfo?.bankName || "",
          accountNumber: user.bankInfo?.accountNumber || "",
        },
        role: user.role || "EMPLOYEE",
        team: user.team?._id || user.team || "",
        joinDate: user.joinDate ? user.joinDate.split("T")[0] : "",
        responsibilities: user.responsibilities || "",
        note: user.note || "",
        loginEmail: user.loginEmail || "",
      });
    } else {
      setFormData({
        fullName: "",
        phoneNumber: "",
        facebookLink: "",
        bankInfo: {
          bankName: "",
          accountNumber: "",
        },
        role: "EMPLOYEE",
        team: "",
        joinDate: new Date().toISOString().split("T")[0],
        responsibilities: "",
        note: "",
        loginEmail: "",
      });
    }
    setError(null);
    setSuccessMessage(null);
  }, [user, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("bankInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bankInfo: {
          ...prev.bankInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.fullName || !formData.phoneNumber) {
      setError(
        "Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên và Số điện thoại)",
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        facebookLink: formData.facebookLink || null,
        bankInfo: {
          bankName: formData.bankInfo.bankName || null,
          accountNumber: formData.bankInfo.accountNumber || null,
        },
        role: formData.role,
        team: formData.team || null,
        joinDate: formData.joinDate || null,
        responsibilities: formData.responsibilities || null,
        note: formData.note || null,
      };

      if (user) {
        // Update existing user
        const response = await axios.put(
          `${config.backendBase}/user/update/${user.userId}`,
          payload,
        );
        console.log("Update response:", response.data);
        setSuccessMessage("Cập nhật người dùng thành công!");
      } else {
        // Create new user (by admin)
        payload.loginEmail = formData.loginEmail || null;

        const token = localStorage.getItem("token"); // Thêm dòng này

        const response = await axios.post(
          `${config.backendBase}/user/create-by-admin`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Thêm header
            },
          },
        );
        console.log("Create response:", response.data);

        // Hiển thị thông tin tài khoản nếu có
        if (response.data.data?.account) {
          setSuccessMessage(
            `Tạo người dùng thành công!\nEmail đăng nhập: ${response.data.data.account.email}\nMật khẩu tạm: ${response.data.data.account.tempPassword}`,
          );
        } else {
          setSuccessMessage("Tạo người dùng thành công!");
        }
      }

      // Call onSaved after successful operation
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        }
        onHide();
      }, 2000);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      console.error("Error response:", err.response);
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {user ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && (
            <Alert variant="success" style={{ whiteSpace: "pre-line" }}>
              {successMessage}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Họ tên <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Số điện thoại <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="0123456789"
                  required
                  disabled={!!user}
                />
                {user && (
                  <Form.Text className="text-muted">
                    Số điện thoại không thể thay đổi sau khi tạo
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Link Facebook</Form.Label>
                <Form.Control
                  type="url"
                  name="facebookLink"
                  value={formData.facebookLink}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Ngày vào làm</Form.Label>
                <Form.Control
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Vai trò</Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="ACCOUNTANT">ACCOUNTANT</option>
                  <option value="ADMIN">ADMIN</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nhóm</Form.Label>
                <Form.Select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                >
                  <option value="">-- Không thuộc nhóm nào --</option>
                  {teams &&
                    teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Nhiệm vụ/Mảng</Form.Label>
            <Form.Control
              type="text"
              name="responsibilities"
              value={formData.responsibilities}
              onChange={handleChange}
              placeholder="Nhập nhiệm vụ hoặc mảng phụ trách"
            />
          </Form.Group>

          <h6 className="mt-4 mb-3">Thông tin ngân hàng</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tên ngân hàng</Form.Label>
                <Form.Control
                  type="text"
                  name="bankInfo.bankName"
                  value={formData.bankInfo.bankName}
                  onChange={handleChange}
                  placeholder="Vietcombank, VPBank, ..."
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Số tài khoản</Form.Label>
                <Form.Control
                  type="text"
                  name="bankInfo.accountNumber"
                  value={formData.bankInfo.accountNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                />
              </Form.Group>
            </Col>
          </Row>

          {!user && (
            <>
              <h6 className="mt-4 mb-3">Tài khoản đăng nhập (Tùy chọn)</h6>
              <Form.Group className="mb-3">
                <Form.Label>Email đăng nhập</Form.Label>
                <Form.Control
                  type="email"
                  name="loginEmail"
                  value={formData.loginEmail}
                  onChange={handleChange}
                  placeholder="user@example.com"
                />
                <Form.Text className="text-muted">
                  Nếu để trống, có thể tạo tài khoản đăng nhập sau
                </Form.Text>
              </Form.Group>
            </>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Ghi chú</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Ghi chú thêm về nhân viên..."
            />
          </Form.Group>

          {!user && formData.loginEmail && (
            <Alert variant="info">
              <small>
                <strong>Lưu ý:</strong> Hệ thống sẽ tự động tạo mật khẩu tạm
                thời và hiển thị sau khi tạo thành công. Vui lòng ghi nhớ hoặc
                lưu lại để cung cấp cho nhân viên.
              </small>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : user ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default UserModal;
