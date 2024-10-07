import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { database } from "../utils/firebase";
import { ref, update, remove } from "firebase/database";
import {
  FaUser,
  FaUserShield,
  FaTrash,
  FaEnvelope,
  FaCalendarAlt,
  FaRunning,
  FaUsers,
  FaTimes,
} from "react-icons/fa";

const UserManagement = ({
  users,
  events,
  activities,
  groups,
  onUserUpdate,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getJoinedItems = (user, items) => {
    if (!user || !items) return [];
    return items
      .filter((item) => {
        if (item.participants) {
          return item.participants[user.id];
        }
        if (item.members) {
          return item.members[user.id] && item.members[user.id].joined;
        }
        return false;
      })
      .map((item) => item.title || item.name);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name &&
        user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const userRef = ref(database, `users/${userId}`);
      await update(userRef, { isAdmin: !currentStatus });
      setMessage({
        text: "Admin status updated successfully",
        type: "success",
      });
      if (typeof onUserUpdate === "function") {
        onUserUpdate();
      }
    } catch (error) {
      console.error("Error updating admin status:", error);
      setMessage({ text: "Failed to update admin status", type: "error" });
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const userRef = ref(database, `users/${userId}`);
        await remove(userRef);
        setMessage({ text: "User deleted successfully", type: "success" });
        if (typeof onUserUpdate === "function") {
          onUserUpdate();
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        setMessage({ text: "Failed to delete user", type: "error" });
      }
    }
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            <div className="flex items-center">
              <span className="mr-2">{message.text}</span>
              <button
                onClick={() => setMessage({ text: "", type: "" })}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white p-4 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedUser(selectedUser === user ? null : user)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {user.isAdmin ? (
                  <FaUserShield className="text-blue-500 mr-2 flex-shrink-0" />
                ) : (
                  <FaUser className="text-gray-500 mr-2 flex-shrink-0" />
                )}
                <h3 className="text-lg font-semibold truncate">
                  {user.name || "No Name"}
                </h3>
              </div>
              <span
                className={`text-sm ${
                  user.isAdmin ? "text-blue-500" : "text-gray-500"
                }`}
              >
                {user.isAdmin ? "Admin" : "User"}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2 overflow-hidden">
              <FaEnvelope className="mr-2 flex-shrink-0" />
              <span className="truncate" title={user.email || "No Email"}>
                {user.email || "No Email"}
              </span>
            </div>
            <AnimatePresence>
              {selectedUser === user && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 space-y-2"
                >
                  <div className="text-sm">
                    <div className="flex items-center mb-1">
                      <FaCalendarAlt className="mr-2 flex-shrink-0" />
                      <strong>Joined Events:</strong>
                    </div>
                    <ul className="list-disc list-inside pl-5">
                      {getJoinedItems(user, events).map((event, index) => (
                        <li key={`event-${user.id}-${index}`}>{event}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center mb-1">
                      <FaRunning className="mr-2 flex-shrink-0" />
                      <strong>Activities:</strong>
                    </div>
                    <ul className="list-disc list-inside pl-5">
                      {getJoinedItems(user, activities).map(
                        (activity, index) => (
                          <li key={`activity-${user.id}-${index}`}>
                            {activity}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center mb-1">
                      <FaUsers className="mr-2 flex-shrink-0" />
                      <strong>Groups:</strong>
                    </div>
                    <ul className="list-disc list-inside pl-5">
                      {getJoinedItems(user, groups).map((group, index) => (
                        <li key={`group-${user.id}-${index}`}>{group}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAdminStatus(user.id, user.isAdmin);
                      }}
                      className={`px-2 py-1 rounded text-xs ${
                        user.isAdmin
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white transition-colors`}
                    >
                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUser(user.id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
