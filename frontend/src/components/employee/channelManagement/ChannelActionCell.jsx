import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  KeyFill,
  EyeFill,
  XCircleFill,
  ArrowRepeat,
  Trash,
} from "react-bootstrap-icons";

function ChannelActionCell({
  channelId,
  onGrantAuth,
  onCheckAuth,
  onRevokeAuth,
  onSync,
  onDelete,
}) {
  return (
    <div className="d-flex flex-column align-items-center gap-2">
      <div className="d-flex gap-1">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Cấp quyền YouTube</Tooltip>}
        >
          <Button
            variant="success"
            size="sm"
            onClick={() => onGrantAuth(channelId)}
          >
            <KeyFill />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Kiểm tra quyền</Tooltip>}
        >
          <Button
            variant="primary"
            size="sm"
            onClick={() => onCheckAuth(channelId)}
          >
            <EyeFill />
          </Button>
        </OverlayTrigger>
      </div>

      <div className="d-flex gap-1">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Đồng bộ Analytics</Tooltip>}
        >
          <Button variant="info" size="sm" onClick={() => onSync(channelId)}>
            <ArrowRepeat />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>Hủy quyền</Tooltip>}>
          <Button
            variant="warning"
            size="sm"
            onClick={() => onRevokeAuth(channelId)}
          >
            <XCircleFill />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>Xóa kênh</Tooltip>}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(channelId)}
          >
            <Trash />
          </Button>
        </OverlayTrigger>
      </div>
    </div>
  );
}

export default ChannelActionCell;
