// src/pages/Admin.jsx
import React from "react";
import { useAuth } from "../hooks/useAuth";
import UserManagement from "../components/UserManagement";
import EventAnalytics from "../components/EventAnalytics";
import SupportFeedback from "../components/SupportFeedback";

const Admin = () => {
  const { user } = useAuth();

  if (!user || !user.isAdmin) {
    return (
      <div className="text-center py-8 text-gray-800 dark:text-gray-200">
        Access denied. You must be an admin to view this page.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UserManagement />
        <EventAnalytics />
        <SupportFeedback />
      </div>
    </div>
  );
};

export default Admin;
