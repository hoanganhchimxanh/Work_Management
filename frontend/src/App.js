import "./App.css";
import { Routes, Route } from "react-router-dom";
// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";

// Admin pages
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/User_Management";
import ResourceManagement from "./pages/admin/Resource_Management";
import KPITaskManagement from "./pages/admin/KPI_Task_Management";
import NetworkManagement from "./pages/admin/Network_Management";
import ChannelManagement from "./pages/admin/Channel_Management";
import AdminNotification from "./pages/admin/Notification_Page";

// Employee pages
import EmployeeLayout from "./layouts/EmployeeLayout";
import Profile from "./pages/employee/Profile";
import EmployeeChannelManagement from "./pages/employee/Channel_Management";
import ChannelDetail from "./pages/employee/ChannelDetail";
import MyKPITasks from "./pages/employee/MyKPITasks";
import EmployeeNotification from "./pages/employee/Notification_Page";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeResourceManagement from "./pages/employee/Resource_Management";

// Accountant pages
import AccountantLayout from "./layouts/AccountantLayout";
import AccountantNetworkManagement from "./pages/accountant/Network_Management";
import AccountantNotification from "./pages/accountant/Notification_Page";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";

// Protected route
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES - Ai cũng truy cập được */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* PROTECTED ROUTES - Chỉ cho người đã đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/change-password/:accountId"
          element={<ChangePassword />}
        />

        {/* Admin pages */}
        <Route
          path="/admin/*"
          element={
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </RoleBasedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="resources" element={<ResourceManagement />} />
          <Route path="kpi_tasks" element={<KPITaskManagement />} />
          <Route path="networks" element={<NetworkManagement />} />
          <Route path="channels" element={<ChannelManagement />} />
          <Route path="notifications" element={<AdminNotification />} />
        </Route>

        {/* Accountant pages */}
        <Route
          path="/accountant/*"
          element={
            <RoleBasedRoute allowedRoles={["ACCOUNTANT"]}>
              <AccountantLayout />
            </RoleBasedRoute>
          }
        >
          <Route path="dashboard" element={<AccountantDashboard />} />
          <Route path="networks" element={<AccountantNetworkManagement />} />
          <Route path="notifications" element={<AccountantNotification />} />
        </Route>

        {/* Employee pages */}
        <Route
          path="/employee/*"
          element={
            <RoleBasedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeeLayout />
            </RoleBasedRoute>
          }
        >
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="channels" element={<EmployeeChannelManagement />} />
          <Route path="channels/:channelId" element={<ChannelDetail />} />
          <Route path="my_kpi_tasks" element={<MyKPITasks />} />
          <Route path="notifications" element={<EmployeeNotification />} />
          <Route path="resources" element={<EmployeeResourceManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
