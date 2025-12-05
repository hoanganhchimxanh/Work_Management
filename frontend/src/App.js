import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/admin/Dashboard";
import EmployeePage from "./pages/employee/EmployeePage";
import AccountantPage from "./pages/accountant/AccountantPage";

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
          path="/admin/dashboard"
          element={
            <RoleBasedRoute allowedRoles={["ADMIN"]}>
              <Dashboard />
            </RoleBasedRoute>
          }
        />
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
