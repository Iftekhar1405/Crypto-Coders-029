"use client";

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
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const PollsAndVoting = () => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ title: "", options: ["", ""] });
  const [showAddPoll, setShowAddPoll] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [error, setError] = useState(null);
  const [expandedPoll, setExpandedPoll] = useState(null);

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
            delete updatedOptions[optionIndex].votes[user.uid];
          } else {
            updatedOptions[optionIndex].votes[user.uid] = true;
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

  const handleDeleteOption = (pollId, optionIndex) => {
    if (!user || !user.isAdmin) {
      setError("You must be an admin to delete poll options.");
      return;
    }

    const pollRef = ref(database, `polls/${pollId}`);
    onValue(
      pollRef,
      (snapshot) => {
        const pollData = snapshot.val();
        if (pollData && pollData.options) {
          const updatedOptions = { ...pollData.options };
          delete updatedOptions[optionIndex];
          update(pollRef, { options: updatedOptions })
            .then(() => {
              setError(null);
            })
            .catch((error) => {
              console.error("Error deleting poll option:", error);
              setError("Failed to delete poll option. Please try again.");
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

  const togglePollExpansion = (pollId) => {
    setExpandedPoll(expandedPoll === pollId ? null : pollId);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 flex items-center w-full sm:w-auto justify-center sm:justify-start"
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
                className="w-full p-2 mb-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />
              {newPoll.options.map((option, index) => (
                <div key={index} className="flex mb-2 flex-col sm:flex-row">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newPoll.options];
                      newOptions[index] = e.target.value;
                      setNewPoll({ ...newPoll, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-grow p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-800 mb-2 sm:mb-0 sm:mr-2"
                  />
                  <button
                    onClick={() => {
                      const newOptions = newPoll.options.filter(
                        (_, i) => i !== index
                      );
                      setNewPoll({ ...newPoll, options: newOptions });
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex flex-col sm:flex-row mt-2">
                <button
                  onClick={() =>
                    setNewPoll({
                      ...newPoll,
                      options: [...newPoll.options, ""],
                    })
                  }
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 mb-2 sm:mb-0 sm:mr-2 w-full sm:w-auto"
                >
                  Add Option
                </button>
                <button
                  onClick={handleAddPoll}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
                >
                  {editingPoll ? "Update Poll" : "Create Poll"}
                </button>
              </div>
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
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => togglePollExpansion(poll.id)}
              >
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {poll.title}
                </h3>
                {expandedPoll === poll.id ? <FaChevronUp /> : <FaChevronDown />}
              </div>
              <AnimatePresence>
                {expandedPoll === poll.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ul className="space-y-4 mt-4">
                      {Object.entries(poll.options).map(([index, option]) => (
                        <li
                          key={index}
                          className="flex flex-col sm:flex-row sm:items-center bg-blue-500 dark:blue-500 rounded-lg p-4 shadow-md"
                        >
                          <div className="flex-grow mb-2 sm:mb-0 sm:mr-4">
                            <button
                              onClick={() => handleVote(poll.id, index)}
                              className={`w-full text-left px-4 py-2 rounded transition duration-300 ${
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
                          </div>
                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                            <span className="text-gray-600 dark:text-gray-300 mr-4 font-semibold text-lg">
                              {option.votes
                                ? Object.keys(option.votes).length
                                : 0}{" "}
                              votes
                            </span>
                            {user && user.isAdmin && (
                              <button
                                onClick={() =>
                                  handleDeleteOption(poll.id, index)
                                }
                                className="bg-red-500 text-white px-3 py-2 rounded-full hover:bg-red-600 transition duration-300"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    {user && user.isAdmin && (
                      <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleEditPoll(poll)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300 flex items-center justify-center"
                        >
                          <FaEdit className="mr-2" /> Edit Poll
                        </button>
                        <button
                          onClick={() => handleDeletePoll(poll.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 flex items-center justify-center"
                        >
                          <FaTrash className="mr-2" /> Delete Poll
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PollsAndVoting;
