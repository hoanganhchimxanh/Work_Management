import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

function useUserModal(user, show, onSaved, onHide) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    facebookLink: "",
    bankInfo: {
      bankName: "",
      accountNumber: "",
    },
    role: "EMPLOYEE",
    team: "",
    joinDate: "",
    responsibilities: "",
    note: "",
    loginEmail: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phoneNumber: user.phoneNumber || "",
        facebookLink: user.facebookLink || "",
        bankInfo: {
          bankName: user.bankInfo?.bankName || "",
          accountNumber: user.bankInfo?.accountNumber || "",
        },
        role: user.role || "EMPLOYEE",
        team: user.team?._id || user.team || "",
        joinDate: user.joinDate ? user.joinDate.split("T")[0] : "",
        responsibilities: user.responsibilities || "",
        note: user.note || "",
        loginEmail: user.loginEmail || "",
      });
    } else {
      setFormData({
        fullName: "",
        phoneNumber: "",
        facebookLink: "",
        bankInfo: {
          bankName: "",
          accountNumber: "",
        },
        role: "EMPLOYEE",
        team: "",
        joinDate: new Date().toISOString().split("T")[0],
        responsibilities: "",
        note: "",
        loginEmail: "",
      });
    }
    setError(null);
    setSuccessMessage(null);
  }, [user, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("bankInfo.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        bankInfo: {
          ...prev.bankInfo,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.fullName || !formData.phoneNumber) {
      setError(
        "Vui lòng điền đầy đủ thông tin bắt buộc (Họ tên và Số điện thoại)",
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        facebookLink: formData.facebookLink || null,
        bankInfo: {
          bankName: formData.bankInfo.bankName || null,
          accountNumber: formData.bankInfo.accountNumber || null,
        },
        role: formData.role,
        team: formData.team || null,
        joinDate: formData.joinDate || null,
        responsibilities: formData.responsibilities || null,
        note: formData.note || null,
      };

      if (user) {
        // Update existing user
        await axios.put(
          `${config.backendBase}/user/update/${user.userId}`,
          payload,
        );
        setSuccessMessage("Cập nhật người dùng thành công!");
      } else {
        // Create new user (by admin)
        payload.loginEmail = formData.loginEmail || null;

        const token = localStorage.getItem("token");

        const response = await axios.post(
          `${config.backendBase}/user/create-by-admin`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.data.data?.account) {
          setSuccessMessage(
            `Tạo người dùng thành công!\nEmail đăng nhập: ${response.data.data.account.email}\nMật khẩu tạm: ${response.data.data.account.tempPassword}`,
          );
        } else {
          setSuccessMessage("Tạo người dùng thành công!");
        }
      }

      // Call onSaved after successful operation
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        }
        if (onHide) {
          onHide();
        }
      }, 2000);
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    successMessage,
    handleChange,
    handleSubmit,
  };
}

export default useUserModal;
