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
import KPITaskManagement from "./pages/admin/KPI_Task_Management";
import NetworkManagement from "./pages/admin/Network_Management";
import ChannelManagement from "./pages/admin/Channel_Management";

// Employee pages
import EmployeeLayout from "./layouts/EmployeeLayout";
import Profile from "./pages/employee/Profile";
import EmployeeChannelManagement from "./pages/employee/Channel_Management";
import ChannelDetail from "./pages/employee/ChannelDetail";
import MyKPITasks from "./pages/employee/MyKPITasks";

// Accountant pages
import AccountantLayout from "./layouts/AccountantLayout";
import AccountantNetworkManagement from "./pages/accountant/Network_Management";

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
          <Route path="kpi_tasks" element={<KPITaskManagement />} />
          <Route path="networks" element={<NetworkManagement />} />
          <Route path="channels" element={<ChannelManagement />} />
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
          <Route path="networks" element={<AccountantNetworkManagement />} />
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
          <Route path="profile" element={<Profile />} />
          <Route path="channels" element={<EmployeeChannelManagement />} />
          <Route path="channels/:channelId" element={<ChannelDetail />} />
          <Route path="my_kpi_tasks" element={<MyKPITasks />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
