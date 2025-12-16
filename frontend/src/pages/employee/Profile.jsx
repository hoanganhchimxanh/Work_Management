import React, { useState, useEffect } from "react";
import { Container, Row, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import AccountCard from "../../components/employee/profile/AccountCard";
import TeamCard from "../../components/employee/profile/TeamCard";
import TeamDetailModal from "../../components/employee/profile/TeamDetailModal";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  const [showTeamModal, setShowTeamModal] = useState(false);

  const token = localStorage.getItem("token");
  let userId = null;
  let accountId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.userId;
      accountId = decoded.accountId;
    } catch {}
  }

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:9999/user/get-one/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserData(res.data.data);
      console.log(userData);
      setLoading(false);
    } catch (err) {
      setError("Không thể tải thông tin người dùng");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading)
    return (
      <Container className="d-flex justify-content-center py-5">
        <Spinner />
      </Container>
    );

  if (error)
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );

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
          <AccountCard userData={userData} accountId={accountId} />
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
