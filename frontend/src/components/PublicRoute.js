import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
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

  // Nếu đã login
  if (user && user.role) {
    // Kiểm tra nếu là lần đăng nhập đầu tiên
    if (user.isFirstLogin) {
      return <Navigate to={`/change-password/${user.accountId}`} replace />;
    }

    // Redirect về trang phù hợp với role
    const roleUpper = user.role.toUpperCase();

    if (roleUpper === "ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (roleUpper === "ACCOUNTANT") {
      return <Navigate to="/accountant/page" replace />;
    } else if (roleUpper === "EMPLOYEE") {
      return <Navigate to="/employee/profile" replace />;
    }
  }

  return children;
};

export default PublicRoute;
