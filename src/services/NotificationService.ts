import type { Notification } from "../types/notification.ts";

const mockList: Notification[] = [
    {
        id: "1",
        title: "New meeting created",
        description:
            "A new team meeting has been scheduled for tomorrow at 9:30 AM. Please review the agenda beforehand and make sure you are prepared to discuss your assigned items.",
        url: "/calendar/event/1",
        date: "2026-05-31T09:15:00Z",
        isRead: false,
    },
    {
        id: "2",
        title: "New message from Minh",
        description:
            "Minh has sent you a new message regarding the project plan for this week. The message includes several important updates that may affect the next steps in your workflow.",
        url: "/messages/minh",
        date: "2026-05-31T08:45:00Z",
        isRead: false,
    },
    {
        id: "3",
        title: "Task deadline approaching",
        description:
            "The task 'Finish dashboard UI' is due by the end of today. You should review the remaining work, complete any unfinished sections, and submit it as soon as possible.",
        url: "/tasks/3",
        date: "2026-05-31T07:30:00Z",
        isRead: false,
    },
    {
        id: "4",
        title: "New comment on your post",
        description:
            "Lan commented on the post you shared in the internal group. The comment includes feedback and a follow-up question, so it may be helpful to reply soon.",
        url: "/posts/24",
        date: "2026-05-30T18:20:00Z",
        isRead: true,
    },
    {
        id: "5",
        title: "Order status updated",
        description:
            "Your order #A1024 has been confirmed and is now being prepared for delivery. You can track the latest status anytime from the order details page.",
        url: "/orders/A1024",
        date: "2026-05-29T14:10:00Z",
        isRead: false,
    },
];

export const NotificationService = {
    getNotification: async (): Promise<Notification[]> => {
        return mockList;
    },
}