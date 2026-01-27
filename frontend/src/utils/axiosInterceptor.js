import axios from "axios";

export const setupAxiosInterceptors = (logout) => {
  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      // Nếu response thành công, trả về bình thường
      return response;
    },
    (error) => {
      // Kiểm tra nếu là lỗi 401 (Unauthorized)
      if (error.response && error.response.status === 401) {
        console.error("Token expired or invalid. Logging out...");

        // Xóa token và logout
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];

        // Gọi hàm logout từ AuthContext
        logout();
      }

      // Reject error để các component khác vẫn có thể handle
      return Promise.reject(error);
    },
  );
};
