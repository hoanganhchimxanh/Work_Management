import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import config from "../configs/api";

/**
 * Custom hook for Bug Report logic
 * @returns {Object} { bugType, setBugType, description, setDescription, pageUrl, setPageUrl, image, setImage, submitting, success, error, countdown, handleSubmit, redirectByRole }
 */
function useBugReport() {
    const navigate = useNavigate();

    const [bugType, setBugType] = useState("");
    const [description, setDescription] = useState("");
    const [pageUrl, setPageUrl] = useState("");
    const [image, setImage] = useState(null);

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [countdown, setCountdown] = useState(5);

    const redirectByRole = () => {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        try {
            const { role } = jwtDecode(token);

            if (role === "ADMIN") navigate("/admin/dashboard");
            else if (role === "ACCOUNTANT") navigate("/accountant/dashboard");
            else if (role === "EMPLOYEE") navigate("/employee/dashboard");
            else navigate("/login");
        } catch {
            navigate("/login");
        }
    };

    useEffect(() => {
        if (!success) return;

        if (countdown === 0) {
            redirectByRole();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [success, countdown]);

    const handleSubmit = async () => {
        if (!bugType || !description) {
            setError("Vui lòng chọn loại lỗi và nhập mô tả.");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const formData = new FormData();
            formData.append("bugType", bugType);
            formData.append("description", description);
            formData.append("page", pageUrl);
            if (image) formData.append("image", image);

            await axios.post(`${config.backendBase}/bug-report`, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError("Không thể gửi báo cáo. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return {
        bugType,
        setBugType,
        description,
        setDescription,
        pageUrl,
        setPageUrl,
        image,
        setImage,
        submitting,
        success,
        error,
        setError,
        countdown,
        handleSubmit,
        redirectByRole,
    };
}

export default useBugReport;
