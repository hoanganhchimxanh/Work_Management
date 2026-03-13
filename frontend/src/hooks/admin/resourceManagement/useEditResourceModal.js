import { useState, useEffect } from "react";

function useEditResourceModal(resource, onUpdate, onHide) {
  const [formData, setFormData] = useState({
    email: "",
    defaultPassword: "",
    recoveryEmail: "",
    status: "AVAILABLE",
    assignedUser: "",
    assignedChannel: "",
    note: "",
  });

  const [errors, setErrors] = useState({});
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (resource) {
      setFormData({
        email: resource.email || "",
        defaultPassword: "",
        recoveryEmail: resource.recoveryEmail || "",
        status: resource.status || "AVAILABLE",
        assignedUser: resource.assignedUser?._id || "",
        assignedChannel: resource.assignedChannel?._id || "",
        note: resource.note || "",
      });
      setChangePassword(false);
    }
  }, [resource]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (changePassword) {
      if (!formData.defaultPassword.trim()) {
        newErrors.defaultPassword = "Mật khẩu là bắt buộc";
      } else if (formData.defaultPassword.length < 6) {
        newErrors.defaultPassword = "Mật khẩu phải có ít nhất 6 ký tự";
      }
    }

    if (!formData.recoveryEmail.trim()) {
      newErrors.recoveryEmail = "Recovery Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.recoveryEmail)) {
      newErrors.recoveryEmail = "Recovery Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dataToSubmit = {
      email: formData.email,
      recoveryEmail: formData.recoveryEmail,
      status: formData.status,
      assignedChannel: formData.assignedChannel || null,
      note: formData.note,
    };

    if (changePassword && formData.defaultPassword) {
      dataToSubmit.defaultPassword = formData.defaultPassword;
    }

    onUpdate(resource._id, dataToSubmit);
  };

  const handleClose = () => {
    setFormData({
      email: "",
      defaultPassword: "",
      recoveryEmail: "",
      status: "AVAILABLE",
      assignedUser: "",
      assignedChannel: "",
      note: "",
    });
    setErrors({});
    setChangePassword(false);
    onHide();
  };

  return {
    formData,
    errors,
    changePassword,
    setChangePassword,
    handleChange,
    handleSubmit,
    handleClose,
  };
}

export default useEditResourceModal;
