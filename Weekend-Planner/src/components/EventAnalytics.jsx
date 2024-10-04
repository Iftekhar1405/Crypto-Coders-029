// src/components/EventAnalytics.jsx
import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, onValue, off } from "firebase/database";

const EventAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalEvents: 0,
    popularActivities: [],
  });

  useEffect(() => {
    const usersRef = ref(database, "users");
    const eventsRef = ref(database, "events");
    const activitiesRef = ref(database, "activities");

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAnalytics((prev) => ({
          ...prev,
          totalUsers: Object.keys(data).length,
        }));
      }
    });

    const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAnalytics((prev) => ({
          ...prev,
          totalEvents: Object.keys(data).length,
        }));
      }
    });

    const unsubscribeActivities = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedActivities = Object.entries(data)
          .sort(([, a], [, b]) => b.votes - a.votes)
          .slice(0, 5)
          .map(([name, { votes }]) => ({ name, votes }));
        setAnalytics((prev) => ({
          ...prev,
          popularActivities: sortedActivities,
        }));
      }
    });

    return () => {
      off(usersRef, unsubscribeUsers);
      off(eventsRef, unsubscribeEvents);
      off(activitiesRef, unsubscribeActivities);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Event Analytics
      </h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Total Users
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {analytics.totalUsers}
          </p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Total Events
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {analytics.totalEvents}
          </p>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
          Popular Activities
        </h3>
        <ul className="space-y-2">
          {analytics.popularActivities.map((activity, index) => (
            <li
              key={index}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded"
            >
              <span className="text-gray-800 dark:text-gray-200">
                {activity.name}
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {activity.votes} votes
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default EventAnalytics;
