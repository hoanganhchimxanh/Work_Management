import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../configs/api";

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
      const res = await axios.post(`${config.backendBase}/account/login`, {
        email,
        password,
      });

      const { token } = res.data;

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

    if (roleUpper === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
    } else if (roleUpper === "ACCOUNTANT") {
      navigate("/accountant/dashboard", { replace: true });
    } else if (roleUpper === "EMPLOYEE") {
      navigate("/employee/dashboard", { replace: true });
    } else {
      navigate("/unauthorized", { replace: true });
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, redirectByRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};
