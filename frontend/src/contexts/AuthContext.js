import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        console.log("=== FRONTEND: Loading user from token ===");
        console.log("Payload:", payload);

        setUser({
          accountId: payload.accountId,
          userId: payload.userId,
          role: payload.role,
          isActive: payload.isActive,
          isFirstLogin: payload.isFirstLogin,
        });

        console.log("User set:", {
          accountId: payload.accountId,
          userId: payload.userId,
          role: payload.role,
        });
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:9999/account/login", {
        email,
        password,
      });

      const { token } = res.data;

      console.log("=== FRONTEND: Login successful ===");
      console.log("Token received");

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const payload = JSON.parse(atob(token.split(".")[1]));

      console.log("Token payload:", payload);

      const userData = {
        accountId: payload.accountId,
        userId: payload.userId,
        role: payload.role,
        isActive: payload.isActive,
        isFirstLogin: payload.isFirstLogin,
      };

      setUser(userData);

      console.log("User data set:", userData);

      if (payload.isFirstLogin) {
        console.log("First login detected, redirecting to change password");
        navigate(`/change-password/${payload.accountId}`);
      } else {
        redirectByRole(payload.role);
      }
    } catch (err) {
      console.error("Login error:", err);
      throw err.response?.data?.message || "Đăng nhập thất bại";
    }
  };

  const redirectByRole = (role) => {
    const roleUpper = role?.toUpperCase();

    console.log("Redirecting by role:", roleUpper);

    if (roleUpper === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (roleUpper === "ACCOUNTANT") {
      navigate("/accountant/page");
    } else if (roleUpper === "EMPLOYEE") {
      navigate("/employee/profile");
    } else {
      navigate("/unauthorized");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
