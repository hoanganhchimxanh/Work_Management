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
          userId: payload.userId,
          role: payload.role,
          companyEmail: payload.companyEmail,
        });
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (companyEmail, password) => {
    try {
      const res = await axios.post("http://localhost:9999/account/login", {
        companyEmail,
        password,
      });

      const { token, data } = res.data;

      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser({
        userId: data.user?.userId,
        role: data.user?.role,
        companyEmail: data.companyEmail,
        fullName: data.user?.fullName,
        isFirstLogin: data.user?.isFirstLogin,
      });

      if (data.user?.isFirstLogin) {
        navigate(`/change-password/${data.accountId}`);
      } else {
        redirectByRole(data.user?.role?.toUpperCase());
      }
    } catch (err) {
      throw err.response?.data?.message || "Đăng nhập thất bại";
    }
  };

  const redirectByRole = (role) => {
    if (role === "ADMIN") navigate("/admin/dashboard");
    else if (role === "ACCOUNTANT") navigate("/accountant/page");
    else if (role === "EMPLOYEE") navigate("/employee/page");
    else navigate("/unauthorized");
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
