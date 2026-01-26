import React from "react";
import {
  Modal,
  Button,
  Spinner,
  Alert,
  ListGroup,
  Badge,
} from "react-bootstrap";

import useTeamDetail from "../../../../hooks/employee/profile/useTeamDetail";

function TeamDetailModal({ show, onHide, teamId, token }) {
  const { team, loading, error } = useTeamDetail(teamId, token, show);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Thông tin nhóm chi tiết</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : team ? (
          <>
            <h5 className="mb-2">{team.name}</h5>
            <p className="text-muted">
              Trạng thái:{" "}
              <Badge bg={team.status === "AVAILABLE" ? "success" : "secondary"}>
                {team.status}
              </Badge>
            </p>

            <hr />

            <h6>Leader</h6>
            {team.leader ? (
              <p className="mb-3">
                <strong>{team.leader.fullName}</strong> — {team.leader.role}
              </p>
            ) : (
              <p className="text-muted mb-3">Chưa có leader</p>
            )}

            <h6>👥 Thành viên ({team.memberCount})</h6>
            {team.members && team.members.length > 0 ? (
              <ListGroup>
                {team.members.map((m) => (
                  <ListGroup.Item key={m._id}>
                    <strong>{m.fullName}</strong>
                    <div className="text-muted small">{m.role}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="info">Chưa có thành viên</Alert>
            )}
          </>
        ) : (
          <Alert variant="warning">Không tìm thấy thông tin nhóm</Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default TeamDetailModal;
