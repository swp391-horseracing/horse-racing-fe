import {useNotification} from "../hooks/useNotification.ts";
// import {useNavigate} from "react-router-dom";
import {Circle} from "lucide-react";
import {useEffect, useState} from "react";

export default function NotificationTab() {
    const { NotificationList } = useNotification();
    // const navigate = useNavigate();
    const [list, setNotifications] = useState(NotificationList);

    useEffect(() => {
        setNotifications(NotificationList);
    }, [NotificationList]);

    const handleRead = (id: string) => {
        setNotifications(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, isRead: true }
                    : item
            )
        );
    };

    const handleReadAll = () => {
        setNotifications(prev =>
            prev.map(item => ({
                ...item,
                isRead: true,
            }))
        );
    };
    return (
        <div className="fixed mt-11 ml-5 w-120 h-90 overflow-y-auto rounded shadow-lg">
            <div className="bg-gray-100">
                <div className="sticky top-0 flex flex-row w-full items-center justify-between px-4 py-3 bg-white border-b">
                    <label className="text-xl font-bold">
                        Notifications
                    </label>
                    <button
                        onClick={handleReadAll}
                        className="text-sm font-medium text-green-600 hover:text-green-700"
                    >
                        Mark all as read
                    </button>
                </div>

                    <div className="flex flex-col justify-start">
                        {list.map((notification, i) => {
                            const showDateLabel = i === 0 || notification.date !== list[i - 1].date;
                            console.log("page:", notification);
                            console.log("showDatein page:", notification.date);
                            return (
                                <div key={notification.id}>
                                    {showDateLabel && (
                                        <div className="flex justify-start px-4 py-2 bg-gray-100 text-sm text-gray-500">
                                            {notification.date}
                                        </div>
                                    )}

                            <button
                                onClick={() => {handleRead(notification.id)}}
                                className="flex flex-row h-25 justify-top items-start p-2 bg-white hover:bg-green-100! shadow-md"
                            >
                                <div className="mt-1 mr-2">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-50 shadow-md">
                                        <Circle className="size-5"/>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-top items-start text-start ">
                                    <div className="flex flex-row w-full justify-center items-center text-[16px] font-bold">
                                        {notification.isRead && (
                                            <div className="flex items-center justify-center h-1.5 w-1.5 ml-1 mr-2 mt-0.5 rounded-full bg-gray-200" />
                                        )}

                                        {!notification.isRead && (
                                            <div className="flex items-center justify-center h-1.5 w-1.5 ml-1 mr-2 mt-0.5 rounded-full bg-green-300" />
                                        )}
                                        <div>{notification.title}</div>
                                        <div className="ml-auto font-normal text-gray-500 text-[12px]">{notification.date}</div>
                                    </div>
                                    <div className="text-[14px] font-normal">{notification.description}</div>
                                </div>
                            </button>
                        </div>
                    );})}
                </div>
            </div>
        </div>
    );
}
