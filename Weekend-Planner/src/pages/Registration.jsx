import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../utils/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { toast } from "react-toastify";
import Modal from "react-modal";
import { FaExclamationCircle } from "react-icons/fa";

Modal.setAppElement("#root");

const Registration = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await set(ref(database, `users/${user.uid}`), {
        email: user.email,
        isAdmin: isAdmin,
      });

      console.log("User registered with isAdmin:", isAdmin);

      toast.success("Registration successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.code === "auth/email-already-in-use") {
        setIsModalOpen(true);
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminCheckbox = (e) => {
    const newIsAdmin = e.target.checked;
    setIsAdmin(newIsAdmin);
    console.log("isAdmin state updated:", newIsAdmin);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goToLogin = () => {
    navigate("./login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary to-secondary dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Register
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAdmin"
              checked={isAdmin}
              onChange={handleAdminCheckbox}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded dark:border-gray-600"
            />
            <label
              htmlFor="isAdmin"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              Register as Admin
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-primary-dark dark:hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
          </span>
          <button
            onClick={goToLogin}
            className="text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary focus:outline-none"
          >
            Log in
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="User Already Exists"
        className="modal"
        overlayClassName="overlay"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-6">
            <FaExclamationCircle className="text-6xl text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            User Already Exists
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
            An account with this email address already exists. Please try
            logging in instead.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={goToLogin}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Go to Login
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Registration;
