import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
// Public pages
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import AdminLayout from "./layouts/AdminLayout";

// Employee pages
import EmployeePage from "./pages/employee/EmployeePage";

// Accountant pages
import AccountantPage from "./pages/accountant/AccountantPage";

// Protected route
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/change-password/:accountId" element={<ChangePassword />} />

      {/* PROTECTED */}
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
        </Route>
        <Route
          path="/accountant/page"
          element={
            <RoleBasedRoute allowedRoles={["ACCOUNTANT"]}>
              <AccountantPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/employee/page"
          element={
            <RoleBasedRoute allowedRoles={["EMPLOYEE"]}>
              <EmployeePage />
            </RoleBasedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
