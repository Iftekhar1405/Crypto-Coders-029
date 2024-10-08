"use client";

import React, { useState, useEffect, useCallback } from "react";
import { database } from "../utils/firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { useAuth } from "../hooks/useAuth";
import ActivitySuggestions from "../components/ActivitySuggestions";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaUserMinus,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaUsers,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="text-gray-800 dark:text-gray-200">{children}</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ActivityCard = ({
  activity,
  user,
  onJoin,
  onLeave,
  onUpdate,
  onDelete,
  isExpanded,
  onToggle,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-100 bg-gradient-to-r from-purple-900 to-blue-900 dark:bg-gradient-to-r from-purple-900 to-blue-900 p-6 rounded-lg shadow-lg transform hover:shadow-xl transition-all duration-300"
  >
    <div
      className="flex justify-between items-center cursor-pointer"
      onClick={onToggle}
    >
      <h3 className="text-2xl font-bold mb-2 text-white dark:text-white">
        {activity.name}
      </h3>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <FaChevronDown className="text-gray-600 dark:text-gray-400" />
      </motion.div>
    </div>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-gray-300 dark:text-gray-300 mb-4">
            {activity.description}
          </p>
          <div className="flex items-center mb-4 text-gray-300 dark:text-gray-300">
            <FaCalendarAlt className="mr-2" />
            <span>{activity.date}</span>
          </div>
          <div className="flex items-center mb-4 text-gray-300 dark:text-gray-300">
            <FaUsers className="mr-2" />
            <span>{activity.participantsCount} participants</span>
          </div>
          {user ? (
            activity.participants && activity.participants[user.uid] ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLeave(activity.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center transition-colors duration-300"
              >
                <FaUserMinus className="mr-2" /> Leave Activity
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onJoin(activity.id)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center transition-colors duration-300"
              >
                <FaUserPlus className="mr-2" /> Join Activity
              </motion.button>
            )
          ) : (
            <Link
              to="/login"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center transition-colors duration-300"
            >
              <FaSignInAlt className="mr-2" /> Login to Join
            </Link>
          )}
          {user && user.isAdmin && (
            <div className="mt-4 flex justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdate(activity)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-300"
              >
                <FaEdit className="mr-2" /> Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(activity.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-300"
              >
                <FaTrash className="mr-2" /> Delete
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const Section = ({ title, children, isOpen, toggleOpen }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
    <button
      className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
      onClick={toggleOpen}
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h2>
      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    date: "",
  });
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingActivity, setEditingActivity] = useState(null);
  const [expandedActivity, setExpandedActivity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 9;
  const [openSections, setOpenSections] = useState({
    newActivity: false,
    activityList: true,
    activitySuggestions: false,
  });

  const fetchActivities = useCallback(() => {
    const activitiesRef = ref(database, "activities");
    return onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activityList = Object.entries(data).map(([id, activity]) => ({
          id,
          ...activity,
          participantsCount: activity.participants
            ? Object.keys(activity.participants).length
            : 0,
        }));
        setActivities(activityList);
      } else {
        setActivities([]);
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribe = fetchActivities();
    return () => unsubscribe();
  }, [fetchActivities]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({ ...prev, [name]: value }));
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.isAdmin) return;

    const activitiesRef = ref(database, "activities");
    const activityData = {
      ...newActivity,
      createdBy: user.uid,
      participants: {},
    };

    try {
      if (editingActivity) {
        await update(
          ref(database, `activities/${editingActivity.id}`),
          activityData
        );
        setModalContent({
          title: "Success",
          content: <p>Activity updated successfully!</p>,
        });
      } else {
        await push(activitiesRef, activityData);
        setModalContent({
          title: "Success",
          content: <p>Activity created successfully!</p>,
        });
      }

      setIsModalOpen(true);
      setNewActivity({ name: "", description: "", date: "" });
      setEditingActivity(null);
      fetchActivities();

      const usersRef = ref(database, "users");
      onValue(
        usersRef,
        (snapshot) => {
          const users = snapshot.val();
          for (const userId in users) {
            if (userId !== user.uid) {
              const userNotificationsRef = ref(
                database,
                `notifications/${userId}`
              );
              push(userNotificationsRef, {
                message: editingActivity
                  ? `Activity "${activityData.name}" has been updated`
                  : `New activity "${activityData.name}" has been created`,
                timestamp: Date.now(),
                type: editingActivity ? "activity_updated" : "activity_created",
              });
            }
          }
        },
        { onlyOnce: true }
      );
    } catch (error) {
      console.error("Error creating/updating activity:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to create/update activity. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  const handleJoinActivity = async (activityId) => {
    if (!user) return;
    try {
      await update(
        ref(database, `activities/${activityId}/participants/${user.uid}`),
        { joined: true }
      );
      fetchActivities();
      setModalContent({
        title: "Success",
        content: <p>You have successfully joined the activity!</p>,
      });
      setIsModalOpen(true);

      const adminNotificationsRef = ref(database, "adminNotifications");
      await push(adminNotificationsRef, {
        message: `User ${user.displayName || user.email} joined activity ${
          activities.find((a) => a.id === activityId).name
        }`,
        timestamp: Date.now(),
        type: "user_joined_activity",
      });
    } catch (error) {
      console.error("Error joining activity:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to join activity. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  const handleLeaveActivity = async (activityId) => {
    if (!user) return;
    try {
      await remove(
        ref(database, `activities/${activityId}/participants/${user.uid}`)
      );
      fetchActivities();
      setModalContent({
        title: "Success",
        content: <p>You have successfully left the activity.</p>,
      });
      setIsModalOpen(true);

      const adminNotificationsRef = ref(database, "adminNotifications");
      await push(adminNotificationsRef, {
        message: `User ${user.displayName || user.email} left activity ${
          activities.find((a) => a.id === activityId).name
        }`,
        timestamp: Date.now(),
        type: "user_left_activity",
      });
    } catch (error) {
      console.error("Error leaving activity:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to leave activity. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  const handleUpdateActivity = (activity) => {
    if (!user || !user.isAdmin) return;

    setEditingActivity(activity);
    setNewActivity({
      name: activity.name,
      description: activity.description,
      date: activity.date,
    });
    setOpenSections((prev) => ({ ...prev, newActivity: true }));
  };

  const handleDeleteActivity = (activityId) => {
    if (!user || !user.isAdmin) return;

    setModalContent({
      title: "Confirm Deletion",
      content: (
        <div>
          <p>Are you sure you want to delete this activity?</p>
          <div className="flex justify-end mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                try {
                  await remove(ref(database, `activities/${activityId}`));
                  fetchActivities();
                  setIsModalOpen(false);
                  setModalContent({
                    title: "Success",
                    content: <p>Activity deleted successfully!</p>,
                  });
                  setIsModalOpen(true);

                  const usersRef = ref(database, "users");
                  onValue(
                    usersRef,
                    (snapshot) => {
                      const users = snapshot.val();
                      for (const userId in users) {
                        if (userId !== user.uid) {
                          const userNotificationsRef = ref(
                            database,
                            `notifications/${userId}`
                          );
                          push(userNotificationsRef, {
                            message: `An activity has been deleted`,
                            timestamp: Date.now(),
                            type: "activity_deleted",
                          });
                        }
                      }
                    },
                    { onlyOnce: true }
                  );
                } catch (error) {
                  console.error("Error deleting activity:", error);
                  setModalContent({
                    title: "Error",
                    content: (
                      <p>Failed to delete activity. Please try again.</p>
                    ),
                  });
                  setIsModalOpen(true);
                }
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 transition-colors duration-300"
            >
              Yes, Delete
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-300"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      ),
    });
    setIsModalOpen(true);
  };

  const filteredActivities = activities.filter((activity) =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = filteredActivities.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddActivitySuggestion = async (newActivity) => {
    try {
      const activitiesRef = ref(database, "activities");
      await push(activitiesRef, newActivity);
      fetchActivities();
      setModalContent({
        title: "Success",
        content: <p>Activity suggestion added successfully!</p>,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error adding activity suggestion:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to add activity suggestion. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  const handleUpdateActivitySuggestion = async (
    activityId,
    updatedActivity
  ) => {
    try {
      const activityRef = ref(database, `activities/${activityId}`);
      await update(activityRef, updatedActivity);
      fetchActivities();
      setModalContent({
        title: "Success",
        content: <p>Activity suggestion updated successfully!</p>,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error updating activity suggestion:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to update activity suggestion. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  const handleDeleteActivitySuggestion = async (activityId) => {
    try {
      const activityRef = ref(database, `activities/${activityId}`);
      await remove(activityRef);
      fetchActivities();
      setModalContent({
        title: "Success",
        content: <p>Activity suggestion deleted successfully!</p>,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error deleting activity suggestion:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to delete activity suggestion. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
      >
        {modalContent.content}
      </Modal>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8 text-white dark:text-white"
      >
        Activities
      </motion.h1>

      {user && user.isAdmin && (
        <Section
          title={editingActivity ? "Edit Activity" : "Create New Activity"}
          isOpen={openSections.newActivity}
          toggleOpen={() => toggleSection("newActivity")}
        >
          <form onSubmit={handleActivitySubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Activity Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newActivity.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newActivity.description}
                onChange={handleInputChange}
                required
                rows="6"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={newActivity.date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-purple-900 to-blue-900  text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
            >
              {editingActivity ? "Update Activity" : "Create Activity"}
            </motion.button>
          </form>
        </Section>
      )}

      <Section
        title="Activity List"
        isOpen={openSections.activityList}
        toggleOpen={() => toggleSection("activityList")}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-4 flex items-center"
        >
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <FaSearch className="text-gray-400 -ml-8" />
        </motion.div>

        {currentActivities.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {currentActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  user={user}
                  onJoin={handleJoinActivity}
                  onLeave={handleLeaveActivity}
                  onUpdate={handleUpdateActivity}
                  onDelete={handleDeleteActivity}
                  isExpanded={expandedActivity === activity.id}
                  onToggle={() =>
                    setExpandedActivity(
                      expandedActivity === activity.id ? null : activity.id
                    )
                  }
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-gray-600 dark:text-gray-400 text-center"
          >
            No activities available.
          </motion.p>
        )}

        {filteredActivities.length > activitiesPerPage && (
          <div className="flex justify-center mt-8">
            {Array.from({
              length: Math.ceil(filteredActivities.length / activitiesPerPage),
            }).map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Activity Suggestions"
        isOpen={openSections.activitySuggestions}
        toggleOpen={() => toggleSection("activitySuggestions")}
      >
        <ActivitySuggestions
          activities={activities}
          onAddActivity={handleAddActivitySuggestion}
          onUpdateActivity={handleUpdateActivitySuggestion}
          onDeleteActivity={handleDeleteActivitySuggestion}
        />
      </Section>
    </div>
  );
}
