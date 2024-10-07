"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { database } from "../utils/firebase";
import { ref, onValue, update, remove, push, get } from "firebase/database";
import {
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaComments,
  FaTrash,
  FaUserFriends,
  FaCheck,
  FaClock,
  FaReply,
  FaBell,
} from "react-icons/fa";
import UserManagement from "../components/UserManagement";

const AdminCard = ({ title, icon, count, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {icon}
        <h3 className="text-xl font-semibold ml-2 text-gray-800 dark:text-white">
          {title}
        </h3>
      </div>
      <span className="text-3xl font-bold text-gray-800 dark:text-white">
        {count}
      </span>
    </div>
  </motion.div>
);

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [groups, setGroups] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({ title: "", message: "" });

  useEffect(() => {
    const fetchData = (path, setter) => {
      const dataRef = ref(database, path);
      return onValue(dataRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const dataArray = Object.entries(data).map(([id, value]) => ({
            id,
            ...value,
            membersCount:
              value.participants || value.members
                ? Object.keys(value.participants || value.members).length
                : 0,
          }));
          setter(dataArray);
        } else {
          setter([]);
        }
      });
    };

    const unsubscribeUsers = fetchData("users", setUsers);
    const unsubscribeEvents = fetchData("events", setEvents);
    const unsubscribeActivities = fetchData("activities", setActivities);
    const unsubscribeGroups = fetchData("groups", setGroups);
    const unsubscribeFeedbacks = fetchData("feedbacks", setFeedbacks);
    const unsubscribeNotifications = fetchData("adminNotifications", (notifs) =>
      setNotifications(notifs.sort((a, b) => b.timestamp - a.timestamp))
    );

    return () => {
      unsubscribeUsers();
      unsubscribeEvents();
      unsubscribeActivities();
      unsubscribeGroups();
      unsubscribeFeedbacks();
      unsubscribeNotifications();
    };
  }, []);

  const handleDeleteItem = async (itemType, itemId) => {
    if (window.confirm(`Are you sure you want to delete this ${itemType}?`)) {
      try {
        const itemRef = ref(database, `${itemType}/${itemId}`);

        // Get item data before deleting
        const itemSnapshot = await get(itemRef);
        const itemData = itemSnapshot.val();

        await remove(itemRef);

        // Send notifications to affected users
        if (
          itemType === "events" ||
          itemType === "activities" ||
          itemType === "groups"
        ) {
          const usersRef = ref(database, "users");
          const usersSnapshot = await get(usersRef);
          const users = usersSnapshot.val();

          for (const userId in users) {
            const userNotificationsRef = ref(
              database,
              `notifications/${userId}`
            );
            await push(userNotificationsRef, {
              message: `${
                itemType.charAt(0).toUpperCase() + itemType.slice(1, -1)
              } "${itemData.name}" has been deleted`,
              timestamp: Date.now(),
              type: `${itemType.slice(0, -1)}_deleted`,
            });
          }
        }

        setPopupContent({
          title: "Success",
          message: `${itemType} deleted successfully.`,
        });
        setShowPopup(true);
      } catch (error) {
        console.error(`Error deleting ${itemType}:`, error);
        setPopupContent({
          title: "Error",
          message: `Failed to delete ${itemType}.`,
        });
        setShowPopup(true);
      }
    }
  };

  const handleFeedbackAction = async (action, feedback) => {
    try {
      const feedbackRef = ref(database, `feedbacks/${feedback.id}`);
      let updateData = {};
      let popupMessage = "";
      let notificationMessage = "";

      switch (action) {
        case "resolve":
          updateData = { status: "resolved" };
          popupMessage = "Feedback marked as resolved.";
          notificationMessage = "Your feedback has been resolved.";
          break;
        case "pending":
          updateData = { status: "pending" };
          popupMessage = "Feedback marked as pending.";
          notificationMessage = "Your feedback is marked as pending.";
          break;
        case "reply":
          const reply = prompt("Enter your reply:");
          if (reply) {
            updateData = {
              replies: [
                ...(feedback.replies || []),
                { text: reply, timestamp: Date.now() },
              ],
            };
            popupMessage = "Reply added to feedback.";
            notificationMessage = `Admin replied to your feedback: "${reply}"`;
          } else {
            return; // Cancel if no reply entered
          }
          break;
        default:
          throw new Error("Invalid action");
      }

      await update(feedbackRef, updateData);

      // Add notification for the user
      const notificationsRef = ref(
        database,
        `notifications/${feedback.userId}`
      );
      await push(notificationsRef, {
        message: notificationMessage,
        timestamp: Date.now(),
        type: "feedback",
      });

      setPopupContent({ title: "Success", message: popupMessage });
      setShowPopup(true);
    } catch (error) {
      console.error(`Error updating feedback:`, error);
      setPopupContent({
        title: "Error",
        message: "Failed to update feedback.",
      });
      setShowPopup(true);
    }
  };

  const clearAllNotifications = async () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        const notificationsRef = ref(database, "adminNotifications");
        await remove(notificationsRef);
        setPopupContent({
          title: "Success",
          message: "All notifications cleared successfully.",
        });
        setShowPopup(true);
      } catch (error) {
        console.error("Error clearing notifications:", error);
        setPopupContent({
          title: "Error",
          message: "Failed to clear notifications.",
        });
        setShowPopup(true);
      }
    }
  };

  const clearAllFeedbacks = async () => {
    if (window.confirm("Are you sure you want to clear all feedbacks?")) {
      try {
        const feedbacksRef = ref(database, "feedbacks");
        await remove(feedbacksRef);
        setPopupContent({
          title: "Success",
          message: "All feedbacks cleared successfully.",
        });
        setShowPopup(true);
      } catch (error) {
        console.error("Error clearing feedbacks:", error);
        setPopupContent({
          title: "Error",
          message: "Failed to clear feedbacks.",
        });
        setShowPopup(true);
      }
    }
  };

  const deleteAllGroups = async () => {
    if (window.confirm("Are you sure you want to delete all groups?")) {
      try {
        const groupsRef = ref(database, "groups");
        await remove(groupsRef);
        setPopupContent({
          title: "Success",
          message: "All groups deleted successfully.",
        });
        setShowPopup(true);
      } catch (error) {
        console.error("Error deleting groups:", error);
        setPopupContent({
          title: "Error",
          message: "Failed to delete groups.",
        });
        setShowPopup(true);
      }
    }
  };

  const deleteAllEvents = async () => {
    if (window.confirm("Are you sure you want to delete all events?")) {
      try {
        const eventsRef = ref(database, "events");
        await remove(eventsRef);
        setPopupContent({
          title: "Success",
          message: "All events deleted successfully.",
        });
        setShowPopup(true);
      } catch (error) {
        console.error("Error deleting events:", error);
        setPopupContent({
          title: "Error",
          message: "Failed to delete events.",
        });
        setShowPopup(true);
      }
    }
  };

  const deleteAllUsers = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all users? This action cannot be undone."
      )
    ) {
      try {
        const usersRef = ref(database, "users");
        await remove(usersRef);
        setPopupContent({
          title: "Success",
          message: "All users deleted successfully.",
        });
        setShowPopup(true);
      } catch (error) {
        console.error("Error deleting users:", error);
        setPopupContent({
          title: "Error",
          message: "Failed to delete users.",
        });
        setShowPopup(true);
      }
    }
  };

  const deleteAllActivities = async () => {
    if (window.confirm("Are you sure you want to delete all activities?")) {
      try {
        const activitiesRef = ref(database, "activities");
        await remove(activitiesRef);
        setPopupContent({
          title: "Success",
          message: "All activities deleted successfully.",
        });
        setShowPopup(true);
      } catch (error) {
        console.error("Error deleting activities:", error);
        setPopupContent({
          title: "Error",
          message: "Failed to delete activities.",
        });
        setShowPopup(true);
      }
    }
  };

  const renderItemList = (items, itemType) => (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 p-2 rounded"
        >
          <span className="text-gray-800 dark:text-white">
            {item.title || item.name || item.feedback || item.message}
          </span>
          <div className="flex items-center">
            {itemType !== "feedbacks" && itemType !== "notifications" && (
              <span className="mr-4 text-sm text-gray-600 dark:text-gray-300">
                Participants: {item.membersCount}
              </span>
            )}
            {itemType === "feedbacks" ? (
              <>
                <button
                  onClick={() => handleFeedbackAction("resolve", item)}
                  className="mr-2 text-green-500 hover:text-green-600"
                  title="Resolve"
                  aria-label="Resolve feedback"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => handleFeedbackAction("pending", item)}
                  className="mr-2 text-yellow-500 hover:text-yellow-600"
                  title="Mark as Pending"
                  aria-label="Mark feedback as pending"
                >
                  <FaClock />
                </button>
                <button
                  onClick={() => handleFeedbackAction("reply", item)}
                  className="mr-2 text-blue-500 hover:text-blue-600"
                  title="Reply"
                  aria-label="Reply to feedback"
                >
                  <FaReply />
                </button>
                <span className="mr-2 text-sm text-gray-600 dark:text-gray-300">
                  Status: {item.status || "New"}
                </span>
              </>
            ) : null}
            {itemType !== "notifications" && (
              <button
                onClick={() => handleDeleteItem(itemType, item.id)}
                className="text-red-500 hover:text-red-600"
                aria-label={`Delete ${itemType.slice(0, -1)}`}
              >
                <FaTrash />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  const renderPopup = () => (
    <AnimatePresence>
      {showPopup && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
              {popupContent.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {popupContent.message}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-8 text-gray-100 dark:text-white">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <AdminCard
          title="Users"
          icon={<FaUsers className="text-blue-500 text-3xl" />}
          count={users.length}
          onClick={() => setSelectedSection("users")}
        />
        <AdminCard
          title="Events"
          icon={<FaCalendarAlt className="text-green-500 text-3xl" />}
          count={events.length}
          onClick={() => setSelectedSection("events")}
        />
        <AdminCard
          title="Activities"
          icon={<FaClipboardList className="text-yellow-500 text-3xl" />}
          count={activities.length}
          onClick={() => setSelectedSection("activities")}
        />
        <AdminCard
          title="Groups"
          icon={<FaUserFriends className="text-red-500 text-3xl" />}
          count={groups.length}
          onClick={() => setSelectedSection("groups")}
        />
        <AdminCard
          title="Feedbacks"
          icon={<FaComments className="text-purple-500 text-3xl" />}
          count={feedbacks.length}
          onClick={() => setSelectedSection("feedbacks")}
        />
        <AdminCard
          title="Notifications"
          icon={<FaBell className="text-orange-500 text-3xl" />}
          count={notifications.length}
          onClick={() => setSelectedSection("notifications")}
        />
      </div>

      {selectedSection === "users" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            User Management
          </h2>
          <UserManagement
            users={users}
            events={events}
            activities={activities}
            groups={groups}
          />
          <button
            onClick={deleteAllUsers}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete All Users
          </button>
        </div>
      )}

      {selectedSection === "events" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Event Management
          </h2>
          {renderItemList(events, "events")}
          <button
            onClick={deleteAllEvents}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete All Events
          </button>
        </div>
      )}

      {selectedSection === "activities" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Activity Management
          </h2>
          {renderItemList(activities, "activities")}
          <button
            onClick={deleteAllActivities}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete All Activities
          </button>
        </div>
      )}

      {selectedSection === "groups" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Group Management
          </h2>
          {renderItemList(groups, "groups")}
          <button
            onClick={deleteAllGroups}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete All Groups
          </button>
        </div>
      )}

      {selectedSection === "feedbacks" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Feedback Management
          </h2>
          {renderItemList(feedbacks, "feedbacks")}
          <button
            onClick={clearAllFeedbacks}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Feedbacks
          </button>
        </div>
      )}

      {selectedSection === "notifications" && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            User Activity Notifications
          </h2>
          {renderItemList(notifications, "notifications")}
          <button
            onClick={clearAllNotifications}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Notifications
          </button>
        </div>
      )}

      {renderPopup()}
    </motion.div>
  );
}
