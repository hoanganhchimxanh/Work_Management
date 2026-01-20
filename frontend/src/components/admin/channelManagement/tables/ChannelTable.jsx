import React, { useState } from "react";
import { Table, Badge, Button } from "react-bootstrap";
import ChannelMonthRevenueModal from "../modals/ChannelMonthRevenueModal";

function ChannelTable({ channels }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);

  const getStatusBadge = (status) => {
    const variants = {
      ACTIVE: "success",
      HIDDEN: "warning",
      LOCKED: "danger",
      STRIKED: "dark",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  const handleOpenModal = (channel) => {
    setSelectedChannel(channel);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChannel(null);
  };

  return (
    <>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên kênh</th>
            <th>Link kênh</th>
            <th>Trạng thái kênh</th>
            <th>Nhân viên</th>
            <th>Network</th>
            <th>Tổng số người đăng ký</th>
            <th>Doanh thu ước tính</th>
          </tr>
        </thead>

        <tbody>
          {channels.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            channels.map((channel, index) => (
              <tr key={channel._id}>
                <td>{index + 1}</td>
                <td>
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none fw-bold"
                    onClick={() => handleOpenModal(channel)}
                  >
                    {channel.name}
                  </Button>
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
                <td>{getStatusBadge(channel.status)}</td>
                <td>{channel.assignedUser?.fullName || "Chưa gán"}</td>
                <td>
                  {channel.network?.profileAdsenseId || "Chưa có network"}
                </td>
                <td>{channel.totalSubscribers.toLocaleString()}</td>
                <td>${channel.totalRevenue.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal doanh thu theo tháng */}
      {selectedChannel && (
        <ChannelMonthRevenueModal
          show={showModal}
          onHide={handleCloseModal}
          channelId={selectedChannel._id}
          channelName={selectedChannel.name}
        />
      )}
    </>
  );
}

export default ChannelTable;
