import { useState, useEffect } from "react";
import axios from "axios";
import config from "../../../configs/api";

function useTeamModal(team, show, onSaved) {
  const [formData, setFormData] = useState({
    name: "",
    leader: "",
    members: [],
    status: "AVAILABLE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        leader: team.leader?._id || "",
        members: team.members?.map((m) => m._id) || [],
        status: team.status || "AVAILABLE",
      });
    } else {
      setFormData({
        name: "",
        leader: "",
        members: [],
        status: "AVAILABLE",
      });
    }
    setError(null);
  }, [team, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData((prev) => ({ ...prev, members: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name) {
      setError("Vui lòng nhập tên nhóm");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        leader: formData.leader || null,
      };

      if (team) {
        await axios.put(
          `${config.backendBase}/team/edit-team-info/${team._id}`,
          payload,
        );
      } else {
        await axios.post(`${config.backendBase}/team/create-new`, payload);
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
    handleChange,
    handleMembersChange,
    handleSubmit,
  };
}

export default useTeamModal;
