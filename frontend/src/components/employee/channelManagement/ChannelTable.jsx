import React from "react";
import { Table, Badge } from "react-bootstrap";
import ChannelActionCell from "./ChannelActionCell";
import { Link } from "react-router-dom";

function ChannelTable({
  channels,
  onEdit,
  onGrantAuth,
  onCheckAuth,
  onRevokeAuth,
  onSync,
  onDelete,
}) {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
          <th>STT</th>
          <th>Tên kênh</th>
          <th>Link kênh</th>
          <th>Network</th>
          <th>Trạng thái</th>
          <th>Brand Account</th>
          <th>BKT</th>
          <th>Ngày BKT</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {channels.map((channel, index) => (
          <tr key={channel._id}>
            <td>{index + 1}</td>
            <td>
              <Link
                to={`/employee/channels/${channel._id}`}
                className="text-decoration-none fw-bold"
              >
                {channel.name}
              </Link>
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
              {channel.isBrandAccount ? "✅" : "❌"}
            </td>
            <td className="text-center">{channel.isMonetized ? "✅" : "❌"}</td>
            <td className="text-center">{formatDate(channel.monetizeDate)}</td>
            <td>
              <ChannelActionCell
                channelId={channel._id}
                onEdit={onEdit}
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
