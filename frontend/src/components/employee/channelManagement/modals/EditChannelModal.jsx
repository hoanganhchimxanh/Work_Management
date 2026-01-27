import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

// 1. Import DatePicker và date-fns
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

// Tùy chọn: Import ngôn ngữ tiếng Việt cho lịch nếu muốn
import { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
registerLocale("vi", vi);

function EditChannelModal({ show, onHide, onSubmit, channel }) {
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    status: "ACTIVE",
    isBrandAccount: false,
    isMonetized: false,
    monetizeDate: null, // 2. Để mặc định là null hoặc Date object
  });
  const [error, setError] = useState("");

  // Load channel data when modal opens
  useEffect(() => {
    if (!channel) return;

    setFormData({
      name: channel.name ?? "",
      link: channel.link ?? "",
      status: channel.status ?? "ACTIVE",
      isBrandAccount: Boolean(channel.isBrandAccount),
      isMonetized: Boolean(channel.isMonetized),
      // 3. Chuyển đổi string từ DB thành Date Object để DatePicker hiểu
      monetizeDate: channel.monetizeDate
        ? new Date(channel.monetizeDate)
        : null,
    });
  }, [channel]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 4. Hàm riêng để xử lý khi chọn ngày từ DatePicker
  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      monetizeDate: date,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.link) {
      setError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (!formData.link.includes("youtube.com")) {
      setError("Link kênh không hợp lệ!");
      return;
    }

    // 5. Format lại dữ liệu trước khi gửi đi (chuyển về ISO string hoặc format tùy backend)
    const submitData = {
      ...formData,
      monetizeDate: formData.monetizeDate
        ? formData.monetizeDate.toISOString() // Gửi lên server dạng chuẩn ISO
        : null,
    };

    onSubmit(channel._id, submitData);
  };

  const handleClose = () => {
    setFormData({
      name: "",
      link: "",
      status: "ACTIVE",
      isBrandAccount: false,
      isMonetized: false,
      monetizeDate: null,
    });
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa thông tin kênh</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          {/* ... Các trường Name, Link, Status giữ nguyên ... */}

          <Form.Group className="mb-3" controlId="editChannelName">
            <Form.Label>
              Tên kênh <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editChannelLink">
            <Form.Label>
              Link kênh <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editChannelStatus">
            <Form.Label>Trạng thái</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="HIDDEN">Ẩn</option>
              <option value="LOCKED">Khóa</option>
              <option value="STRIKED">Vi phạm</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="editIsBrandAccount">
            <Form.Check
              type="checkbox"
              name="isBrandAccount"
              label="Đây là Brand Account"
              checked={formData.isBrandAccount}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="editIsMonetized">
            <Form.Check
              type="checkbox"
              name="isMonetized"
              label="Đã bật kiếm tiền (BKT)"
              checked={formData.isMonetized}
              onChange={handleChange}
            />
          </Form.Group>

          {formData.isMonetized && (
            <Form.Group className="mb-3" controlId="editMonetizeDate">
              <Form.Label className="d-block">Ngày bật kiếm tiền</Form.Label>
              {/* 6. Thay thế Form.Control type="date" bằng DatePicker */}
              <DatePicker
                selected={formData.monetizeDate}
                onChange={handleDateChange}
                dateFormat="dd-MM-yyyy"
                className="form-control"
                placeholderText="dd-mm-yyyy"
                locale="vi"
                isClearable
                maxDate={new Date()}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </Form.Group>
          )}

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Cập nhật
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditChannelModal;
