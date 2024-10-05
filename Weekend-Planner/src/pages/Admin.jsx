import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import UserManagement from "../components/UserManagement";
import EventAnalytics from "../components/EventAnalytics";
import SupportFeedback from "../components/SupportFeedback";
import { motion } from "framer-motion";
import { FaUsers, FaChartBar, FaComments, FaBell } from "react-icons/fa";

const AdminCard = ({ icon, title, children }) => (
  <motion.div
    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02 }}
  >
    <div className="p-6">
      <div className="flex items-center mb-4">
        {icon}
        <h2 className="text-xl font-semibold ml-2 text-gray-800 dark:text-white">
          {title}
        </h2>
      </div>
      {children}
    </div>
  </motion.div>
);

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEvents: 0,
    pendingFeedbacks: 0,
  });

  useEffect(() => {
    // Simulating API call to fetch admin stats
    const fetchStats = async () => {
      // Replace this with actual API call
      const response = await new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              totalUsers: 1250,
              activeEvents: 87,
              pendingFeedbacks: 23,
            }),
          1000
        )
      );
      setStats(response);
    };

    fetchStats();
  }, []);

  if (!user || !user.isAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center h-screen text-center py-8 text-gray-800 dark:text-gray-200"
      >
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>You must be an admin to view this page.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.h1
        className="text-4xl font-bold mb-8 text-gray-800 dark:text-white"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        Admin Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AdminCard
          icon={<FaUsers className="text-blue-500 text-2xl" />}
          title="Total Users"
        >
          <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">
            {stats.totalUsers}
          </p>
        </AdminCard>
        <AdminCard
          icon={<FaChartBar className="text-green-500 text-2xl" />}
          title="Active Events"
        >
          <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">
            {stats.activeEvents}
          </p>
        </AdminCard>
        <AdminCard
          icon={<FaComments className="text-yellow-500 text-2xl" />}
          title="Pending Feedbacks"
        >
          <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">
            {stats.pendingFeedbacks}
          </p>
        </AdminCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AdminCard
          icon={<FaUsers className="text-blue-500 text-2xl" />}
          title="User Management"
        >
          <UserManagement />
        </AdminCard>
        <AdminCard
          icon={<FaChartBar className="text-green-500 text-2xl" />}
          title="Event Analytics"
        >
          <EventAnalytics />
        </AdminCard>
        <AdminCard
          icon={<FaComments className="text-yellow-500 text-2xl" />}
          title="Support & Feedback"
        >
          <SupportFeedback />
        </AdminCard>
        <AdminCard
          icon={<FaBell className="text-purple-500 text-2xl" />}
          title="Recent Notifications"
        >
          <motion.ul className="space-y-2">
            {[
              "New user registration: John Doe",
              "Event 'Summer Picnic' created",
              "Feedback received for 'City Tour'",
              "User reported issue with group chat",
            ].map((notification, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-100 dark:bg-gray-700 p-2 rounded"
              >
                {notification}
              </motion.li>
            ))}
          </motion.ul>
        </AdminCard>
      </div>
    </motion.div>
  );
};

export default Admin;
