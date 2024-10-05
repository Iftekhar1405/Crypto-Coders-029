// src/components/ActivitySuggestions.jsx
import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, push, onValue, off } from "firebase/database";

const ActivitySuggestions = () => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState("");

  useEffect(() => {
    const activitiesRef = ref(database, "activities");
    onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setActivities(Object.values(data));
      }
    });

    return () => {
      off(activitiesRef);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newActivity.trim()) {
      const activitiesRef = ref(database, "activities");
      push(activitiesRef, {
        name: newActivity,
        votes: 0,
      });
      setNewActivity("");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Activity Suggestions
      </h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={newActivity}
          onChange={(e) => setNewActivity(e.target.value)}
          placeholder="Suggest an activity"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        />
        <button
          type="submit"
          className="mt-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Add Suggestion
        </button>
      </form>
      <ul className="space-y-2">
        {activities.map((activity, index) => (
          <li
            key={index}
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded"
          >
            <span className="text-gray-800 dark:text-gray-200">
              {activity.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {activity.votes} votes
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivitySuggestions;
