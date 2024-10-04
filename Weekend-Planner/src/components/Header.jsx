// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import DarkModeToggle from "./DarkModeToggle";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-primary dark:text-white"
        >
          Weekend Planner
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/activities"
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
              >
                Activities
              </Link>
              <Link
                to="/groups"
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
              >
                Groups
              </Link>
              {user.isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="bg-secondary text-white px-4 py-2 rounded hover:bg-secondary-dark transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
              >
                Register
              </Link>
              <Link
                to="/"
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
              >
                Login
              </Link>
            </>
          )}
          <DarkModeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
