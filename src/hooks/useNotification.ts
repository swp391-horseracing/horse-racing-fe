import { useEffect, useState, useCallback, useMemo } from "react";
import { NotificationService } from "../services/NotificationService";
import type { Notification } from "../types/notification";
import { useAuthContext } from "../contexts/AuthContext";
import { useRaceSocket } from "./useRaces";

export function useNotification() {
  const { user, token } = useAuthContext();
  const [NotificationList, setList] = useState<Notification[]>([]);

  const getNotificationList = useCallback(async () => {
    try {
      const data = await NotificationService.getNotifications();
      setList(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      try {
        const data = await NotificationService.getNotifications();
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

  const notificationTopic = useMemo(
    () => (user?.id ? [`notification:user:${user.id}`] : null),
    [user]
  );

  useRaceSocket(
    notificationTopic,
    useCallback((type, data) => {
      if (type === "notification:new") {
        setList((prev) => [
          {
            id: data.id ?? String(Date.now()),
            title: data.title ?? "",
            description: data.description ?? "",
            url: data.url ?? "",
            date: data.date ?? new Date().toISOString(),
            isRead: false,
          } as Notification,
          ...prev,
        ]);
      }
    }, []),
    { token, enabled: !!user?.id }
  );

  const handleRead = useCallback((id: string) => {
    setList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
    );
    NotificationService.markAsRead(id).catch(console.error);
  }, []);

  const handleReadAll = useCallback(() => {
    setList((prev) =>
      prev.map((item) => ({
        ...item,
        isRead: true,
      }))
    );
    NotificationService.markAllAsRead().catch(console.error);
  }, []);

  const unreadCount = useMemo(
    () => NotificationList.filter((n) => !n.isRead).length,
    [NotificationList]
  );

  return {
    NotificationList,
    getNotificationList,
    handleRead,
    handleReadAll,
    unreadCount,
  };
}
