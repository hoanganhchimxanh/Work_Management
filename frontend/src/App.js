import "./App.css";
import { Routes, Route } from "react-router-dom";
// Public pages
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";
import BugReport from "./pages/BugReport";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";
import Policy from "./pages/Policy";
import TermsOfService from "./pages/TermsOfService";

// Admin pages
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import ResourceManagement from "./pages/admin/ResourceManagement";
import KPITaskManagement from "./pages/admin/KPITaskManagement";
import NetworkManagement from "./pages/admin/NetworkManagement";
import ChannelManagement from "./pages/admin/ChannelManagement";
import AdminNotification from "./pages/admin/NotificationPage";

// Employee pages
import EmployeeLayout from "./layouts/EmployeeLayout";
import Profile from "./pages/employee/Profile";
import EmployeeChannelManagement from "./pages/employee/ChannelManagement";
import ChannelDetail from "./pages/employee/ChannelDetail";
import MyKPITasks from "./pages/employee/MyKPITasks";
import EmployeeNotification from "./pages/employee/NotificationPage";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeResourceManagement from "./pages/employee/ResourceManagement";

// Accountant pages
import AccountantLayout from "./layouts/AccountantLayout";
import AccountantNetworkManagement from "./pages/accountant/NetworkManagement";
import AccountantNotification from "./pages/accountant/NotificationPage";
import AccountantDashboard from "./pages/accountant/AccountantDashboard";
import AccountantEmployeeList from "./pages/accountant/EmployeeList";
import AccountantChannelRevenue from "./pages/accountant/ChannelRevenue";

// Protected route
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="*" element={<NotFound />} />

      {/* PUBLIC ROUTES - Ai cũng truy cập được */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/policies" element={<Policy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Route>

      {/* PROTECTED ROUTES - Chỉ cho người đã đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/bug-report" element={<BugReport />} />

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
          <Route path="employee-list" element={<AccountantEmployeeList />} />
          <Route
            path="channels-revenue/:employeeId"
            element={<AccountantChannelRevenue />}
          />
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
