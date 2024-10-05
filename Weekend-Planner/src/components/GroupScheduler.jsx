import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { database } from "../utils/firebase";
import { ref, onValue, push, remove, update } from "firebase/database";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function GroupScheduler() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [commonFreeTimes, setCommonFreeTimes] = useState({});
  const [newFreeTimeFrom, setNewFreeTimeFrom] = useState("");
  const [newFreeTimeTo, setNewFreeTimeTo] = useState("");
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
      fetchCommonFreeTimes(selectedGroup);
    }
  }, [selectedGroup]);

  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
  };

  const fetchCommonFreeTimes = (groupId) => {
    const timesRef = ref(database, `commonFreeTimes/${groupId}`);
    onValue(timesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCommonFreeTimes(data);
      } else {
        setCommonFreeTimes({});
      }
    });
  };

  const addCommonFreeTime = () => {
    if (
      !selectedGroup ||
      !user ||
      !user.isAdmin ||
      !newFreeTimeFrom ||
      !newFreeTimeTo
    )
      return;

    const groupTimesRef = ref(database, `commonFreeTimes/${selectedGroup}`);
    push(groupTimesRef, {
      from: newFreeTimeFrom,
      to: newFreeTimeTo,
    })
      .then(() => {
        setNewFreeTimeFrom("");
        setNewFreeTimeTo("");
      })
      .catch((error) => {
        console.error("Error adding common free time:", error);
      });
  };

  const updateCommonFreeTime = (timeKey, newTimeFrom, newTimeTo) => {
    if (!selectedGroup || !user || !user.isAdmin) return;

    const timeRef = ref(
      database,
      `commonFreeTimes/${selectedGroup}/${timeKey}`
    );
    update(timeRef, { from: newTimeFrom, to: newTimeTo })
      .then(() => {
        console.log("Common free time updated successfully");
      })
      .catch((error) => {
        console.error("Error updating common free time:", error);
      });
  };

  const removeCommonFreeTime = (timeKey) => {
    if (!selectedGroup || !user || !user.isAdmin) return;

    const timeRef = ref(
      database,
      `commonFreeTimes/${selectedGroup}/${timeKey}`
    );
    remove(timeRef).catch((error) => {
      console.error("Error removing common free time:", error);
    });
  };

  const formatDateTime = (dateTimeString) => {
    const options = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateTimeString).toLocaleString("en-US", options);
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
            Common Free Times
          </h3>
          <ul className="list-disc pl-5 mb-6">
            {Object.entries(commonFreeTimes).map(([timeKey, timeObj]) => (
              <li
                key={timeKey}
                className="mb-2 flex items-center justify-between"
              >
                <span className="text-gray-700 dark:text-gray-300">
                  From: {formatDateTime(timeObj.from)} <br />
                  To: {formatDateTime(timeObj.to)}
                </span>
                {user.isAdmin && (
                  <div>
                    <button
                      onClick={() => {
                        const newFrom = prompt(
                          "Enter new start time:",
                          timeObj.from
                        );
                        const newTo = prompt("Enter new end time:", timeObj.to);
                        if (newFrom && newTo) {
                          updateCommonFreeTime(timeKey, newFrom, newTo);
                        }
                      }}
                      className="mr-2 text-yellow-500 hover:text-yellow-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => removeCommonFreeTime(timeKey)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {user.isAdmin && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="timeFrom"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  From
                </label>
                <input
                  id="timeFrom"
                  type="datetime-local"
                  className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  value={newFreeTimeFrom}
                  onChange={(e) => setNewFreeTimeFrom(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="timeTo"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  To
                </label>
                <input
                  id="timeTo"
                  type="datetime-local"
                  className="w-full p-3 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                  value={newFreeTimeTo}
                  onChange={(e) => setNewFreeTimeTo(e.target.value)}
                />
              </div>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center sm:self-end"
                onClick={addCommonFreeTime}
              >
                <FaPlus className="mr-2" /> Add Common Free Time
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
