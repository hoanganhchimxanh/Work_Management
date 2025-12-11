import React, { useState } from "react";
import { Modal, Button, Table, Alert } from "react-bootstrap";
import * as XLSX from "xlsx";

function UserImportModal({ show, onHide, onSubmit }) {
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
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

    reader.readAsBinaryString(file);
  };

  const handleSubmit = () => {
    if (preview.length === 0) return;

    if (onSubmit) onSubmit(preview); // callback gửi data ra ngoài
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Import người dùng bằng Excel</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          className="form-control mb-3"
          onChange={handleFileUpload}
        />

        {error && <Alert variant="danger">{error}</Alert>}

        {preview.length > 0 && (
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table bordered hover size="sm">
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, index) => (
                  <tr key={index}>
                    {Object.keys(row).map((key) => (
                      <td key={key}>{row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button
          variant="primary"
          disabled={preview.length === 0}
          onClick={handleSubmit}
        >
          Import
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default UserImportModal;
