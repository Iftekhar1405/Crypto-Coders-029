import React, { useState } from "react";
import { FaCheckCircle, FaTrash, FaBell } from "react-icons/fa";

const sampleNotifications = [
  {
    id: 1,
    message: "You've been invited to join the group 'Weekend Hikers'",
    timestamp: new Date("2023-06-10T09:00:00").getTime(),
    read: false,
    type: "GROUP_INVITATION",
  },
  {
    id: 2,
    message: "Your activity 'Beach Volleyball' is starting in 30 minutes",
    timestamp: new Date("2023-06-11T14:30:00").getTime(),
    read: false,
    type: "ACTIVITY_REMINDER",
  },
  {
    id: 3,
    message: "New message in 'Weekend Hikers' group chat",
    timestamp: new Date("2023-06-12T11:15:00").getTime(),
    read: true,
    type: "NEW_MESSAGE",
  },
  {
    id: 4,
    message: "Your friend John has joined 'Weekend Hikers'",
    timestamp: new Date("2023-06-13T16:45:00").getTime(),
    read: false,
    type: "FRIEND_ACTIVITY",
  },
];

export default function SampleNotifications({ darkMode }) {
  const [notifications, setNotifications] = useState(sampleNotifications);

  const handleMarkAsRead = (notificationId) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== notificationId)
    );
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? "dark" : ""}`}>
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white flex items-center">
        <FaBell className="mr-2" />
        Sample Notifications
      </h1>
      {notifications.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          No new notifications.
        </p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 ${
                notification.read ? "opacity-70" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p
                    className={`font-semibold ${
                      notification.read
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-gray-800 dark:text-white"
                    }`}
                  >
                    {notification.message}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getTypeColor(
                        notification.type
                      )}`}
                    >
                      {notification.type.replace("_", " ")}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                      aria-label="Mark as read"
                    >
                      <FaCheckCircle size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Delete notification"
                  >
                    <FaTrash size={20} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getTypeColor(type) {
  switch (type) {
    case "GROUP_INVITATION":
      return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
    case "ACTIVITY_REMINDER":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
    case "NEW_MESSAGE":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    case "FRIEND_ACTIVITY":
      return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
}
