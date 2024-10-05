import React, { useState, useEffect, useCallback } from "react";
import { database } from "../utils/firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaUsers,
  FaUserPlus,
  FaUserMinus,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
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

export default function Groups({ darkMode }) {
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);

  const fetchGroups = useCallback(() => {
    if (!user) return;

    const groupsRef = ref(database, "groups");
    const userGroupsRef = ref(database, `users/${user.uid}/groups`);

    const unsubscribeGroups = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupList = Object.entries(data).map(([id, group]) => ({
          id,
          ...group,
          membersCount: group.members ? Object.keys(group.members).length : 0,
        }));
        setGroups(groupList);
      } else {
        setGroups([]);
      }
    });

    const unsubscribeUserGroups = onValue(userGroupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserGroups(Object.keys(data));
      } else {
        setUserGroups([]);
      }
    });

    return () => {
      unsubscribeGroups();
      unsubscribeUserGroups();
    };
  }, [user]);

  useEffect(() => {
    const unsubscribe = fetchGroups();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchGroups]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.isAdmin) return;

    const groupsRef = ref(database, "groups");
    const groupData = {
      ...newGroup,
      createdBy: user.uid,
      members: {},
      createdAt: Date.now(),
    };

    try {
      if (editingGroup) {
        await update(ref(database, `groups/${editingGroup.id}`), groupData);
        setModalContent({
          title: "Success",
          content: <p>Group updated successfully!</p>,
        });
      } else {
        const newGroupRef = await push(groupsRef, groupData);
        setModalContent({
          title: "Success",
          content: <p>Group created successfully!</p>,
        });
      }

      setIsModalOpen(true);
      setNewGroup({ name: "", description: "" });
      setEditingGroup(null);
      fetchGroups();

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
                message: editingGroup
                  ? `Group "${groupData.name}" has been updated`
                  : `New group "${groupData.name}" has been created`,
                timestamp: Date.now(),
                type: editingGroup ? "group_updated" : "group_created",
              });
            }
          }
        },
        { onlyOnce: true }
      );
    } catch (error) {
      console.error("Error creating/updating group:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to create/update group. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!user) return;
    try {
      await update(ref(database, `groups/${groupId}/members/${user.uid}`), {
        joined: true,
      });
      await update(ref(database, `users/${user.uid}/groups/${groupId}`), {
        joined: true,
      });
      fetchGroups();
      setModalContent({
        title: "Success",
        content: <p>You have successfully joined the group!</p>,
      });
      setIsModalOpen(true);

      const adminNotificationsRef = ref(database, "adminNotifications");
      await push(adminNotificationsRef, {
        message: `User ${user.displayName || user.email} joined group ${
          groups.find((g) => g.id === groupId).name
        }`,
        timestamp: Date.now(),
        type: "user_joined_group",
      });
    } catch (error) {
      console.error("Error joining group:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to join group. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    if (!user) return;
    try {
      await remove(ref(database, `groups/${groupId}/members/${user.uid}`));
      await remove(ref(database, `users/${user.uid}/groups/${groupId}`));
      fetchGroups();
      setModalContent({
        title: "Success",
        content: <p>You have successfully left the group.</p>,
      });
      setIsModalOpen(true);

      const adminNotificationsRef = ref(database, "adminNotifications");
      await push(adminNotificationsRef, {
        message: `User ${user.displayName || user.email} left group ${
          groups.find((g) => g.id === groupId).name
        }`,
        timestamp: Date.now(),
        type: "user_left_group",
      });
    } catch (error) {
      console.error("Error leaving group:", error);
      setModalContent({
        title: "Error",
        content: <p>Failed to leave group. Please try again.</p>,
      });
      setIsModalOpen(true);
    }
  };

  const handleUpdateGroup = (groupId) => {
    if (!user || !user.isAdmin) return;

    const groupToUpdate = groups.find((group) => group.id === groupId);
    if (!groupToUpdate) return;

    setEditingGroup(groupToUpdate);
    setNewGroup({
      name: groupToUpdate.name,
      description: groupToUpdate.description,
    });
    setModalContent({
      title: "Update Group",
      content: (
        <form onSubmit={handleGroupSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Group Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newGroup.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              value={newGroup.description}
              onChange={handleInputChange}
              required
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
          >
            Update Group
          </button>
        </form>
      ),
    });
    setIsModalOpen(true);
  };

  const handleDeleteGroup = (groupId) => {
    if (!user || !user.isAdmin) return;

    setModalContent({
      title: "Confirm Deletion",
      content: (
        <div>
          <p>Are you sure you want to delete this group?</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={async () => {
                try {
                  await remove(ref(database, `groups/${groupId}`));
                  fetchGroups();
                  setIsModalOpen(false);
                  setModalContent({
                    title: "Success",
                    content: <p>Group deleted successfully!</p>,
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
                            message: `A group has been deleted`,
                            timestamp: Date.now(),
                            type: "group_deleted",
                          });
                        }
                      }
                    },
                    { onlyOnce: true }
                  );
                } catch (error) {
                  console.error("Error deleting group:", error);
                  setModalContent({
                    title: "Error",
                    content: <p>Failed to delete group. Please try again.</p>,
                  });
                  setIsModalOpen(true);
                }
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

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? "dark" : ""}`}>
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
        className="text-4xl font-bold mb-8 text-gray-800 dark:text-white"
      >
        Groups
      </motion.h1>

      {user && user.isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
            {editingGroup ? "Edit Group" : "Create New Group"}
          </h2>
          <form onSubmit={handleGroupSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Group Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newGroup.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                value={newGroup.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
            >
              {editingGroup ? "Update Group" : "Create Group"}
            </button>
          </form>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-4 flex items-center"
      >
        <input
          type="text"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <FaSearch className="text-gray-400 -ml-8" />
      </motion.div>

      {filteredGroups.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredGroups.map((group) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                  {group.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {group.description}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Members: {group.membersCount}
                </p>
                {user ? (
                  userGroups.includes(group.id) ? (
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center transition-colors duration-300"
                    >
                      <FaUserMinus className="mr-2" /> Leave Group
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center transition-colors duration-300"
                    >
                      <FaUserPlus className="mr-2" /> Join Group
                    </button>
                  )
                ) : (
                  <Link
                    to="/login"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center transition-colors duration-300"
                  >
                    <FaUsers className="mr-2" /> Login to Join
                  </Link>
                )}
                {user && user.isAdmin && (
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => handleUpdateGroup(group.id)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-300"
                    >
                      <FaEdit className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-300"
                    >
                      <FaTrash className="mr-2" /> Delete
                    </button>
                  </div>
                )}
              </motion.div>
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
          No groups available.
        </motion.p>
      )}
    </div>
  );
}
