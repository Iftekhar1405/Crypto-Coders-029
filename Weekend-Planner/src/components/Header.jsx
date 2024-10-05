import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import {
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
  FaUser,
  FaUserShield,
} from "react-icons/fa";

const Header = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

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

  const menuItems = [
    { to: "/", label: "Home" },
    { to: "/activities", label: "Activities" },
    { to: "/groups", label: "Groups" },
  ];

  if (user) {
    menuItems.push({ to: "/dashboard", label: "Dashboard" });
    menuItems.push({ to: "/profile", label: "Profile" });
    if (user.isAdmin) {
      menuItems.push({ to: "/admin", label: "Admin", icon: <FaUserShield /> });
    }
  }

  const headerVariants = {
    hidden: { y: -100 },
    visible: { y: 0, transition: { type: "spring", stiffness: 100 } },
  };

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
              <Link
                key={item.to}
                to={item.to}
                className={`text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 ${
                  location.pathname === item.to ? "font-bold" : ""
                }`}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
              >
                Logout
              </button>
            ) : null}
            <button
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 mr-4"
            >
              {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
            </button>
            <button
              onClick={toggleMenu}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
        {isOpen && (
          <div className="mt-4 md:hidden">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 ${
                  location.pathname === item.to ? "font-bold" : ""
                }`}
                onClick={toggleMenu}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="block w-full text-left py-2 text-red-500 hover:text-red-600 transition-colors duration-300"
              >
                Logout
              </button>
            ) : null}
          </div>
        )}
      </nav>
    </motion.header>
  );
};

export default Header;
