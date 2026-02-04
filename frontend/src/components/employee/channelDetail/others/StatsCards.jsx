import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import {
  CurrencyDollar,
  ArrowUp,
  ArrowDown,
  People,
} from "react-bootstrap-icons";

function StatsCards({ totals }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const stats = [
    {
      title: "Tổng doanh thu ước tính",
      value: formatCurrency(totals.totalRevenue || 0),
      icon: CurrencyDollar,
      color: "success",
    },
    {
      title: "Subs tăng",
      value: `+${formatNumber(totals.totalSubsGained || 0)}`,
      icon: ArrowUp,
      color: "primary",
    },
    {
      title: "Subs giảm",
      value: `-${formatNumber(totals.totalSubsLost || 0)}`,
      icon: ArrowDown,
      color: "danger",
    },
    {
      title: "Subs thực tế",
      value: `${totals.netSubsChange >= 0 ? "+" : ""}${formatNumber(
        totals.netSubsChange || 0,
      )}`,
      icon: People,
      color: totals.netSubsChange >= 0 ? "success" : "danger",
    },
  ];

  return (
    <Row className="mt-4">
      {stats.map((stat, index) => (
        <Col key={index} xs={12} sm={6} lg={3} className="mb-3">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">{stat.title}</p>
                  <h4 className={`mb-0 text-${stat.color}`}>{stat.value}</h4>
                </div>
                <stat.icon size={24} className={`text-${stat.color}`} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default StatsCards;
