// src/components/GroupScheduler.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { database } from "../utils/firebase";
import { ref, onValue, push, set, remove } from "firebase/database";

const GroupScheduler = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [availableTimes, setAvailableTimes] = useState({});
  const [newAvailableTime, setNewAvailableTime] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const groupsRef = ref(database, "groups");
      const unsubscribe = onValue(groupsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const groupList = Object.entries(data).map(([id, group]) => ({
            id,
            ...group,
          }));
          setGroups(groupList);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      fetchAvailableTimes(selectedGroup);
    }
  }, [selectedGroup]);

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
  };

  const fetchAvailableTimes = (groupId) => {
    const timesRef = ref(database, `availableTimes/${groupId}`);
    onValue(timesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAvailableTimes(data);
      } else {
        setAvailableTimes({});
      }
    });
  };

  const addAvailableTime = () => {
    if (!selectedGroup || !user || !newAvailableTime) return;

    const userTimesRef = ref(
      database,
      `availableTimes/${selectedGroup}/${user.uid}`
    );
    push(userTimesRef, newAvailableTime)
      .then(() => {
        setNewAvailableTime("");
      })
      .catch((error) => {
        console.error("Error adding available time:", error);
      });
  };

  const removeAvailableTime = (timeKey) => {
    if (!selectedGroup || !user) return;

    const timeRef = ref(
      database,
      `availableTimes/${selectedGroup}/${user.uid}/${timeKey}`
    );
    remove(timeRef).catch((error) => {
      console.error("Error removing available time:", error);
    });
  };

  const findCommonFreeTimes = () => {
    if (Object.keys(availableTimes).length === 0) return [];

    const allTimes = Object.values(availableTimes).map((userTimes) =>
      Object.values(userTimes)
    );
    const firstUserTimes = allTimes[0] || [];

    return firstUserTimes.filter((time) =>
      allTimes.every((userTimes) => userTimes.includes(time))
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Group Scheduler
      </h2>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">
          Select a group:
        </label>
        <select
          className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          onChange={(e) => handleGroupSelect(e.target.value)}
          value={selectedGroup || ""}
        >
          <option value="">Select a group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      {selectedGroup && (
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Available Times
          </h3>
          {Object.entries(availableTimes).map(([userId, times]) => (
            <div
              key={userId}
              className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md"
            >
              <p className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-200">
                {userId === user.uid ? "Your times:" : `User ${userId}:`}
              </p>
              <ul className="list-disc pl-5">
                {Object.entries(times).map(([timeKey, time]) => (
                  <li
                    key={timeKey}
                    className="mb-1 flex items-center justify-between"
                  >
                    <span className="text-gray-700 dark:text-gray-300">
                      {time}
                    </span>
                    {userId === user.uid && (
                      <button
                        onClick={() => removeAvailableTime(timeKey)}
                        className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <h3 className="text-2xl font-semibold mb-4 mt-6 text-gray-800 dark:text-gray-200">
            Common Free Times
          </h3>
          <ul className="list-disc pl-5 mb-6">
            {findCommonFreeTimes().map((time, index) => (
              <li key={index} className="mb-1 text-gray-700 dark:text-gray-300">
                {time}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <input
              type="datetime-local"
              className="p-3 border rounded-md mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              value={newAvailableTime}
              onChange={(e) => setNewAvailableTime(e.target.value)}
            />
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              onClick={addAvailableTime}
            >
              Add Available Time
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupScheduler;
