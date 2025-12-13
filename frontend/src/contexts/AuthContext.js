// AuthContext.js
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
        setUser({
          accountId: payload.accountId,
          userId: payload.userId,
          role: payload.role,
          email: payload.email,
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

      const { token, data } = res.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const userData = {
        accountId: data.accountId,
        userId: data.user?.userId,
        role: data.user?.role,
        email: data.email,
        fullName: data.user?.fullName,
        isFirstLogin: data.user?.isFirstLogin,
      };

      setUser(userData);

      if (data.user?.isFirstLogin) {
        navigate(`/change-password/${data.accountId}`);
      } else {
        redirectByRole(data.user?.role);
      }
    } catch (err) {
      throw err.response?.data?.message || "Đăng nhập thất bại";
    }
  };

  const redirectByRole = (role) => {
    const roleUpper = role?.toUpperCase();

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
