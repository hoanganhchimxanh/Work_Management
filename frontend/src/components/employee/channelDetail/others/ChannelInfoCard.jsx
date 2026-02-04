import React from "react";
import { Card, Badge } from "react-bootstrap";

function ChannelInfoCard({ channel, network }) {
  if (!channel) return null;

  const getStatusVariant = (status) => {
    const statusMap = {
      ACTIVE: "success",
      HIDDEN: "warning",
      LOCKED: "danger",
      STRIKED: "danger",
    };
    return statusMap[status] || "secondary";
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="mb-2">{channel.channelName}</h2>
            <a
              href={channel.channelLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none d-block mb-2 text-break"
            >
              {channel.channelLink}
            </a>
            <div className="d-flex gap-3">
              <Badge bg={getStatusVariant(channel.channelStatus)}>
                {channel.channelStatus}
              </Badge>
              {network && (
                <span className="text-muted">
                  Network: <strong>{network.profileAdsenseId}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ChannelInfoCard;
