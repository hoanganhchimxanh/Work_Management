import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

function useAddNetworkModal(show, onSubmit, onHide) {
  const [formData, setFormData] = useState({
    pubId: "",
    employment: "",
    profileAdsenseId: "",
    emailAddress: "",
    password: "",
    recoveryEmail: "",
    twoFA: false,
    creationDate: "",
    taxForm: "",
    location: "OFFICE",
    linkedChannelUrl: "",
    status: "ACTIVE",
    reminderDate: "",
    note: "PENDING_ACTIVATION",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  useEffect(() => {
    if (show) {
      fetchEmployees();
    }
  }, [show]);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Không tìm thấy token xác thực!");
        setLoadingEmployees(false);
        return;
      }

      const response = await axios.get(`${config.backendBase}/user/get-all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          status: "ACTIVE",
        },
      });

      if (response.data.success) {
        setEmployees(response.data.data || []);
      } else {
        setError("Không thể tải danh sách nhân viên!");
      }
    } catch (err) {
      if (err.response) {
        setError(
          `Lỗi server: ${err.response.data?.message || err.response.statusText}`,
        );
      } else if (err.request) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối!");
      } else {
        setError(`Lỗi: ${err.message}`);
      }
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.profileAdsenseId.trim()) {
      setError("Profile AdSense ID là bắt buộc!");
      return;
    }
    if (!formData.employment) {
      setError("Vui lòng chọn nhân viên phụ trách!");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        pubId: formData.pubId || undefined,
        reminderDate: formData.reminderDate || null,
        creationDate: formData.creationDate || null,
      };

      await onSubmit(payload);
      handleClose();
    } catch (err) {
      setError(err.message || "Lỗi khi tạo network!");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setShowPassword(false);
    setFormData({
      pubId: "",
      employment: "",
      profileAdsenseId: "",
      emailAddress: "",
      password: "",
      recoveryEmail: "",
      twoFA: false,
      creationDate: "",
      taxForm: "",
      location: "OFFICE",
      linkedChannelUrl: "",
      status: "ACTIVE",
      reminderDate: "",
      note: "PENDING_ACTIVATION",
    });
    setEmployees([]);
    if (onHide) onHide();
  };

  return {
    formData,
    loading,
    error,
    setError,
    showPassword,
    setShowPassword,
    employees,
    loadingEmployees,
    handleChange,
    handleSubmit,
    handleClose,
  };
}

export default useAddNetworkModal;
