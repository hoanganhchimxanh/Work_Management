import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <div>Đang tải...</div>
      </div>
    );
  }

  // Nếu chưa đăng nhập -> redirect về login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã đăng nhập
  if (user && user.role) {
    // Kiểm tra nếu là lần đăng nhập đầu tiên -> bắt buộc đổi mật khẩu
    if (user.isFirstLogin) {
      return <Navigate to={`/change-password/${user.accountId}`} replace />;
    }

    return <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
