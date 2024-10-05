import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, onValue, push, set, remove } from "firebase/database";
import { useAuth } from "../hooks/useAuth";
import ActivitySuggestions from "../components/ActivitySuggestions";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaLock, FaSignInAlt } from "react-icons/fa";

export default function Activities({ darkMode }) {
  const [activities, setActivities] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    name: "",
    description: "",
    date: "",
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const activitiesRef = ref(database, "activities");
    const userActivitiesRef = ref(database, `users/${user.uid}/activities`);

    const unsubscribeActivities = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activitiesList = Object.entries(data).map(([id, activity]) => ({
          id,
          ...activity,
        }));
        setActivities(activitiesList);
      } else {
        setActivities([]);
      }
    });

    const unsubscribeUserActivities = onValue(userActivitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserActivities(Object.keys(data));
      } else {
        setUserActivities([]);
      }
    });

    return () => {
      unsubscribeActivities();
      unsubscribeUserActivities();
    };
  }, [user]);

  const handleActivitySubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const activitiesRef = ref(database, "activities");
    const newActivityRef = push(activitiesRef);
    set(newActivityRef, {
      ...newActivity,
      createdBy: user.uid,
      participants: [user.uid],
    });
    setNewActivity({ name: "", description: "", date: "" });
  };

  const handleJoinActivity = (activityId) => {
    if (!user) return;
    const userActivityRef = ref(
      database,
      `users/${user.uid}/activities/${activityId}`
    );
    set(userActivityRef, true);
    const activityParticipantsRef = ref(
      database,
      `activities/${activityId}/participants/${user.uid}`
    );
    set(activityParticipantsRef, true);
  };

  const handleLeaveActivity = (activityId) => {
    if (!user) return;
    const userActivityRef = ref(
      database,
      `users/${user.uid}/activities/${activityId}`
    );
    remove(userActivityRef);
    const activityParticipantsRef = ref(
      database,
      `activities/${activityId}/participants/${user.uid}`
    );
    remove(activityParticipantsRef);
  };

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className={`container mx-auto px-4 py-8 ${darkMode ? "dark" : ""}`}
      >
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="p-6 text-center">
            <FaLock className="mx-auto text-4xl text-gray-400 dark:text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please log in to view and participate in activities.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300"
            >
              <FaSignInAlt className="mr-2" />
              Go to Login
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`container mx-auto px-4 py-8 ${darkMode ? "dark" : ""}`}
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Activities
      </h1>

      {!user.isAdmin && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            Create New Activity
          </h2>
          <form onSubmit={handleActivitySubmit} className="space-y-4">
            <input
              type="text"
              value={newActivity.name}
              onChange={(e) =>
                setNewActivity({ ...newActivity, name: e.target.value })
              }
              placeholder="Activity Name"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
            <textarea
              value={newActivity.description}
              onChange={(e) =>
                setNewActivity({ ...newActivity, description: e.target.value })
              }
              placeholder="Description"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
            <input
              type="date"
              value={newActivity.date}
              onChange={(e) =>
                setNewActivity({ ...newActivity, date: e.target.value })
              }
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            >
              Create Activity
            </button>
          </form>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          All Activities
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {activity.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                {activity.description}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Date: {activity.date}
              </p>
              {!user.isAdmin &&
                (userActivities.includes(activity.id) ? (
                  <button
                    onClick={() => handleLeaveActivity(activity.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                  >
                    Leave Activity
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinActivity(activity.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                  >
                    Join Activity
                  </button>
                ))}
            </motion.div>
          ))}
        </div>
      </div>

      <ActivitySuggestions darkMode={darkMode} />
    </motion.div>
  );
}
