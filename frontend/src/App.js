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
import KPIJobManagement from "./pages/admin/KPI_Job_Management";
import NetworkManagement from "./pages/admin/Network_Management";
import ChannelManagement from "./pages/admin/Channel_Management";

// Employee pages
import EmployeeLayout from "./layouts/EmployeeLayout";
import Profile from "./pages/employee/Profile";
import EmployeeChannelManagement from "./pages/employee/Channel_Management";
import EmployeeKPIJobManagement from "./pages/employee/KPI_Job_Management";

// Accountant pages
import AccountantPage from "./pages/accountant/AccountantPage";

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
        <Route
          path="/change-password/:accountId"
          element={<ChangePassword />}
        />
      </Route>

      {/* PROTECTED ROUTES - Chỉ cho người đã đăng nhập */}
      <Route element={<ProtectedRoute />}>
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
          <Route path="kpi_jobs" element={<KPIJobManagement />} />
          <Route path="networks" element={<NetworkManagement />} />
          <Route path="channels" element={<ChannelManagement />} />
        </Route>

        {/* Accountant pages */}
        <Route
          path="/accountant/page"
          element={
            <RoleBasedRoute allowedRoles={["ACCOUNTANT"]}>
              <AccountantPage />
            </RoleBasedRoute>
          }
        />

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
          <Route path="kpi_jobs" element={<EmployeeKPIJobManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
