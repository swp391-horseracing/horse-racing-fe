import {useNotification} from "../../hooks/useNotification.ts";
import {useEffect, useState} from "react";

export default function NotificationsPanel() {
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

    // const handleReadAll = () => {
    //     setNotifications(prev =>
    //         prev.map(item => ({
    //             ...item,
    //             isRead: true,
    //         }))
    //     );
    // };
    return (
    <div className="flex flex-col w-full h-full bg-white rounded-2xl p-6">
        <div className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4 ">Notifications</div>
        <div className="w-full h-full overflow-y-auto bg-red-600 flex flex-col">
            {list.map((notification) => (

                <button
                    key={notification.id}
                    onClick={() => {handleRead(notification.id)}}
                    className="flex flex-row h-25 justify-top items-start p-2 bg-white hover:bg-green-100!"
                >
                    <div className="flex flex-col justify-top items-start text-start w-full">
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
            ))}
        </div>
    </div>
    )
}