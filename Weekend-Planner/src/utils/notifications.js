import { database } from "./firebase";
import { ref, push, remove, onValue } from "firebase/database";

export const sendNotification = async (userId, message) => {
  try {
    const notificationsRef = ref(database, `notifications/${userId}`);
    await push(notificationsRef, {
      message,
      timestamp: Date.now(),
      read: false,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = ref(
      database,
      `notifications/${userId}/${notificationId}`
    );
    await remove(notificationRef);
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

export const subscribeToNotifications = (userId, callback) => {
  const notificationsRef = ref(database, `notifications/${userId}`);
  const unsubscribe = onValue(notificationsRef, (snapshot) => {
    const notifications = [];
    snapshot.forEach((childSnapshot) => {
      notifications.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });
    callback(notifications);
  });

  return unsubscribe;
};

export const sendGroupInvitation = async (inviterId, inviteeId, groupId) => {
  try {
    const message = `You've been invited to join a group!`;
    await sendNotification(inviteeId, message);
    const invitationsRef = ref(database, `groupInvitations/${inviteeId}`);
    await push(invitationsRef, {
      inviterId,
      groupId,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error sending group invitation:", error);
  }
};

export const acceptGroupInvitation = async (userId, invitationId, groupId) => {
  try {
    const invitationRef = ref(
      database,
      `groupInvitations/${userId}/${invitationId}`
    );
    await remove(invitationRef);
    const groupMemberRef = ref(database, `groups/${groupId}/members/${userId}`);
    await push(groupMemberRef, true);
    await sendNotification(userId, `You've successfully joined the group!`);
  } catch (error) {
    console.error("Error accepting group invitation:", error);
  }
};
