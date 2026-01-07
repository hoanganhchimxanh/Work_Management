import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

/**
 * Custom hook để quản lý authentication
 * @returns {Object} { token, userId, role, isAuthenticated, getAuthConfig }
 */
function useAuth() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        setToken(storedToken);
        setUserId(decoded.userId);
        setRole(decoded.role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
  }, []);

  /**
   * Trả về axios config với Authorization header
   */
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    if (!token) return {};

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  /**
   * Trả về token string (cho fetch API)
   */
  const getAuthToken = () => token || "";

  /**
   * Logout
   */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserId(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  return {
    token,
    userId,
    role,
    isAuthenticated,
    getAuthConfig,
    getAuthToken,
    logout,
  };
}

export default useAuth;
