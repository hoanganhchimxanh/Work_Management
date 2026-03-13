import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

function useKPIModal(kpi, show, onSaved) {
  const [formData, setFormData] = useState({
    user: "",
    team: "",
    revenueTarget: 0,
    bktTarget: 0,
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignType, setAssignType] = useState("user"); // 'user' or 'team'

  useEffect(() => {
    if (kpi) {
      setFormData({
        user: kpi.user?._id || "",
        team: kpi.team?._id || "",
        revenueTarget: kpi.revenueTarget || 0,
        bktTarget: kpi.bktTarget || 0,
        startDate: kpi.startDate ? kpi.startDate.split("T")[0] : "",
        endDate: kpi.endDate ? kpi.endDate.split("T")[0] : "",
      });
      setAssignType(kpi.user ? "user" : "team");
    } else {
      setFormData({
        user: "",
        team: "",
        revenueTarget: 0,
        bktTarget: 0,
        startDate: "",
        endDate: "",
      });
      setAssignType("user");
    }
    setError(null);
  }, [kpi, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.startDate || !formData.endDate) {
      setError("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }

    if (assignType === "user" && !formData.user) {
      setError("Vui lòng chọn nhân viên");
      return;
    }

    if (assignType === "team" && !formData.team) {
      setError("Vui lòng chọn team");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        user: assignType === "user" ? formData.user : null,
        team: assignType === "team" ? formData.team : null,
        revenueTarget: Number(formData.revenueTarget),
        bktTarget: Number(formData.bktTarget),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      if (kpi) {
        await axios.put(`${config.backendBase}/kpi/update/${kpi._id}`, payload);
      } else {
        await axios.post(`${config.backendBase}/kpi/create-new`, payload);
      }

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    assignType,
    setAssignType,
    handleChange,
    handleSubmit,
  };
}

export default useKPIModal;
