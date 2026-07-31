import { useState, useMemo } from "react";
import { useNotification } from "../../hooks/useNotification";

export default function NotificationsPanel() {
  const { NotificationList, handleRead } = useNotification();
  const [page, setPage] = useState(1);
  const limit = 10;

  const paginatedNotifications = useMemo(() => {
    const start = (page - 1) * limit;
    return NotificationList.slice(start, start + limit);
  }, [NotificationList, page]);

  const totalPages = Math.ceil(NotificationList.length / limit) || 1;

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-2xl p-6 justify-between">
      <div>
        <div className="font-bold text-lg text-slate-900 dark:text-gray-100 mb-4 ">
          Notifications
        </div>
        <div className="w-full overflow-y-auto flex flex-col divide-y divide-slate-100">
          {paginatedNotifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => {
                handleRead(notification.id);
              }}
              className="flex flex-row py-3 justify-top items-start p-2 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col justify-top items-start text-start w-full">
                <div className="flex flex-row w-full justify-center items-center text-[15px] font-bold">
                  {notification.isRead && (
                    <div className="flex items-center justify-center h-1.5 w-1.5 ml-1 mr-2 mt-0.5 rounded-full bg-gray-200" />
                  )}

                  {!notification.isRead && (
                    <div className="flex items-center justify-center h-1.5 w-1.5 ml-1 mr-2 mt-0.5 rounded-full bg-emerald-500" />
                  )}
                  <div>{notification.title}</div>
                  <div className="ml-auto font-normal text-slate-500 text-[12px]">
                    {notification.date}
                  </div>
                </div>
                <div className="text-[13px] font-normal text-slate-600 mt-1">
                  {notification.description}
                </div>
              </div>
            </button>
          ))}

          {NotificationList.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications found.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <p className="text-[10px] text-slate-500 font-semibold">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {(page - 1) * limit + 1}
            </span>
            –
            <span className="font-bold text-slate-700">
              {Math.min(page * limit, NotificationList.length)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-slate-700">
              {NotificationList.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-label text-slate-500 px-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
