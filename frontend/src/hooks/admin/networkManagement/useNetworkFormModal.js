import { useState, useEffect } from "react";

function useNetworkFormModal(network, show, onSave) {
  const [formData, setFormData] = useState({
    assignedUser: "",
    profileAdsenseId: "",
    emailAddress: "",
    recoveryEmail: "",
    creationDate: "",
    taxName: "",
    location: "OFFICE",
    linkedChannelUrl: "",
    emailChannel: "",
    channelJoinDate: "",
    country: "VN",
    status: "ACTIVE",
    reminderDate: "",
    note: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (network) {
      setFormData({
        assignedUser: network.assignedUser?._id || "",
        profileAdsenseId: network.profileAdsenseId || "",
        emailAddress: network.emailAddress || "",
        recoveryEmail: network.recoveryEmail || "",
        creationDate: network.creationDate
          ? network.creationDate.split("T")[0]
          : "",
        taxName: network.taxName || "",
        location: network.location || "OFFICE",
        linkedChannelUrl: network.linkedChannelUrl || "",
        emailChannel: network.emailChannel || "",
        channelJoinDate: network.channelJoinDate
          ? network.channelJoinDate.split("T")[0]
          : "",
        country: network.country || "VN",
        status: network.status || "ACTIVE",
        reminderDate: network.reminderDate
          ? network.reminderDate.split("T")[0]
          : "",
        note: network.note || "",
      });
    } else {
      setFormData({
        assignedUser: "",
        profileAdsenseId: "",
        emailAddress: "",
        recoveryEmail: "",
        creationDate: "",
        taxName: "",
        location: "OFFICE",
        linkedChannelUrl: "",
        emailChannel: "",
        channelJoinDate: "",
        country: "VN",
        status: "ACTIVE",
        reminderDate: "",
        note: "",
      });
    }
    setErrors({});
  }, [network, show]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.assignedUser)
      newErrors.assignedUser = "Vui lòng chọn nhân viên";
    if (!formData.profileAdsenseId)
      newErrors.profileAdsenseId = "Vui lòng nhập Profile AdSense ID";
    if (!formData.emailAddress) newErrors.emailAddress = "Vui lòng nhập email";
    if (!formData.creationDate)
      newErrors.creationDate = "Vui lòng chọn ngày tạo";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  };
}

export default useNetworkFormModal;
