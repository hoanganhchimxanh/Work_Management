import "./App.css";
import { Routes, Route } from "react-router-dom";
// Public pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";

// Admin pages
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import User_Management from "./pages/admin/User_Management";
import KPI_Job_Management from "./pages/admin/KPI_Job_Management";
import Network_Management from "./pages/admin/Network_Management";
import Channel_Management from "./pages/admin/Channel_Management";

// Employee pages
import EmployeeLayout from "./layouts/EmployeeLayout";
import Profile from "./pages/employee/Profile";
import Employee_Channel_Management from "./pages/employee/Channel_Management";
import Employee_KPI_Job_Management from "./pages/employee/KPI_Job_Management";

// Accountant pages
import AccountantPage from "./pages/accountant/AccountantPage";

// Protected route
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/change-password/:accountId" element={<ChangePassword />} />

      {/* PROTECTED */}

      {/* Admin pages */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin/*"
          element={
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </RoleBasedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<User_Management />} />
          <Route path="kpi_jobs" element={<KPI_Job_Management />} />
          <Route path="networks" element={<Network_Management />} />
          <Route path="channels" element={<Channel_Management />} />
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
          <Route path="profile" element={<User_Management />} />
          <Route path="channels" element={<Employee_Channel_Management />} />
          <Route path="kpi_jobs" element={<Employee_KPI_Job_Management />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
