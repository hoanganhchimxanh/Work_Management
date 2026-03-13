import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/accountant/Sidebar";
import GlobalNotificationToast from "../components/common/Notifications/GlobalNotificationToast";

const AccountantLayout = () => {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <GlobalNotificationToast />
      <Sidebar />
      <div className="flex-grow-1 p-4 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AccountantLayout;

