import React from "react";
import { Outlet } from "react-router-dom";

const PublicRoute = ({ children }) => {
  return children || <Outlet />;
};

export default PublicRoute;
