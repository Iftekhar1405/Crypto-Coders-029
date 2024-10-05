import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, push, onValue, off, remove } from "firebase/database";
import { useAuth } from "../hooks/useAuth";

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const notificationsRef = user.isAdmin
      ? ref(database, "adminNotifications")
      : ref(database, `notifications/${user.uid}`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.entries(data).map(
          ([id, notification]) => ({
            id,
            ...notification,
          })
        );
        setNotifications(notificationsList.reverse());
      } else {
        setNotifications([]);
      }
    });

    return () => {
      off(notificationsRef);
    };
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNotification.trim()) {
      const notificationsRef = user.isAdmin
        ? ref(database, "adminNotifications")
        : ref(database, `notifications/${user.uid}`);
      push(notificationsRef, {
        message: newNotification,
        timestamp: Date.now(),
        type: "user",
      });
      setNewNotification("");
    }
  };

  const handleDismiss = async (notificationId) => {
    try {
      const notificationRef = user.isAdmin
        ? ref(database, `adminNotifications/${notificationId}`)
        : ref(database, `notifications/${user.uid}/${notificationId}`);
      await remove(notificationRef);
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Notifications
      </h2>
      {user.isAdmin && (
        <form onSubmit={handleSubmit} className="mb-4">
          <input
            type="text"
            value={newNotification}
            onChange={(e) => setNewNotification(e.target.value)}
            placeholder="Add a new notification"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          <button
            type="submit"
            className="mt-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          >
            Send Notification
          </button>
        </form>
      )}
      {notifications.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No notifications</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="bg-gray-100 dark:bg-gray-700 p-3 rounded flex justify-between items-start"
            >
              <div>
                <p className="text-gray-800 dark:text-gray-200">
                  {notification.message}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(notification.timestamp).toLocaleString()}
                </p>
                {notification.type && (
                  <p className="text-sm text-blue-500 mt-1">
                    Type: {notification.type}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDismiss(notification.id)}
                className="text-red-500 hover:text-red-600"
              >
                Dismiss
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationManager;
