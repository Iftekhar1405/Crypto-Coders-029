"use client";

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
  FaChevronDown,
  FaChevronUp,
  FaCalendar,
} from "react-icons/fa";

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
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          <div className="text-gray-800 dark:text-gray-200">{children}</div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const GroupCard = ({
  group,
  user,
  onJoin,
  onLeave,
  onUpdate,
  onDelete,
  isExpanded,
  onToggle,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="bg-gray-100  bg-gradient-to-r from-purple-900 to-blue-900 dark:bg-gradient-to-r from-purple-900 to-blue-900  p-6 rounded-lg shadow-lg transform hover:shadow-xl transition-all duration-300 "
  >
    <div
      className="flex justify-between items-center cursor-pointer"
      onClick={onToggle}
    >
      <h3 className="text-xl font-bold mb-2  text-white dark:text-white">
        {group.name}
      </h3>
      <motion.div
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <FaChevronDown className="text-gray-600 dark:text-gray-400" />
      </motion.div>
    </div>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-gray-300 dark:text-gray-300 mb-4">
            {group.description}
          </p>
          <p className="text-gray-300 dark:text-gray-300 mb-4">
            Members: {group.membersCount}
          </p>
          <p className="text-gray-300 dark:text-gray-300 mb-4 flex items-center">
            <FaCalendar className="mr-2" />
            {new Date(group.createdAt).toLocaleDateString()}
          </p>
          {user ? (
            group.members && group.members[user.uid] ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onLeave(group.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center transition-colors duration-300"
              >
                <FaUserMinus className="mr-2" /> Leave Group
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onJoin(group.id)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full flex items-center justify-center transition-colors duration-300"
              >
                <FaUserPlus className="mr-2" /> Join Group
              </motion.button>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdate(group)}
                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-300"
              >
                <FaEdit className="mr-2" /> Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(group.id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-300"
              >
                <FaTrash className="mr-2" /> Delete
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
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

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    createdAt: "",
  });
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    content: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 9;
  const [openSections, setOpenSections] = useState({
    newGroup: false,
    groupList: true,
  });

  const fetchGroups = useCallback(() => {
    const groupsRef = ref(database, "groups");
    return onValue(groupsRef, (snapshot) => {
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
  }, []);

  useEffect(() => {
    const unsubscribe = fetchGroups();
    return () => unsubscribe();
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
      createdAt: newGroup.createdAt || new Date().toISOString().split("T")[0],
    };

    try {
      if (editingGroup) {
        await update(ref(database, `groups/${editingGroup.id}`), groupData);
        setModalContent({
          title: "Success",
          content: <p>Group updated successfully!</p>,
        });
      } else {
        await push(groupsRef, groupData);
        setModalContent({
          title: "Success",
          content: <p>Group created successfully!</p>,
        });
      }

      setIsModalOpen(true);
      setNewGroup({ name: "", description: "", createdAt: "" });
      setEditingGroup(null);
      fetchGroups();

      // Send notification to all users
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
      fetchGroups();
      setModalContent({
        title: "Success",
        content: <p>You have successfully joined the group!</p>,
      });
      setIsModalOpen(true);

      // Send notification to admin
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
      fetchGroups();
      setModalContent({
        title: "Success",
        content: <p>You have successfully left the group.</p>,
      });
      setIsModalOpen(true);

      // Send notification to admin
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

  const handleUpdateGroup = (group) => {
    if (!user || !user.isAdmin) return;

    setEditingGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description,
      createdAt: group.createdAt,
    });
    setOpenSections((prev) => ({ ...prev, newGroup: true }));
  };

  const handleDeleteGroup = (groupId) => {
    if (!user || !user.isAdmin) return;

    setModalContent({
      title: "Confirm Deletion",
      content: (
        <div>
          <p>Are you sure you want to delete this group?</p>
          <div className="flex justify-end mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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

                  // Send notification to all users
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
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-300"
            >
              Cancel
            </motion.button>
          </div>
        </div>
      ),
    });
    setIsModalOpen(true);
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastGroup = currentPage * groupsPerPage;
  const indexOfFirstGroup = indexOfLastGroup - groupsPerPage;
  const currentGroups = filteredGroups.slice(
    indexOfFirstGroup,
    indexOfLastGroup
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
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
        className="text-4xl font-bold mb-8  text-white dark:text-white"
      >
        Groups
      </motion.h1>

      {user && user.isAdmin && (
        <Section
          title={editingGroup ? "Edit Group" : "Create New Group"}
          isOpen={openSections.newGroup}
          toggleOpen={() => toggleSection("newGroup")}
        >
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
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                rows="6"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="createdAt"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Creation Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="createdAt"
                  name="createdAt"
                  value={newGroup.createdAt}
                  onChange={handleInputChange}
                  required
                  className="block w-full pl-10 h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-gradient-to-r from-purple-900 to-blue-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300"
            >
              {editingGroup ? "Update Group" : "Create Group"}
            </motion.button>
          </form>
        </Section>
      )}

      <Section
        title="Group List"
        isOpen={openSections.groupList}
        toggleOpen={() => toggleSection("groupList")}
      >
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
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <FaSearch className="text-gray-400 -ml-8" />
        </motion.div>

        {currentGroups.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {currentGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  user={user}
                  onJoin={handleJoinGroup}
                  onLeave={handleLeaveGroup}
                  onUpdate={handleUpdateGroup}
                  onDelete={handleDeleteGroup}
                  isExpanded={expandedGroup === group.id}
                  onToggle={() =>
                    setExpandedGroup(
                      expandedGroup === group.id ? null : group.id
                    )
                  }
                />
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

        {filteredGroups.length > groupsPerPage && (
          <div className="flex justify-center mt-8">
            {Array.from({
              length: Math.ceil(filteredGroups.length / groupsPerPage),
            }).map((_, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => paginate(index + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </motion.button>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
