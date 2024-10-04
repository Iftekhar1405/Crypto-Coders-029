import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { useAuth } from "../hooks/useAuth";
import GroupScheduler from "../components/GroupScheduler";

export default function Groups({ darkMode }) {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const groupsRef = ref(database, "groups");
    const unsubscribe = onValue(groupsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const groupsList = Object.entries(data).map(([id, group]) => ({
          id,
          ...group,
          members: group.members ? Object.values(group.members) : [],
        }));
        setGroups(groupsList);
      } else {
        setGroups([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleGroupSubmit = (e) => {
    e.preventDefault();
    if (!user) return;

    const groupsRef = ref(database, "groups");
    const newGroupRef = push(groupsRef);
    set(newGroupRef, {
      ...newGroup,
      createdBy: user.uid,
      members: [user.uid],
      createdAt: Date.now(),
    });
    setNewGroup({ name: "", description: "" });
  };

  const handleJoinGroup = (groupId) => {
    if (!user || user.isAdmin) return;

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    if (group.members.includes(user.uid)) {
      alert("You're already a member of this group.");
      return;
    }

    const groupRef = ref(database, `groups/${groupId}`);
    const updatedMembers = [...group.members, user.uid];
    update(groupRef, { members: updatedMembers });
  };

  const handleLeaveGroup = (groupId) => {
    if (!user || user.isAdmin) return;

    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    if (!group.members.includes(user.uid)) {
      alert("You're not a member of this group.");
      return;
    }

    const groupRef = ref(database, `groups/${groupId}`);
    const updatedMembers = group.members.filter((id) => id !== user.uid);
    update(groupRef, { members: updatedMembers });
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${darkMode ? "dark" : ""}`}>
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Groups
      </h1>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          Create New Group
        </h2>
        <form onSubmit={handleGroupSubmit} className="space-y-4">
          <input
            type="text"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            placeholder="Group Name"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          <textarea
            value={newGroup.description}
            onChange={(e) =>
              setNewGroup({ ...newGroup, description: e.target.value })
            }
            placeholder="Description"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Create Group
          </button>
        </form>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          All Groups
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {group.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {group.description}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Members: {group.members.length}
              </p>
              {!user.isAdmin &&
                (group.members.includes(user.uid) ? (
                  <button
                    onClick={() => handleLeaveGroup(group.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                  >
                    Leave Group
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                  >
                    Join Group
                  </button>
                ))}
            </div>
          ))}
        </div>
      </div>

      <GroupScheduler darkMode={darkMode} />
    </div>
  );
}
