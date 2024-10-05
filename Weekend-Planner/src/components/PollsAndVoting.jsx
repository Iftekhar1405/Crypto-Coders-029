import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import {
  ref,
  push,
  set,
  onValue,
  off,
  runTransaction,
} from "firebase/database";
import { useAuth } from "../hooks/useAuth";

const PollsAndVoting = () => {
  const [polls, setPolls] = useState([]);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollOptions, setNewPollOptions] = useState(["", ""]);
  const { user } = useAuth();

  useEffect(() => {
    const pollsRef = ref(database, "polls");
    onValue(pollsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pollsArray = Object.entries(data).map(([id, poll]) => ({
          id,
          ...poll,
          userVotes: poll.userVotes || {},
        }));
        setPolls(pollsArray);
      }
    });

    return () => {
      off(pollsRef);
    };
  }, []);

  const handleAddOption = () => {
    setNewPollOptions([...newPollOptions, ""]);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newPollOptions];
    updatedOptions[index] = value;
    setNewPollOptions(updatedOptions);
  };

  const handleCreatePoll = () => {
    if (newPollTitle && newPollOptions.every((option) => option.trim())) {
      const pollsRef = ref(database, "polls");
      const newPoll = {
        title: newPollTitle,
        options: newPollOptions.reduce((acc, option) => {
          if (option.trim()) {
            acc[option.trim()] = 0;
          }
          return acc;
        }, {}),
        userVotes: {},
      };
      push(pollsRef, newPoll);
      setNewPollTitle("");
      setNewPollOptions(["", ""]);
    }
  };

  const handleVote = async (pollId, option) => {
    if (!user) {
      alert("Please log in to vote.");
      return;
    }

    const pollRef = ref(database, `polls/${pollId}`);

    try {
      await runTransaction(pollRef, (poll) => {
        if (poll) {
          if (typeof poll.options !== "object") {
            // If options is not an object, initialize it
            poll.options = {};
          }
          if (typeof poll.userVotes !== "object") {
            // If userVotes is not an object, initialize it
            poll.userVotes = {};
          }
          if (typeof poll.userVotes[user.uid] !== "object") {
            // If user's votes is not an object, initialize it
            poll.userVotes[user.uid] = {};
          }

          if (poll.userVotes[user.uid][option]) {
            // Devote
            poll.options[option] = (poll.options[option] || 1) - 1;
            delete poll.userVotes[user.uid][option];
          } else {
            // Vote
            poll.options[option] = (poll.options[option] || 0) + 1;
            poll.userVotes[user.uid][option] = true;
          }
        }
        return poll;
      });
    } catch (error) {
      console.error("Error updating vote:", error);
      alert("An error occurred while voting. Please try again.");
    }
  };

  const getUserVotes = (poll) => {
    return user && poll.userVotes && poll.userVotes[user.uid]
      ? poll.userVotes[user.uid]
      : {};
  };

  const calculatePercentage = (votes, total) => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Polls and Voting
      </h2>
      <div className="mb-6">
        <input
          type="text"
          value={newPollTitle}
          onChange={(e) => setNewPollTitle(e.target.value)}
          placeholder="Poll title"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary mb-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        />
        {newPollOptions.map((option, index) => (
          <input
            key={index}
            type="text"
            value={option}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            placeholder={`Option ${index + 1}`}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary mb-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
        ))}
        <button
          onClick={handleAddOption}
          className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary-dark transition-colors mr-2"
        >
          Add Option
        </button>
        <button
          onClick={handleCreatePoll}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Create Poll
        </button>
      </div>
      <div className="space-y-4">
        {polls.map((poll) => {
          const totalVotes = Object.values(poll.options || {}).reduce(
            (sum, votes) => sum + votes,
            0
          );
          const userVotes = getUserVotes(poll);
          return (
            <div
              key={poll.id}
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
                {poll.title}
              </h3>
              <ul className="space-y-2">
                {Object.entries(poll.options || {}).map(([option, votes]) => {
                  const percentage = calculatePercentage(votes, totalVotes);
                  const isVoted = userVotes[option];
                  return (
                    <li key={option} className="relative">
                      <button
                        onClick={() => handleVote(poll.id, option)}
                        className={`w-full text-left p-2 rounded ${
                          isVoted
                            ? "bg-primary text-white"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white"
                        }`}
                      >
                        <span>{option}</span>
                        <span className="absolute right-2">{votes} votes</span>
                      </button>
                      <div
                        className={`absolute top-0 left-0 h-full ${
                          isVoted
                            ? "bg-primary-dark"
                            : "bg-gray-300 dark:bg-gray-500"
                        }`}
                        style={{ width: `${percentage}%`, opacity: "0.3" }}
                      ></div>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Total votes: {totalVotes}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Your votes: {Object.keys(userVotes).join(", ")}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Click on a voted option to remove your vote.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollsAndVoting;
