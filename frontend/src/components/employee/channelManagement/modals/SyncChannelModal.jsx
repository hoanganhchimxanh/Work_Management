// src/components/employee/channelManagement/modals/SyncChannelModal.jsx
import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

// Cấu hình tiếng Việt cho lịch
import { registerLocale } from "react-datepicker";
import vi from "date-fns/locale/vi";
registerLocale("vi", vi);

function SyncChannelModal({ show, onHide, onSubmit }) {
  // Mặc định: Ngày bắt đầu là đầu tháng, ngày kết thúc là hôm nay
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      setError("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc!");
      return;
    }

    if (startDate > endDate) {
      setError("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
      return;
    }

    // Format về chuỗi dd-MM-yyyy để gửi cho API (giống logic cũ của bạn)
    const formattedStart = format(startDate, "dd-MM-yyyy");
    const formattedEnd = format(endDate, "dd-MM-yyyy");

    onSubmit(formattedStart, formattedEnd);
  };

  const handleClose = () => {
    setError("");
    // Reset lại ngày nếu cần, hoặc giữ nguyên trạng thái cũ
    setStartDate(new Date());
    setEndDate(new Date());
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Đồng bộ dữ liệu kênh</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label style={{ paddingRight: "20px" }}>Từ ngày:</Form.Label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              locale="vi"
              maxDate={new Date()} // Không chọn ngày tương lai
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{ paddingRight: "10px" }}>Đến ngày:</Form.Label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd-MM-yyyy"
              className="form-control"
              locale="vi"
              maxDate={new Date()}
              minDate={startDate} // Không cho chọn nhỏ hơn ngày bắt đầu
              peekNextMonth
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
            />
          </Form.Group>
        </Form>
        <div className="text-muted small">
          Dữ liệu sẽ được đồng bộ từ YouTube Analytics theo khoảng thời gian đã
          chọn.
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Bắt đầu đồng bộ
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SyncChannelModal;
