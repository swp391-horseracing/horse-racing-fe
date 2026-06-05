import { useNotification } from "../hooks/useNotification.ts";

export default function NotificationTab() {
  const { NotificationList, handleRead, handleReadAll } = useNotification();
  const size = 100;

  return (
      <div className="fixed mt-11 w-120 h-90 mr-100 overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-xl scrollbar-thin">
        {/* Header */}
        <div className="sticky top-0 z-10 flex flex-row w-full items-center justify-between px-5 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <label className="text-lg font-bold text-gray-800">Notifications</label>
          <button
              onClick={handleReadAll}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
          >
            Mark all as read
          </button>
        </div>

        {/* Notification List */}
        <div className="flex flex-col divide-y divide-gray-50">
          {NotificationList.map((notification) => (
              <button
                  key={notification.id}
                  onClick={() => handleRead(notification.id)}
                  className={`flex flex-col items-start w-full p-4 text-left transition-all duration-200 ${
                      notification.isRead
                          ? "bg-white hover:bg-gray-50/70"
                          : "bg-emerald-50/30 hover:bg-emerald-50/60"
                  }`}
              >
                {/* Top Row: Status + Title + Date */}
                <div className="flex flex-row w-full items-start gap-2.5 mb-1">
                  {/* Status Indicator */}
                  <div className="flex items-center h-6">
                <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                        notification.isRead ? "bg-gray-300" : "bg-emerald-500 animate-pulse"
                    }`}
                />
                  </div>

                  {/* Title */}
                  <div className={`flex-1 text-sm font-semibold leading-6 ${
                      notification.isRead ? "text-gray-500" : "text-gray-800"
                  }`}>
                    {notification.title}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-gray-400 font-medium pt-0.5 whitespace-nowrap">
                    {notification.date}
                  </div>
                </div>

                {/* Description */}
                <div className={`pl-4.5 text-xs leading-relaxed ${
                    notification.isRead ? "text-gray-400" : "text-gray-600"
                }`}>
                  {notification.description.length > size
                      ? notification.description.slice(0, size) + "..."
                      : notification.description}
                </div>
              </button>
          ))}
        </div>
      </div>
  );
}