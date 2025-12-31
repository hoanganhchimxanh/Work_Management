import React from "react";
import { Card, Col, Row, Table, Badge, Alert } from "react-bootstrap";
import {
  ExclamationTriangle,
  CurrencyDollar,
  People,
  Trophy,
  Globe,
} from "react-bootstrap-icons";

const SalarySlipCard = () => {
  // Dữ liệu thu nhập thực tế (có thể thay bằng props/API sau)
  const incomes = [
    {
      id: 1,
      source: "Salmo 23 + 91",
      from: "Nguyễn Văn Nghĩa",
      records: 21,
      type: "TEAM",
      grossUSD: 239.54,
      deductionRate: 27,
      netVND: 295396,
    },
    {
      id: 2,
      source: "Network Alpha",
      from: "US Network",
      records: 14,
      type: "NETWORK",
      grossUSD: 512.2,
      deductionRate: 37,
      netVND: 515860,
    },
    {
      id: 3,
      source: "Bonus Leader",
      from: "MMO Master",
      records: 1,
      type: "BONUS",
      grossUSD: 100,
      deductionRate: 0,
      netVND: 2600000,
    },
  ];

  // Tính toán tổng
  const totalGrossUSD = incomes.reduce((sum, item) => sum + item.grossUSD, 0);
  const totalNetVND = incomes.reduce((sum, item) => sum + item.netVND, 0);
  const violationDeduction = 150000; // Khấu trừ vi phạm nội bộ
  const finalPayableVND = totalNetVND - violationDeduction;

  const exchangeRate = 26000;

  return (
    <Card className="salary-card">
      <Card.Body className="p-4 p-lg-5">
        {/* HEADER */}
        <Row className="align-items-center mb-5">
          <Col lg={8}>
            <h2 className="header-title mb-1">PHIẾU THANH TOÁN THU NHẬP</h2>
            <div className="text-muted fs-5">MMO Master Inc.</div>
            <div className="fw-bold text-success fs-4 mt-2">
              Kỳ thanh toán: Tháng 12/2025
            </div>
          </Col>
          <Col lg={4} className="text-lg-end mt-4 mt-lg-0">
            <div className="employee-badge-container">
              <div className="emp-label">Thành viên</div>
              <div className="emp-name">Hứa Nam</div>
              <div className="emp-role">LEADER</div>
              <div className="emp-id">ID: 63d72b66</div>
            </div>
          </Col>
        </Row>

        <hr className="my-5" style={{ opacity: 0.15 }} />

        {/* TỶ GIÁ & KHẤU TRỪ VI PHẠM */}
        <Row className="mb-5 gy-4">
          <Col md={6}>
            <div className="stats-card p-4">
              <div className="d-flex align-items-center gap-3">
                <CurrencyDollar size={32} className="text-success" />
                <div>
                  <div className="section-label mb-1">TỶ GIÁ ÁP DỤNG</div>
                  <div className="fs-3 fw-bold">26.000 VND/USD</div>
                </div>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <Alert
              variant="danger"
              className="d-flex align-items-center gap-3 mb-0 py-4"
            >
              <ExclamationTriangle size={32} />
              <div>
                <div className="fw-bold fs-5">KHẤU TRỪ VI PHẠM NỘI BỘ</div>
                <div className="fs-3 fw-bold">−150.000 đ</div>
                <small className="opacity-75">
                  2 lần vi phạm (tổng 901 phút muộn)
                </small>
              </div>
            </Alert>
          </Col>
        </Row>

        {/* CHI TIẾT THU NHẬP */}
        <div className="mb-5">
          <div className="section-label mb-4">
            <Trophy className="me-2" />
            CHI TIẾT THU NHẬP THEO NGUỒN
          </div>

          <Table responsive hover className="salary-table align-middle">
            <thead>
              <tr>
                <th>Nguồn thu nhập</th>
                <th>Loại</th>
                <th className="text-end">Gross (USD)</th>
                <th className="text-center">Khấu trừ</th>
                <th className="text-end">Thực lãnh (VND)</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-bold">{item.source}</div>
                    <small className="text-muted">
                      {item.records} bản ghi • Từ: {item.from}
                    </small>
                  </td>
                  <td>
                    {item.type === "TEAM" && (
                      <Badge
                        bg="primary"
                        className="badge-custom badge-team text-white"
                      >
                        <People size={14} className="me-1" /> Thưởng Team
                      </Badge>
                    )}
                    {item.type === "NETWORK" && (
                      <Badge
                        bg="warning"
                        className="badge-custom badge-network text-white"
                      >
                        <Globe size={14} className="me-1" /> Network
                      </Badge>
                    )}
                    {item.type === "BONUS" && (
                      <Badge
                        bg="success"
                        className="badge-custom badge-bonus text-white"
                      >
                        <Trophy size={14} className="me-1" /> Bonus Leader
                      </Badge>
                    )}
                  </td>
                  <td className="text-end text-muted">
                    $
                    {item.grossUSD.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="text-center text-danger fw-bold">
                    −{item.deductionRate}%
                  </td>
                  <td className="text-end currency-green fw-bold">
                    {item.netVND.toLocaleString("vi-VN")} đ
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* TỔNG KẾT THANH TOÁN - NỔI BẬT */}
        <Row className="gy-4">
          <Col md={4}>
            <div className="stats-card p-4 text-center">
              <div className="text-muted small text-uppercase">Tổng Gross</div>
              <div className="fs-3 fw-bold text-primary">
                $
                {totalGrossUSD.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="stats-card p-4 text-center">
              <div className="text-muted small text-uppercase">
                Tổng sau khấu trừ thuế
              </div>
              <div className="fs-3 fw-bold text-success">
                {totalNetVND.toLocaleString("vi-VN")} đ
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="net-pay-section p-4 text-center">
              <div className="net-pay-label">Thực lãnh cuối cùng</div>
              <div className="net-pay-amount">
                {finalPayableVND.toLocaleString("vi-VN")} đ
              </div>
              <small>(Sau khi trừ khấu trừ vi phạm)</small>
            </div>
          </Col>
        </Row>

        {/* GHI CHÚ THUẾ */}
        <div className="mt-5 p-4 bg-light rounded">
          <small className="text-muted">
            <strong>Ghi chú:</strong>
            <br />
            • Thuế Mỹ (30%) + Thuế TNCN Việt Nam (7%) được áp dụng cho nguồn
            Network.
            <br />
            • Ăn chia Network (20%) + Thuế TNCN (7%) áp dụng cho nguồn Team.
            <br />
            • Bonus Leader không chịu khấu trừ thuế.
            <br />• Tất cả thanh toán được chuyển khoản trong vòng 7 ngày làm
            việc sau kỳ.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SalarySlipCard;
