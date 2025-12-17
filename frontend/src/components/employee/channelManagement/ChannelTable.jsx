import React from "react";
import { Table, Badge } from "react-bootstrap";
import ChannelActionCell from "./ChannelActionCell";
import { useNavigate } from "react-router-dom";

function ChannelTable({
  channels,
  onGrantAuth,
  onCheckAuth,
  onRevokeAuth,
  onSync,
  onDelete,
}) {
  const navigate = useNavigate();
  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { variant: "success", text: "Hoạt động" },
      HIDDEN: { variant: "warning", text: "Ẩn" },
      LOCKED: { variant: "danger", text: "Khóa" },
      STRIKED: { variant: "danger", text: "Vi phạm" },
    };

    const config = statusMap[status] || { variant: "secondary", text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  if (channels.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p>Chưa có kênh nào. Hãy thêm kênh mới!</p>
      </div>
    );
  }

  return (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th style={{ width: "3%" }}>STT</th>
          <th style={{ width: "20%" }}>Tên kênh</th>
          <th style={{ width: "25%" }}>Link kênh</th>
          <th style={{ width: "12%" }}>Network</th>
          <th style={{ width: "10%" }}>Trạng thái</th>
          <th style={{ width: "10%" }}>Kênh chính</th>
          <th style={{ width: "10%" }}>Brand Account</th>
          <th style={{ width: "10%" }}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {channels.map((channel, index) => (
          <tr key={channel._id}>
            <td>{index + 1}</td>
            <td>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/employee/channels/${channel._id}`);
                }}
                className="text-decoration-none fw-bold"
              >
                {channel.name}
              </a>
            </td>
            <td>
              <a
                href={channel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                {channel.link}
              </a>
            </td>
            <td>{channel.network?.name || "Chưa gán"}</td>
            <td>{getStatusBadge(channel.status)}</td>
            <td className="text-center">
              {channel.isMainChannel ? "✅" : "❌"}
            </td>
            <td className="text-center">
              {channel.isBrandAccount ? "✅" : "❌"}
            </td>
            <td>
              <ChannelActionCell
                channelId={channel._id}
                onGrantAuth={onGrantAuth}
                onCheckAuth={onCheckAuth}
                onRevokeAuth={onRevokeAuth}
                onSync={onSync}
                onDelete={onDelete}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default ChannelTable;
