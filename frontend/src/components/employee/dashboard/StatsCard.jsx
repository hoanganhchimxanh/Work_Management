import React from "react";
import { Card } from "react-bootstrap";

function StatsCard({ title, value, icon: Icon, bgColor, iconColor }) {
  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="text-muted mb-1">{title}</p>
            <h3 className="fw-bold mb-0">{value}</h3>
          </div>
          <div
            className={`bg-${bgColor} bg-opacity-10 p-3 rounded-3`}
            style={{ color: iconColor }}
          >
            <Icon size={24} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default StatsCard;
