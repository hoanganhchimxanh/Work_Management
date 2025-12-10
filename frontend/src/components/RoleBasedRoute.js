import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ children, allowedRoles }) => {
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
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toUpperCase();
  const normalizedAllowedRoles = allowedRoles.map((role) => role.toUpperCase());

  if (!normalizedAllowedRoles.includes(userRole)) {
    console.log(
      "Access denied - user.role:",
      userRole,
      "allowed:",
      normalizedAllowedRoles
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RoleBasedRoute;
