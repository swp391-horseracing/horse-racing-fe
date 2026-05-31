import {useEffect, useState} from "react";
import {NotificationService} from "../services/NotificationService.ts";
import type { Notification } from "../types/notification.ts";

function formatNotificationDate(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);

    const diffMs = now.getTime() - date.getTime();
    console.log("current",diffMs);

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths >= 1) {
        return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    }

    if (diffWeeks >= 1) {
        return `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} ago`;
    }

    if (diffDays >= 1) {
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }

    if (diffHours >= 1) {
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    }

    if (diffMinutes >= 1) {
        return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    }

    return "just now";
}

export function useNotification(){
    const [NotificationList,setList] = useState<Notification[]>([]);

    const handleNotification = (notification:Notification)=>{
        const size = 100
        if(notification.description.length > size){
            notification.description = notification.description.slice(0, size) + "....";
        }
        notification.date = formatNotificationDate(notification.date);
        console.log(notification.date);
    }

    const getNotificationList= async () => {
        const data =   await NotificationService.getNotification();
        for(let i=0;i<data.length;i++){
            handleNotification(data[i]);
        }
        setList(data);
    }

    useEffect(() => {
        getNotificationList();
    })

    return {NotificationList,getNotificationList};
}