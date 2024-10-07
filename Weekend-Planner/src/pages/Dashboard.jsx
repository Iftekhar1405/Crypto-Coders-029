"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { database } from "../utils/firebase";
import {
  ref,
  onValue,
  push,
  set,
  remove,
  update,
  get,
} from "firebase/database";
import {
  FaCalendarAlt,
  FaUsers,
  FaClipboardList,
  FaBell,
  FaComment,
  FaTrash,
  FaUserPlus,
  FaUserMinus,
  FaSearch,
  FaCheck,
  FaEdit,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import GroupScheduler from "../components/GroupScheduler";
import ActivitySuggestions from "../components/ActivitySuggestions";
import NotificationManager from "../components/NotificationManager";
import PollsAndVoting from "../components/PollsAndVoting";

const TabButton = ({ active, onClick, children }) => (
  <button
    className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-300 ${
      active
        ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400"
        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          {children}
          <button
            onClick={onClose}
            className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("events");
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDateTime: "",
    endDateTime: "",
    location: "",
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [userName, setUserName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: null,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [openSections, setOpenSections] = useState({
    newEvent: false,
    eventList: false,
    groupScheduler: false,
    activitySuggestions: false,
    pollsAndVoting: false,
    notifications: false,
    feedback: false,
  });

  useEffect(() => {
    if (user) {
      const eventsRef = ref(database, "events");
      const userRef = ref(database, `users/${user.uid}`);

      const unsubscribeEvents = onValue(eventsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const eventList = Object.entries(data).map(([id, event]) => ({
            id,
            ...event,
            isJoined: event.participants && event.participants[user.uid],
          }));
          setEvents(eventList);
          setFilteredEvents(eventList);
        } else {
          setEvents([]);
          setFilteredEvents([]);
        }
      });

      const unsubscribeUser = onValue(userRef, (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.name) {
          setUserName(userData.name);
        } else {
          setUserName(user.email);
        }
      });

      return () => {
        unsubscribeEvents();
        unsubscribeUser();
      };
    }
  }, [user]);

  useEffect(() => {
    const filtered = events.filter((event) => {
      const eventTitle = event && event.title ? event.title.toLowerCase() : "";
      return eventTitle.includes(searchTerm.toLowerCase());
    });
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !user.isAdmin) return;

    const eventsRef = ref(database, "events");
    const eventData = { ...newEvent, createdBy: user.uid, participants: {} };

    if (editingEvent) {
      const eventRef = ref(database, `events/${editingEvent.id}`);
      update(eventRef, eventData)
        .then(() => {
          setEditingEvent(null);
          showSuccessMessage("Event updated successfully!");

          // Send notification to all users
          const usersRef = ref(database, "users");
          get(usersRef).then((snapshot) => {
            const users = snapshot.val();
            for (const userId in users) {
              if (userId !== user.uid) {
                const userNotificationsRef = ref(
                  database,
                  `notifications/${userId}`
                );
                push(userNotificationsRef, {
                  message: `Event "${eventData.title}" has been updated`,
                  timestamp: Date.now(),
                  type: "event_updated",
                });
              }
            }
          });
        })
        .catch((error) => {
          console.error("Error updating event:", error);
          showErrorMessage("Failed to update event. Please try again.");
        });
    } else {
      push(eventsRef, eventData)
        .then(() => {
          showSuccessMessage("Event scheduled successfully!");

          // Send notification to all users
          const usersRef = ref(database, "users");
          get(usersRef).then((snapshot) => {
            const users = snapshot.val();
            for (const userId in users) {
              if (userId !== user.uid) {
                const userNotificationsRef = ref(
                  database,
                  `notifications/${userId}`
                );
                push(userNotificationsRef, {
                  message: `New event "${eventData.title}" has been created`,
                  timestamp: Date.now(),
                  type: "event_created",
                });
              }
            }
          });
        })
        .catch((error) => {
          console.error("Error adding event:", error);
          showErrorMessage("Failed to schedule event. Please try again.");
        });
    }

    setNewEvent({
      title: "",
      startDateTime: "",
      endDateTime: "",
      location: "",
    });
  };

  const handleDeleteEvent = (eventId) => {
    if (!user || !user.isAdmin) return;

    setModalContent({
      title: "Confirm Deletion",
      content: (
        <div>
          <p>Are you sure you want to delete this event?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                const eventRef = ref(database, `events/${eventId}`);
                remove(eventRef)
                  .then(() => {
                    setIsModalOpen(false);
                    showSuccessMessage("Event deleted successfully!");

                    // Send notification to all users
                    const usersRef = ref(database, "users");
                    get(usersRef).then((snapshot) => {
                      const users = snapshot.val();
                      for (const userId in users) {
                        if (userId !== user.uid) {
                          const userNotificationsRef = ref(
                            database,
                            `notifications/${userId}`
                          );
                          push(userNotificationsRef, {
                            message: `An event has been deleted`,
                            timestamp: Date.now(),
                            type: "event_deleted",
                          });
                        }
                      }
                    });
                  })
                  .catch((error) => {
                    console.error("Error deleting event:", error);
                    showErrorMessage(
                      "Failed to delete event. Please try again."
                    );
                  });
              }}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 transition-colors duration-300"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
    });
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      location: event.location,
    });
    setOpenSections((prev) => ({ ...prev, newEvent: true }));
  };

  const handleJoinEvent = (eventId) => {
    if (!user) {
      showErrorMessage("You must be logged in to join an event.");
      return;
    }

    const eventRef = ref(database, `events/${eventId}`);
    onValue(
      eventRef,
      (snapshot) => {
        const eventData = snapshot.val();
        if (eventData) {
          const updatedParticipants = {
            ...eventData.participants,
            [user.uid]: true,
          };
          update(eventRef, { participants: updatedParticipants })
            .then(() => {
              showSuccessMessage("You have successfully joined the event!");
              setEvents((prevEvents) =>
                prevEvents.map((event) =>
                  event.id === eventId ? { ...event, isJoined: true } : event
                )
              );

              // Send notification to admin
              const adminNotificationsRef = ref(database, "adminNotifications");
              push(adminNotificationsRef, {
                message: `User ${user.displayName || user.email} joined event ${
                  eventData.title
                }`,
                timestamp: Date.now(),
                type: "user_joined_event",
              });
            })
            .catch((error) => {
              console.error("Error joining event:", error);
              showErrorMessage("Failed to join event. Please try again.");
            });
        } else {
          showErrorMessage("Event not found. Please try again.");
        }
      },
      {
        onlyOnce: true,
      }
    );
  };

  const handleLeaveEvent = (eventId) => {
    if (!user) {
      showErrorMessage("You must be logged in to leave an event.");
      return;
    }

    const eventRef = ref(database, `events/${eventId}`);
    const userEventRef = ref(
      database,
      `events/${eventId}/participants/${user.uid}`
    );

    remove(userEventRef)
      .then(() => {
        showSuccessMessage("You have successfully left the event!");
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, isJoined: false } : event
          )
        );

        // Send notification to admin
        const adminNotificationsRef = ref(database, "adminNotifications");
        push(adminNotificationsRef, {
          message: `User ${user.displayName || user.email} left event ${
            events.find((e) => e.id === eventId).title
          }`,
          timestamp: Date.now(),
          type: "user_left_event",
        });
      })
      .catch((error) => {
        console.error("Error leaving event:", error);
        showErrorMessage("Failed to leave event. Please try again.");
      });
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!user || !feedback.trim()) return;

    const feedbackRef = ref(database, "feedbacks");
    const newFeedbackRef = push(feedbackRef);
    set(newFeedbackRef, {
      userId: user.uid,
      userName: userName,
      feedback: feedback,
      timestamp: Date.now(),
      status: "pending",
    })
      .then(() => {
        setFeedback("");
        showSuccessMessage("Feedback submitted successfully!");

        // Send notification to admin
        const adminNotificationsRef = ref(database, "adminNotifications");
        push(adminNotificationsRef, {
          message: `New feedback submitted by ${userName}`,
          timestamp: Date.now(),
          type: "new_feedback",
        });
      })
      .catch((error) => {
        console.error("Error submitting feedback:", error);
        showErrorMessage("Failed to submit feedback. Please try again.");
      });
  };

  const showSuccessMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const showErrorMessage = (message) => {
    setModalContent({
      title: "Error",
      content: <p>{message}</p>,
    });
    setIsModalOpen(true);
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleClearAllNotifications = () => {
    if (!user) return;

    const userNotificationsRef = ref(database, `notifications/${user.uid}`);
    remove(userNotificationsRef)
      .then(() => {
        showSuccessMessage("All notifications cleared successfully!");
      })
      .catch((error) => {
        console.error("Error clearing notifications:", error);
        showErrorMessage("Failed to clear notifications. Please try again.");
      });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-gray-600 dark:text-gray-400">
          Please log in to access the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
      >
        {modalContent.content}
      </Modal>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            {popupMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Welcome, {userName}!
        </h1>

        <div className="mb-6 flex space-x-2 overflow-x-auto">
          <TabButton
            active={activeTab === "events"}
            onClick={() => setActiveTab("events")}
          >
            <FaCalendarAlt className="inline-block mr-2" />
            Events
          </TabButton>
          <TabButton
            active={activeTab === "groups"}
            onClick={() => setActiveTab("groups")}
          >
            <FaUsers className="inline-block mr-2" />
            Groups
          </TabButton>
          <TabButton
            active={activeTab === "polls"}
            onClick={() => setActiveTab("polls")}
          >
            <FaClipboardList className="inline-block mr-2" />
            Polls
          </TabButton>
          <TabButton
            active={activeTab === "suggestions"}
            onClick={() => setActiveTab("suggestions")}
          >
            <FaComment className="inline-block mr-2" />
            Activity Suggestions
          </TabButton>
        </div>

        {activeTab === "events" && (
          <div>
            {user.isAdmin && (
              <Section
                title={editingEvent ? "Edit Event" : "Schedule New Event"}
                isOpen={openSections.newEvent}
                toggleOpen={() => toggleSection("newEvent")}
              >
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
                      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                        className="mt-1 block w-full px-3 py-2 text-gray-700 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={newEvent.location}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white text-gray-700 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                  >
                    {editingEvent ? "Update Event" : "Schedule Event"}
                  </button>
                </form>
              </Section>
            )}

            <Section
              title="Event List"
              isOpen={openSections.eventList}
              toggleOpen={() => toggleSection("eventList")}
            >
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md pr-10 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                  <FaSearch className="absolute right-3 top-3 text-gray-400" />
                </div>
              </div>
              {filteredEvents.length > 0 ? (
                <ul className="space-y-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                  {filteredEvents.map((event) => (
                    <li
                      key={event.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Start:{" "}
                          {new Date(event.startDateTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          End: {new Date(event.endDateTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <FaMapMarkerAlt className="inline mr-1" />
                          {event.location}
                        </p>
                      </div>
                      <div className="flex space-x-2 mt-2 sm:mt-0">
                        {user.isAdmin ? (
                          <>
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-300"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
                            >
                              <FaTrash />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() =>
                              event.isJoined
                                ? handleLeaveEvent(event.id)
                                : handleJoinEvent(event.id)
                            }
                            className={`px-4 py-2 rounded-md transition-colors duration-300 text-lg ${
                              event.isJoined
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            {event.isJoined ? <FaUserMinus /> : <FaUserPlus />}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  No events found.
                </p>
              )}
            </Section>
          </div>
        )}

        {activeTab === "groups" && (
          <Section
            title="Group Scheduler"
            isOpen={openSections.groupScheduler}
            toggleOpen={() => toggleSection("groupScheduler")}
          >
            <GroupScheduler />
          </Section>
        )}

        {activeTab === "polls" && (
          <Section
            title="Polls and Voting"
            isOpen={openSections.pollsAndVoting}
            toggleOpen={() => toggleSection("pollsAndVoting")}
          >
            <PollsAndVoting />
          </Section>
        )}

        {activeTab === "suggestions" && (
          <Section
            title="Activity Suggestions"
            isOpen={openSections.activitySuggestions}
            toggleOpen={() => toggleSection("activitySuggestions")}
          >
            <ActivitySuggestions />
          </Section>
        )}

        <Section
          title="Notifications"
          isOpen={openSections.notifications}
          toggleOpen={() => toggleSection("notifications")}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Your Notifications
            </h3>
            <button
              onClick={handleClearAllNotifications}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
            >
              Clear All
            </button>
          </div>
          <NotificationManager />
        </Section>

        <Section
          title="Feedback"
          isOpen={openSections.feedback}
          toggleOpen={() => toggleSection("feedback")}
        >
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Your Feedback
              </label>
              <textarea
                id="feedback"
                name="feedback"
                rows="4"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
                placeholder="Share your thoughts, suggestions, or report issues..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              Submit Feedback
            </button>
          </form>
        </Section>
      </div>
    </div>
  );
}
