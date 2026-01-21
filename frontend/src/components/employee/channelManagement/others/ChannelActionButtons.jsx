import React from "react";
import { Button } from "react-bootstrap";

function ChannelActionButtons({ onAddNew, onSyncAll }) {
  return (
    <div className="mb-3">
      <Button variant="success" onClick={onAddNew} className="me-2">
        + Thêm kênh mới
      </Button>
      {onSyncAll && (
        <Button variant="info" onClick={onSyncAll}>
          🔄 Đồng bộ tất cả
        </Button>
      )}
    </div>
  );
}

export default ChannelActionButtons;
