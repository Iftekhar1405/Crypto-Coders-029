import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { database } from "../utils/firebase";
import { ref, onValue, push, set, remove, update } from "firebase/database";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPoll,
  FaTrash,
  FaPlus,
  FaEdit,
  FaVoteYea,
  FaTimes,
} from "react-icons/fa";

const PollsAndVoting = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ title: "", options: ["", ""] });
  const [showAddPoll, setShowAddPoll] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const pollsRef = ref(database, "polls");
    const unsubscribe = onValue(pollsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pollsList = Object.entries(data).map(([id, poll]) => ({
          id,
          ...poll,
        }));
        setPolls(pollsList);
      } else {
        setPolls([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleVote = (pollId, optionIndex) => {
    if (!user) {
      setError("You must be logged in to vote.");
      return;
    }

    const pollRef = ref(database, `polls/${pollId}`);
    onValue(
      pollRef,
      (snapshot) => {
        const pollData = snapshot.val();
        if (pollData && pollData.options) {
          const updatedOptions = { ...pollData.options };
          if (!updatedOptions[optionIndex].votes) {
            updatedOptions[optionIndex].votes = {};
          }

          if (updatedOptions[optionIndex].votes[user.uid]) {
            // User has already voted, so remove their vote
            delete updatedOptions[optionIndex].votes[user.uid];
          } else {
            // User hasn't voted, so add their vote
            updatedOptions[optionIndex].votes[user.uid] = true;

            // Remove vote from other options
            Object.keys(updatedOptions).forEach((key) => {
              if (
                key !== optionIndex &&
                updatedOptions[key].votes &&
                updatedOptions[key].votes[user.uid]
              ) {
                delete updatedOptions[key].votes[user.uid];
              }
            });
          }

          update(pollRef, { options: updatedOptions })
            .then(() => {
              setError(null);
            })
            .catch((error) => {
              console.error("Error updating vote:", error);
              setError("Failed to update vote. Please try again.");
            });
        } else {
          setError("Poll not found or invalid poll structure.");
        }
      },
      {
        onlyOnce: true,
      }
    );
  };

  const handleAddPoll = () => {
    if (!user || !user.isAdmin) {
      setError("You must be an admin to add or edit polls.");
      return;
    }

    const pollsRef = ref(database, "polls");
    const pollData = {
      ...newPoll,
      createdBy: user.uid,
      createdAt: Date.now(),
      options: newPoll.options.reduce((acc, option, index) => {
        acc[index] = { text: option, votes: {} };
        return acc;
      }, {}),
    };

    if (editingPoll) {
      const pollRef = ref(database, `polls/${editingPoll.id}`);
      update(pollRef, pollData)
        .then(() => {
          setEditingPoll(null);
          setError(null);
          setShowAddPoll(false);
        })
        .catch((error) => {
          console.error("Error updating poll:", error);
          setError("Failed to update poll. Please try again.");
        });
    } else {
      push(pollsRef, pollData)
        .then(() => {
          setError(null);
          setShowAddPoll(false);
        })
        .catch((error) => {
          console.error("Error adding poll:", error);
          setError("Failed to create poll. Please try again.");
        });
    }

    setNewPoll({ title: "", options: ["", ""] });
  };

  const handleDeletePoll = (pollId) => {
    if (!user || !user.isAdmin) {
      setError("You must be an admin to delete polls.");
      return;
    }

    const pollRef = ref(database, `polls/${pollId}`);
    remove(pollRef)
      .then(() => {
        setError(null);
      })
      .catch((error) => {
        console.error("Error deleting poll:", error);
        setError("Failed to delete poll. Please try again.");
      });
  };

  const handleEditPoll = (poll) => {
    setEditingPoll(poll);
    setNewPoll({
      title: poll.title,
      options: Object.values(poll.options).map((option) => option.text),
    });
    setShowAddPoll(true);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center">
        <FaPoll className="mr-2" /> Polls and Voting
      </h2>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {user && user.isAdmin && (
        <div className="mb-4">
          <button
            onClick={() => setShowAddPoll(!showAddPoll)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 flex items-center"
          >
            <FaPlus className="mr-2" /> {editingPoll ? "Edit Poll" : "Add Poll"}
          </button>
          {showAddPoll && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <input
                type="text"
                value={newPoll.title}
                onChange={(e) =>
                  setNewPoll({ ...newPoll, title: e.target.value })
                }
                placeholder="Poll Title"
                className="w-full p-2 mb-2 border rounded"
              />
              {newPoll.options.map((option, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newPoll.options];
                      newOptions[index] = e.target.value;
                      setNewPoll({ ...newPoll, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-grow p-2 border rounded"
                  />
                  <button
                    onClick={() => {
                      const newOptions = newPoll.options.filter(
                        (_, i) => i !== index
                      );
                      setNewPoll({ ...newPoll, options: newOptions });
                    }}
                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setNewPoll({ ...newPoll, options: [...newPoll.options, ""] })
                }
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 mr-2"
              >
                Add Option
              </button>
              <button
                onClick={handleAddPoll}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
              >
                {editingPoll ? "Update Poll" : "Create Poll"}
              </button>
            </div>
          )}
        </div>
      )}
      <div className="space-y-4">
        <AnimatePresence>
          {polls.map((poll) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                {poll.title}
              </h3>
              <ul className="space-y-2">
                {Object.entries(poll.options).map(([index, option]) => (
                  <li key={index} className="flex justify-between items-center">
                    <button
                      onClick={() => handleVote(poll.id, index)}
                      className={`flex-grow text-left px-4 py-2 rounded transition duration-300 ${
                        option.votes && option.votes[user?.uid]
                          ? "bg-green-500 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {option.text}{" "}
                      {option.votes && option.votes[user?.uid] && (
                        <FaVoteYea className="inline-block ml-2" />
                      )}
                    </button>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {option.votes ? Object.keys(option.votes).length : 0}{" "}
                      votes
                    </span>
                  </li>
                ))}
              </ul>
              {user && user.isAdmin && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleEditPoll(poll)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300 flex items-center"
                  >
                    <FaEdit className="mr-2" /> Edit Poll
                  </button>
                  <button
                    onClick={() => handleDeletePoll(poll.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 flex items-center"
                  >
                    <FaTrash className="mr-2" /> Delete Poll
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PollsAndVoting;
