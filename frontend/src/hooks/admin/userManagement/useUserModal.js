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
      } else {
        // Create new user (by admin)
        payload.loginEmail = formData.loginEmail || null;

        const token = localStorage.getItem("token");

        await axios.post(
          `${config.backendBase}/user/create-by-admin`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      // Call onSaved after successful operation
      // Red dot and Toast will show up from backend notification
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        }
        if (onHide) {
          onHide();
        }
      }, 500); // Reduced delay since we don't need to show local success message
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
    handleChange,
    handleSubmit,
  };
}

export default useUserModal;
