import { useEffect, useState, useCallback } from "react";
import {
    fetchNotifications,
    markNotificationRead,
    markAllRead,
    deleteNotification,
} from "../services/notification.service";
import { socket } from "../socket";

const PAGE_SIZE = 10;

/**
 * Custom hook to manage notifications logic
 * @returns {Object} { notifications, loading, page, totalPages, showDeleteModal, selectedNoti, actions }
 */
function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedNoti, setSelectedNoti] = useState(null);

    /* =======================
     * Load notifications (REST)
     * ======================= */
    const loadNotifications = useCallback(
        async (currentPage = page) => {
            try {
                setLoading(true);
                const res = await fetchNotifications(currentPage, PAGE_SIZE);

                setNotifications(res.data.data || []);
                setTotalPages(res.data.pagination?.totalPages || 1);
            } catch (err) {
                console.error("Load notifications failed", err);
            } finally {
                setLoading(false);
            }
        },
        [page],
    );

    useEffect(() => {
        loadNotifications(page);
    }, [page, loadNotifications]);

    /* =======================
     * Socket realtime
     * ======================= */
    useEffect(() => {
        const handler = (noti) => {
            if (page !== 1) return;

            setNotifications((prev) => {
                if (prev.some((n) => n._id === noti._id)) return prev;
                return [noti, ...prev].slice(0, PAGE_SIZE);
            });
        };

        socket.on("notification:new", handler);

        return () => {
            socket.off("notification:new", handler);
        };
    }, [page]);

    /* =======================
     * Actions
     * ======================= */
    const handleMarkAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
            );
        } catch (err) {
            console.error("Mark read failed", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err) {
            console.error("Mark all read failed", err);
        }
    };

    const openDeleteModal = (noti, e) => {
        if (e) e.stopPropagation();
        setSelectedNoti(noti);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setSelectedNoti(null);
    };

    const handleDelete = async () => {
        if (!selectedNoti) return;

        try {
            await deleteNotification(selectedNoti._id);

            setNotifications((prev) =>
                prev.filter((n) => n._id !== selectedNoti._id),
            );

            closeDeleteModal();
        } catch (err) {
            console.error("Delete notification failed", err);
        }
    };

    // Helper handling mouse up to mark as read
    const handleMouseUpNotification = async (noti) => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) return;

        if (!noti.isRead) {
            await handleMarkAsRead(noti._id);
        }
    };

    return {
        notifications,
        loading,
        page,
        setPage,
        totalPages,
        showDeleteModal,
        selectedNoti,
        loadNotifications,
        handleMarkAsRead,
        handleMarkAllRead,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,
        handleMouseUpNotification,
    };
}

export default useNotifications;
