import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  ProgressBar,
  Button,
} from "react-bootstrap";
import axios from "axios";

function KPITable() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchKPIs = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:9999/kpi/my-kpis", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setKpis(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải KPI!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const calcPercent = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <Container fluid>
      <h1 className="mb-4">Bảng KPI</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>KPI Doanh thu</th>
              <th>KPI Kênh BKT</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {kpis.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  Không có KPI nào được giao
                </td>
              </tr>
            ) : (
              kpis.map((kpi) => {
                // Doanh thu
                const revenuePercent = calcPercent(
                  kpi.currentRevenue,
                  kpi.kpiRevenue
                );

                // Kênh BKT
                const channelPercent = calcPercent(
                  kpi.currentChannels,
                  kpi.kpiChannels
                );

                return (
                  <tr key={kpi._id}>
                    {/* KPI DOANH THU */}
                    <td style={{ width: 250 }}>
                      <div className="fw-bold">{revenuePercent}%</div>
                      <ProgressBar now={revenuePercent} />
                      <div className="small mt-1">
                        {kpi.currentRevenue}/{kpi.kpiRevenue}
                      </div>
                    </td>

                    {/* KPI KÊNH */}
                    <td style={{ width: 250 }}>
                      <div className="fw-bold">{channelPercent}%</div>
                      <ProgressBar variant="info" now={channelPercent} />
                      <div className="small mt-1">
                        {kpi.currentChannels}/{kpi.kpiChannels}
                      </div>
                    </td>

                    {/* Thời gian */}
                    <td>
                      {new Date(kpi.startDate).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(kpi.endDate).toLocaleDateString("vi-VN")}
                    </td>

                    {/* Hành động */}
                    <td>
                      <Button variant="primary" size="sm">
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default KPITable;
