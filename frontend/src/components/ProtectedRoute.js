import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

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

  // ✅ QUAN TRỌNG: Cho phép truy cập trang đổi mật khẩu mà không kiểm tra isFirstLogin
  const isChangePasswordRoute =
    location.pathname.startsWith("/change-password/");

  // Nếu đã đăng nhập
  if (user && user.role) {
    // Kiểm tra nếu là lần đăng nhập đầu tiên
    // NHƯNG chỉ redirect nếu KHÔNG PHẢI đang ở trang change-password
    if (user.isFirstLogin && !isChangePasswordRoute) {
      return <Navigate to={`/change-password/${user.accountId}`} replace />;
    }

    return <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
};

export default ProtectedRoute;
