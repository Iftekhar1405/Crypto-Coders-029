// src/components/SupportFeedback.jsx
import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, push, onValue, off, update } from "firebase/database";

const SupportFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState("");

  useEffect(() => {
    const feedbacksRef = ref(database, "feedbacks");
    onValue(feedbacksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFeedbacks(
          Object.entries(data).map(([id, feedback]) => ({ id, ...feedback }))
        );
      }
    });

    return () => {
      off(feedbacksRef);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newFeedback.trim()) {
      const feedbacksRef = ref(database, "feedbacks");
      push(feedbacksRef, {
        message: newFeedback,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setNewFeedback("");
    }
  };

  const handleStatusChange = (feedbackId, newStatus) => {
    const feedbackRef = ref(database, `feedbacks/${feedbackId}`);
    update(feedbackRef, { status: newStatus });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Support and Feedback
      </h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newFeedback}
          onChange={(e) => setNewFeedback(e.target.value)}
          placeholder="Enter your feedback or support request"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          rows="4"
        ></textarea>
        <button
          type="submit"
          className="mt-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          Submit Feedback
        </button>
      </form>
      <ul className="space-y-4">
        {feedbacks.map((feedback) => (
          <li
            key={feedback.id}
            className="bg-gray-100 dark:bg-gray-700 p-4 rounded"
          >
            <p className="mb-2 text-gray-800 dark:text-gray-200">
              {feedback.message}
            </p>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm ${
                  feedback.status === "resolved"
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-600 dark:text-yellow-400"
                }`}
              >
                Status: {feedback.status}
              </span>
              <div>
                <button
                  onClick={() => handleStatusChange(feedback.id, "in-progress")}
                  className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600 transition-colors mr-2"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(feedback.id, "resolved")}
                  className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                >
                  Resolved
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupportFeedback;
