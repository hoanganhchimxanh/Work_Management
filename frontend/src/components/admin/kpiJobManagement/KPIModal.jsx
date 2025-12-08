import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, InputGroup } from "react-bootstrap";
import axios from "axios";

function KPIModal({ show, onHide, kpi, users, teams, onSaved }) {
  const [formData, setFormData] = useState({
    user: "",
    team: "",
    revenueTarget: 0,
    bktTarget: 0,
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignType, setAssignType] = useState("user"); // 'user' or 'team'

  useEffect(() => {
    if (kpi) {
      setFormData({
        user: kpi.user?._id || "",
        team: kpi.team?._id || "",
        revenueTarget: kpi.revenueTarget || 0,
        bktTarget: kpi.bktTarget || 0,
        startDate: kpi.startDate ? kpi.startDate.split("T")[0] : "",
        endDate: kpi.endDate ? kpi.endDate.split("T")[0] : "",
      });
      setAssignType(kpi.user ? "user" : "team");
    } else {
      setFormData({
        user: "",
        team: "",
        revenueTarget: 0,
        bktTarget: 0,
        startDate: "",
        endDate: "",
      });
      setAssignType("user");
    }
    setError(null);
  }, [kpi, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.startDate || !formData.endDate) {
      setError("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }

    if (assignType === "user" && !formData.user) {
      setError("Vui lòng chọn nhân viên");
      return;
    }

    if (assignType === "team" && !formData.team) {
      setError("Vui lòng chọn team");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        user: assignType === "user" ? formData.user : null,
        team: assignType === "team" ? formData.team : null,
        revenueTarget: Number(formData.revenueTarget),
        bktTarget: Number(formData.bktTarget),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      if (kpi) {
        // Update KPI
        await axios.put(`http://localhost:9999/kpi/update/${kpi._id}`, payload);
      } else {
        // Create new KPI
        await axios.post("http://localhost:9999/kpi/create-new", payload);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = users?.filter((u) => u.status === "ACTIVE") || [];
  const activeTeams = teams?.filter((t) => t.status === "AVAILABLE") || [];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{kpi ? "Chỉnh sửa KPI" : "Tạo KPI mới"}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Gán cho *</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Nhân viên"
                name="assignType"
                value="user"
                checked={assignType === "user"}
                onChange={(e) => setAssignType(e.target.value)}
                disabled={!!kpi}
              />
              <Form.Check
                inline
                type="radio"
                label="Team"
                name="assignType"
                value="team"
                checked={assignType === "team"}
                onChange={(e) => setAssignType(e.target.value)}
                disabled={!!kpi}
              />
            </div>
            {kpi && (
              <Form.Text className="text-muted">
                Không thể thay đổi đối tượng được gán sau khi tạo
              </Form.Text>
            )}
          </Form.Group>

          {assignType === "user" && (
            <Form.Group className="mb-3">
              <Form.Label>Chọn nhân viên *</Form.Label>
              <Form.Select
                name="user"
                value={formData.user}
                onChange={handleChange}
                disabled={!!kpi}
                required
              >
                <option value="">-- Chọn nhân viên --</option>
                {activeUsers.map((user) => (
                  <option
                    key={user._id || user.userId}
                    value={user._id || user.userId}
                  >
                    {user.fullName} - {user.role}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          {assignType === "team" && (
            <Form.Group className="mb-3">
              <Form.Label>Chọn team *</Form.Label>
              <Form.Select
                name="team"
                value={formData.team}
                onChange={handleChange}
                disabled={!!kpi}
                required
              >
                <option value="">-- Chọn team --</option>
                {activeTeams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>KPI Doanh thu (VNĐ)</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                name="revenueTarget"
                value={formData.revenueTarget}
                onChange={handleChange}
                min="0"
                step="1000"
              />
              <InputGroup.Text>VNĐ</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>KPI Kênh BKT</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                name="bktTarget"
                value={formData.bktTarget}
                onChange={handleChange}
                min="0"
              />
              <InputGroup.Text>kênh</InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày bắt đầu *</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ngày kết thúc *</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : kpi ? "Cập nhật" : "Tạo mới"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default KPIModal;
