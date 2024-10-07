import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon, FaBars, FaTimes, FaLock } from "react-icons/fa";

export default function Header() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const darkModePreference = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkModePreference);
    document.documentElement.classList.toggle("dark", darkModePreference);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const getMenuItems = () => {
    let items = [{ to: "/", label: "Home" }];

    if (user) {
      if (user.isAdmin) {
        items.push({ to: "/admin", label: "Admin" });
      }
      items = [
        ...items,
        { to: "/dashboard", label: "Dashboard" },
        { to: "/activities", label: "Activities" },
        { to: "/groups", label: "Groups" },
        { to: "/profile", label: "Profile" },
      ];
    }

    return items;
  };

  const menuItems = getMenuItems();

  const headerVariants = {
    hidden: { y: -100 },
    visible: { y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const MenuItem = ({ item, onClick }) => (
    <Link
      to={item.to}
      className={`block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 p-2 rounded ${
        location.pathname === item.to
          ? "font-bold bg-gray-200 dark:bg-gray-700"
          : ""
      }`}
      onClick={onClick}
    >
      {item.label}
    </Link>
  );

  const LoginPrompt = () => (
    <AnimatePresence>
      {showLoginPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowLoginPrompt(false)}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center"
            onClick={(e) => e.stopPropagation()}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FaLock className="text-4xl text-blue-500 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Login Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please log in to access this feature.
            </p>
            <button
              onClick={() => {
                setShowLoginPrompt(false);
                navigate("/login");
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
            >
              Log In
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.header
      className="bg-white dark:bg-gray-800 shadow-md"
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-gray-800 dark:text-white"
          >
            Weekend Planner
          </Link>
          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
              <MenuItem key={item.to} item={item} />
            ))}
            {user ? (
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                Login
              </Link>
            )}
            <button
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 mr-4"
              aria-label={
                isDarkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
            <button
              onClick={toggleMenu}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {menuItems.map((item) => (
              <MenuItem key={item.to} item={item} onClick={toggleMenu} />
            ))}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="block w-full text-left text-red-500 hover:text-red-600 transition-colors duration-300 p-2 rounded"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="block w-full text-left text-blue-500 hover:text-blue-600 transition-colors duration-300 p-2 rounded"
                onClick={toggleMenu}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
      <LoginPrompt />
    </motion.header>
  );
}
