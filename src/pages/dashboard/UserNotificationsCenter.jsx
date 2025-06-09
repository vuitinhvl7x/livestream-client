import React, { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../api/notificationApi";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const UserNotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState(""); // '', 'true', 'false'
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 10 };
        if (filter) {
          params.isRead = filter;
        }
        const data = await getNotifications(params);
        setNotifications(data.notifications);
        setTotalPages(data.totalPages);
      } catch (error) {
        toast.error("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page, filter]);

  const handleMarkAsRead = async (notificationId) => {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification || notification.isRead || isUpdating) return;

    setIsUpdating(true);
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((currentNotifications) =>
        currentNotifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
    } catch (error) {
      toast.error("Failed to mark notification as read.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const result = await markAllNotificationsAsRead();
      setNotifications((currentNotifications) =>
        currentNotifications.map((n) => ({ ...n, isRead: true }))
      );
      toast.success(
        `${result.message} (${result.affectedCount} notifications)`
      );
    } catch (error) {
      toast.error("Failed to mark all notifications as read.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <div className="mb-4 flex justify-between items-center">
        <select
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value);
          }}
          className="p-2 border rounded-md"
        >
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        <button
          onClick={handleMarkAllAsRead}
          disabled={isUpdating || !notifications.some((n) => !n.isRead)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Mark All as Read
        </button>
      </div>

      {loading ? (
        <div>Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              className={`p-4 rounded-lg shadow flex items-start gap-4 transition-colors duration-200 ${
                notification.isRead
                  ? "bg-white"
                  : "bg-blue-50 border-l-4 border-blue-500 cursor-pointer hover:bg-blue-100"
              }`}
            >
              <div>
                <p className="text-gray-800">{notification.message}</p>
                <span className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>You have no notifications.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserNotificationsCenter;
