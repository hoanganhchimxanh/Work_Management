import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

function useTaskModal(task, show, onSaved) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedToUser: "",
    assignedToTeam: "",
    status: "PENDING",
    deadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assignType, setAssignType] = useState("user");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignedToUser: task.assignedToUser?._id || "",
        assignedToTeam: task.assignedToTeam?._id || "",
        status: task.status || "PENDING",
        deadline: task.deadline ? task.deadline.split("T")[0] : "",
      });
      setAssignType(task.assignedToUser ? "user" : "team");
    } else {
      setFormData({
        title: "",
        description: "",
        assignedToUser: "",
        assignedToTeam: "",
        status: "PENDING",
        deadline: "",
      });
      setAssignType("user");
    }
    setError(null);
  }, [task, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title) {
      setError("Vui lòng nhập tiêu đề công việc");
      return;
    }

    if (assignType === "user" && !formData.assignedToUser) {
      setError("Vui lòng chọn nhân viên");
      return;
    }

    if (assignType === "team" && !formData.assignedToTeam) {
      setError("Vui lòng chọn team");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        assignedToUser: assignType === "user" ? formData.assignedToUser : null,
        assignedToTeam: assignType === "team" ? formData.assignedToTeam : null,
        status: formData.status,
        deadline: formData.deadline || null,
      };

      if (task) {
        await axios.put(`${config.backendBase}/task/update/${task._id}`, payload);
      } else {
        await axios.post(`${config.backendBase}/task/create-new`, payload);
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

export default useTaskModal;
