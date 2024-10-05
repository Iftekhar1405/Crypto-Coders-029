// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-gray-100 dark:text-gray-400 mb-6">
          Welcome to{" "}
          <span className="text-primary">
            Weekend
            <br />
            Planner
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Plan your weekends with ease and make the most of your free time!
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="space-y-4 md:space-y-0 md:space-x-4"
      >
        {user ? (
          <Link
            to="/dashboard"
            className="bg-primary text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primary-dark transition-colors duration-300 inline-block"
          >
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-primary text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-primary-dark transition-colors duration-300 inline-block"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-secondary text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-secondary-dark transition-colors duration-300 inline-block"
            >
              Register
            </Link>
          </>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {[
          { title: "Plan Activities", icon: "🎉" },
          { title: "Join Groups", icon: "👥" },
          { title: "Discover Events", icon: "🔍" },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center"
            data-aos="fade-up"
            data-aos-delay={index * 100}
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Home;
