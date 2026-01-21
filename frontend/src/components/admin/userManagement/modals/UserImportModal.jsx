import React, { useState } from "react";
import { Modal, Form, Button, Table, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";
import axios from "axios";

import config from "../../../../configs/api";

function UserImportModal({ show, onHide, onSubmit }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");

  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    setFile(uploaded);
    setError("");
    setPreview([]);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (data.length === 0) {
          setError("File Excel không có dữ liệu!");
          return;
        }

        setPreview(data);
      } catch (err) {
        setError("File Excel không hợp lệ!");
      }
    };

    reader.readAsBinaryString(uploaded);
  };

  const handleSubmit = () => {
    if (!file) return setError("Bạn chưa chọn file Excel!");
    onSubmit(file);
    onHide();
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setError("");
    onHide();
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${config.backendBase}/excel/download-user-template`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user_import_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Không thể tải file template!");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Import User từ Excel</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Chọn file Excel (.xlsx, .xls hoặc .csv)</Form.Label>
          <Form.Control
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
          />
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}

        {preview.length > 0 && (
          <>
            <h5 className="mt-3">Xem trước dữ liệu</h5>
            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #ddd",
              }}
            >
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx}>
                      {Object.keys(row).map((key) => (
                        <td key={key}>{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
        <Button
          variant="outline-success"
          size="sm"
          onClick={handleDownloadTemplate}
        >
          <i className="bi bi-download me-2"></i>
          Tải file template User
        </Button>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Hủy
        </Button>

        <Button variant="primary" onClick={handleSubmit} disabled={!file}>
          Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserImportModal;
