import api from "../lib/api";
import type { Notification } from "../types/notification";

export const NotificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/me/notifications");
    return response.data?.data ?? response.data ?? [];
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/me/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/me/notifications/read-all");
  },
};
