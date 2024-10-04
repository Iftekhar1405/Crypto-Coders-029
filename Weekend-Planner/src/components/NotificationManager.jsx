// src/components/NotificationManager.jsx
import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, push, onValue, off } from "firebase/database";
import { useAuth } from "../hooks/useAuth";

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const [newNotification, setNewNotification] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const notificationsRef = ref(database, "notifications");
    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNotifications(Object.values(data));
      }
    });

    return () => {
      off(notificationsRef);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newNotification.trim()) {
      const notificationsRef = ref(database, "notifications");
      push(notificationsRef, {
        message: newNotification,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
      });
      setNewNotification("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Notifications
      </h2>
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
      <ul className="space-y-2">
        {notifications.map((notification, index) => (
          <li key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <p className="text-gray-800 dark:text-gray-200">
              {notification.message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationManager;
