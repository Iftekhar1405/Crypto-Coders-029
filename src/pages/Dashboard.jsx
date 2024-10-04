// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { database } from "../utils/firebase";
import { ref, onValue, push, set } from "firebase/database";
import GroupScheduler from "../components/GroupScheduler";
import ActivitySuggestions from "../components/ActivitySuggestions";
import PollsAndVoting from "../components/PollsAndVoting";
import NotificationManager from "../components/NotificationManager";

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDateTime: "",
    endDateTime: "",
  });

  useEffect(() => {
    if (user) {
      const eventsRef = ref(database, `events/${user.uid}`);
      const unsubscribe = onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const eventList = Object.entries(data).map(([id, event]) => ({
            id,
            ...event,
          }));
          setEvents(eventList);
        } else {
          setEvents([]);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const eventsRef = ref(database, `events/${user.uid}`);
    const newEventRef = push(eventsRef);
    set(newEventRef, newEvent)
      .then(() => {
        setNewEvent({
          title: "",
          startDateTime: "",
          endDateTime: "",
        });
      })
      .catch((error) => {
        console.error("Error adding event:", error);
      });
  };

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-800 dark:text-gray-200">
        Please log in to access the dashboard.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Welcome, {user.email}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Schedule Event
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="startDateTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Start Date and Time
              </label>
              <input
                type="datetime-local"
                id="startDateTime"
                name="startDateTime"
                value={newEvent.startDateTime}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="endDateTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                End Date and Time
              </label>
              <input
                type="datetime-local"
                id="endDateTime"
                name="endDateTime"
                value={newEvent.endDateTime}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Schedule Event
            </button>
          </form>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Your Events
          </h2>
          {events.length > 0 ? (
            <ul className="space-y-4">
              {events.map((event) => (
                <li
                  key={event.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-2"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Start: {new Date(event.startDateTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    End: {new Date(event.endDateTime).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No events scheduled yet.
            </p>
          )}
        </div>
        <GroupScheduler />
        <ActivitySuggestions />
        <PollsAndVoting />
        <NotificationManager />
      </div>
    </div>
  );
};

export default Dashboard;
