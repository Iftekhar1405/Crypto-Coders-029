// src/components/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, onValue, off, update } from "firebase/database";

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(Object.entries(data).map(([id, user]) => ({ id, ...user })));
      }
    });

    return () => {
      off(usersRef);
    };
  }, []);

  const toggleAdminStatus = (userId, currentStatus) => {
    const userRef = ref(database, `users/${userId}`);
    update(userRef, { isAdmin: !currentStatus });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        User Management
      </h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded"
          >
            <span className="text-gray-800 dark:text-gray-200">
              {user.email}
            </span>
            <div>
              <span
                className={`mr-2 ${
                  user.isAdmin
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {user.isAdmin ? "Admin" : "User"}
              </span>
              <button
                onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                className="bg-primary text-white px-2 py-1 rounded text-sm hover:bg-primary-dark transition-colors"
              >
                Toggle Admin
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;
