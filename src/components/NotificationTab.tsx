import { useNotification } from "../hooks/useNotification.ts";

export default function NotificationTab() {
  const { NotificationList, handleRead, handleReadAll } = useNotification();
  const size = 100;

  return (
    <div className="fixed mt-11 ml-5 w-120 h-90 overflow-y-auto rounded shadow-lg">
      <div className="bg-gray-100">
        <div className="sticky top-0 flex flex-row w-full items-center justify-between px-4 py-3 bg-white border-b">
          <label className="text-xl font-bold">Notifications</label>
          <button
            onClick={handleReadAll}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            Mark all as read
          </button>
        </div>

        <div className="flex flex-col justify-start">
          {NotificationList.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                handleRead(notification.id);
              }}
              className="flex flex-row h-25 justify-top items-start p-2 bg-white hover:bg-green-100! shadow-md"
            >
              <div className="flex flex-col justify-top items-start text-start ">
                <div className="flex flex-row w-full justify-center items-center text-[16px] font-bold">
                  {notification.isRead && (
                    <div className="flex items-center justify-center h-1.5 w-1.5 ml-1 mr-2 mt-0.5 rounded-full bg-gray-200" />
                  )}

                  {!notification.isRead && (
                    <div className="flex items-center justify-center h-1.5 w-1.5 ml-1 mr-2 mt-0.5 rounded-full bg-green-300" />
                  )}
                  <div>{notification.title}</div>
                  <div className="ml-auto font-normal text-gray-500 text-[12px]">
                    {notification.date}
                  </div>
                </div>
                <div className="text-[14px] font-normal">
                  {notification.description.length > size
                    ? notification.description.slice(0, size) + "...."
                    : notification.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
