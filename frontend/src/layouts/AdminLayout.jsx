import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";

const AdminLayout = () => {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />
      <div className="flex-grow-1 p-4 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
