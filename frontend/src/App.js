import React, { Suspense, lazy } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { Spinner, Container } from "react-bootstrap";

// Protected route components (Static imports as they are used frequently)
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import PublicRoute from "./components/PublicRoute";

// Loading component
const PageLoader = () => (
  <Container
    fluid
    className="d-flex justify-content-center align-items-center"
    style={{ minHeight: "80vh" }}
  >
    <Spinner animation="border" variant="primary" />
  </Container>
);

// Public pages
const Login = lazy(() => import("./pages/Login"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const BugReport = lazy(() => import("./pages/BugReport"));
const TestPage = lazy(() => import("./pages/TestPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Policy = lazy(() => import("./pages/Policy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// Admin pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ResourceManagement = lazy(() => import("./pages/admin/ResourceManagement"));
const KPITaskManagement = lazy(() => import("./pages/admin/KPITaskManagement"));
const NetworkManagement = lazy(() => import("./pages/admin/NetworkManagement"));
const ChannelManagement = lazy(() => import("./pages/admin/ChannelManagement"));
const AdminNotification = lazy(() => import("./pages/admin/NotificationPage"));

// Employee pages
const EmployeeLayout = lazy(() => import("./layouts/EmployeeLayout"));
const Profile = lazy(() => import("./pages/employee/Profile"));
const EmployeeChannelManagement = lazy(() => import("./pages/employee/ChannelManagement"));
const ChannelDetail = lazy(() => import("./pages/employee/ChannelDetail"));
const MyKPITasks = lazy(() => import("./pages/employee/MyKPITasks"));
const EmployeeNotification = lazy(() => import("./pages/employee/NotificationPage"));
const EmployeeDashboard = lazy(() => import("./pages/employee/EmployeeDashboard"));
const EmployeeResourceManagement = lazy(() => import("./pages/employee/ResourceManagement"));

// Accountant pages
const AccountantLayout = lazy(() => import("./layouts/AccountantLayout"));
const AccountantNetworkManagement = lazy(() => import("./pages/accountant/NetworkManagement"));
const AccountantNotification = lazy(() => import("./pages/accountant/NotificationPage"));
const AccountantDashboard = lazy(() => import("./pages/accountant/AccountantDashboard"));
const AccountantEmployeeList = lazy(() => import("./pages/accountant/EmployeeList"));
const AccountantChannelRevenue = lazy(() => import("./pages/accountant/ChannelRevenue"));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}

export default App;
