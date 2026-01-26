import React, { useState } from "react";
import { Container, Row, Spinner, Alert } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";

import AccountCard from "../../components/employee/profile/cards/AccountCard";
import TeamCard from "../../components/employee/profile/cards/TeamCard";
import TeamDetailModal from "../../components/employee/profile/modals/TeamDetailModal";

import useAuth from "../../hooks/useAuth";
import useUserProfile from "../../hooks/employee/profile/useUserProfile";

function Profile() {
  const { token } = useAuth();
  const [showTeamModal, setShowTeamModal] = useState(false);

  // Lấy userId và accountId từ token
  let userId = null;
  let accountId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
      accountId = decoded.accountId;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  // Sử dụng custom hook để lấy user data
  const { userData, loading, error } = useUserProfile(userId, token);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  if (!userData) {
    return (
      <Alert variant="warning" className="m-3">
        Không tìm thấy thông tin người dùng
      </Alert>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <div className="mb-4">
          <h1 className="h2 mb-2">Thông tin cá nhân</h1>
          <p className="text-muted">Xem thông tin tài khoản và nhóm của bạn</p>
        </div>
      </Row>

      <Row>
        <div className="col-lg-7 mb-4">
          <AccountCard
            userData={userData}
            accountId={accountId}
            token={token}
          />
        </div>

        <div className="col-lg-5 mb-4">
          <TeamCard
            userData={userData}
            onOpenDetail={() => setShowTeamModal(true)}
          />
        </div>
      </Row>

      {/* Modal nhóm chi tiết */}
      {userData?.team?._id && (
        <TeamDetailModal
          show={showTeamModal}
          onHide={() => setShowTeamModal(false)}
          teamId={userData.team._id}
          token={token}
        />
      )}
    </Container>
  );
}

export default Profile;
