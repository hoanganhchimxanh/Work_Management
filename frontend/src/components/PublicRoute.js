import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading, redirectByRole } = useContext(AuthContext);

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

  if (user) {
    // Nếu là lần đầu đăng nhập
    if (user.isFirstLogin) {
      return <Navigate to={`/change-password/${user.accountId}`} replace />;
    }

    // Chuyển hướng tới trang tùy thuộc vào quyền người dùng
    redirectByRole(user.role);
    return null;
  }

  return children || <Outlet />;
};

export default PublicRoute;
