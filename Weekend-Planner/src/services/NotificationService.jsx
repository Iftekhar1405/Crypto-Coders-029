import { database } from "../utils/firebase";
import { ref, push, onValue, remove, update } from "firebase/database";

export const NotificationService = {
  sendNotification: (userId, notification) => {
    const notificationsRef = ref(database, `notifications/${userId}`);
    return push(notificationsRef, {
      ...notification,
      timestamp: Date.now(),
      read: false,
    });
  },

  getNotifications: (userId, callback) => {
    const notificationsRef = ref(database, `notifications/${userId}`);
    return onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      const notifications = data
        ? Object.entries(data).map(([id, notification]) => ({
            id,
            ...notification,
          }))
        : [];
      callback(notifications);
    });
  },

  markAsRead: (userId, notificationId) => {
    const notificationRef = ref(
      database,
      `notifications/${userId}/${notificationId}`
    );
    return update(notificationRef, { read: true });
  },

  deleteNotification: (userId, notificationId) => {
    const notificationRef = ref(
      database,
      `notifications/${userId}/${notificationId}`
    );
    return remove(notificationRef);
  },
};
