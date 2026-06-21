import { useEffect, useState, useCallback } from "react";
import { NotificationService } from "../services/notificationService";
import type { Notification } from "../types/notification";

export function useNotification() {
  const [NotificationList, setList] = useState<Notification[]>([]);

  // Keep a stable callback for manual refreshes if needed
  const getNotificationList = useCallback(async () => {
    try {
      const data = await NotificationService.getNotification();
      setList(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  // Fetch notifications safely on mount using an active flag to prevent state updates if unmounted
  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      try {
        const data = await NotificationService.getNotification();
        if (active) {
          setList(data);
        }
      } catch (error) {
        console.error("Error fetching notifications on mount:", error);
      }
    };

    fetchNotifications();

    return () => {
      active = false;
    };
  }, []);

  // State modification actions defined inside the hook
  const handleRead = useCallback((id: string) => {
    setList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
  }, []);

  const handleReadAll = useCallback(() => {
    setList((prev) =>
      prev.map((item) => ({
        ...item,
        isRead: true,
      }))
    );
  }, []);

  return {
    NotificationList,
    getNotificationList,
    handleRead,
    handleReadAll,
  };
}
