import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { CheckCircle, XCircle, Archive, Database } from "react-bootstrap-icons";

function ResourceStats({ stats }) {
  const statCards = [
    {
      title: "Tổng số Resources",
      value: stats?.total || 0,
      icon: Database,
      color: "primary",
      bg: "primary",
    },
    {
      title: "Đang sử dụng",
      value: stats?.byStatus?.ASSIGNED || 0,
      icon: CheckCircle,
      color: "success",
      bg: "success",
    },
    {
      title: "Khả dụng",
      value: stats?.byStatus?.AVAILABLE || 0,
      icon: Archive,
      color: "info",
      bg: "info",
    },
    {
      title: "Đã vô hiệu hóa",
      value: stats?.byStatus?.DISABLED || 0,
      icon: XCircle,
      color: "danger",
      bg: "danger",
    },
  ];

  return (
    <Row className="g-3 mb-4">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Col key={index} xs={12} sm={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div
                    className={`rounded-circle p-3 bg-${stat.bg} bg-opacity-10 me-3`}
                  >
                    <IconComponent size={24} className={`text-${stat.color}`} />
                  </div>
                  <div className="flex-grow-1">
                    <p className="text-muted mb-1 small">{stat.title}</p>
                    <h4 className="mb-0 fw-bold">{stat.value}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default ResourceStats;
