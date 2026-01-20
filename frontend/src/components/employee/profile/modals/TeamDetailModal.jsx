import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Spinner,
  Alert,
  ListGroup,
  Badge,
} from "react-bootstrap";
import axios from "axios";

import config from "../../../../configs/api";

function TeamDetailModal({ show, onHide, teamId, token }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!show) return;

    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `${config.backendBase}/team/get-team/${teamId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setTeam(res.data.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin nhóm");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Thông tin nhóm chi tiết</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-3">
            <Spinner />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
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
            <p className="mb-3">
              <strong>{team.leader.fullName}</strong> – {team.leader.role}
            </p>

            <h6>👥 Thành viên ({team.memberCount})</h6>
            <ListGroup>
              {team.members.map((m) => (
                <ListGroup.Item key={m._id}>
                  <strong>{m.fullName}</strong>
                  <div className="text-muted small">{m.role}</div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
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
