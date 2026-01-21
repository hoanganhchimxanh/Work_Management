import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  KeyFill,
  EyeFill,
  XCircleFill,
  ArrowRepeat,
  Trash,
  PencilSquare,
} from "react-bootstrap-icons";

function ChannelActionCell({
  channel,
  onEdit,
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
            onClick={() => onGrantAuth(channel._id)}
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
            onClick={() => onCheckAuth(channel._id)}
          >
            <EyeFill />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>Hủy quyền</Tooltip>}>
          <Button
            variant="warning"
            size="sm"
            onClick={() => onRevokeAuth(channel._id)}
          >
            <XCircleFill />
          </Button>
        </OverlayTrigger>
      </div>

      <div className="d-flex gap-1">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Đồng bộ Analytics</Tooltip>}
        >
          <Button variant="info" size="sm" onClick={() => onSync(channel._id)}>
            <ArrowRepeat />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Chỉnh sửa kênh</Tooltip>}
        >
          <Button variant="secondary" size="sm" onClick={() => onEdit(channel)}>
            <PencilSquare />
          </Button>
        </OverlayTrigger>

        <OverlayTrigger placement="top" overlay={<Tooltip>Xóa kênh</Tooltip>}>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(channel._id)}
          >
            <Trash />
          </Button>
        </OverlayTrigger>
      </div>
    </div>
  );
}

export default ChannelActionCell;
