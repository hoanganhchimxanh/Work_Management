import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import Unauthorized from "./pages/Unauthorized";
import Dashboard from "./pages/admin/Dashboard";
import EmployeePage from "./pages/employee/EmployeePage";
import AccountantPage from "./pages/accountant/AccountantPage";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      {/* <Route path="/login" element={<Login />} /> */}
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}

export default App;
