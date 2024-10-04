// src/pages/Home.jsx
import React from "react";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="hero min-h-screen bg-gradient-to-r from-primary to-secondary dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-white mb-8">
          Welcome to Weekend Planner
        </h1>
        <p className="text-xl text-white mb-12">
          Plan your weekends with ease and make the most of your free time!
        </p>
        {user ? (
          <Link
            to="/dashboard"
            className="bg-white text-primary dark:bg-gray-800 dark:text-white font-bold py-3 px-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
};

export default Home;
