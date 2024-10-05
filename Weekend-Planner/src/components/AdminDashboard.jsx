import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import { ref, onValue } from "firebase/database";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalActivities: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const usersRef = ref(database, "users");
      const groupsRef = ref(database, "groups");
      const activitiesRef = ref(database, "activities");

      onValue(usersRef, (snapshot) => {
        setStats((prevStats) => ({ ...prevStats, totalUsers: snapshot.size }));
      });

      onValue(groupsRef, (snapshot) => {
        setStats((prevStats) => ({ ...prevStats, totalGroups: snapshot.size }));
      });

      onValue(activitiesRef, (snapshot) => {
        setStats((prevStats) => ({
          ...prevStats,
          totalActivities: snapshot.size,
        }));
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Groups" value={stats.totalGroups} />
        <StatCard title="Total Activities" value={stats.totalActivities} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-gray-100 p-4 rounded-lg">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

export default AdminDashboard;
