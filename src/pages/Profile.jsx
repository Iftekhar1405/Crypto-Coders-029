import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { database } from "../utils/firebase";
import { ref, get, set } from "firebase/database";
import { toast } from "react-toastify";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
  FaUserShield,
} from "react-icons/fa";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    bio: "",
    location: "",
    interests: "",
    isAdmin: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setProfile({
              ...userData,
              email: user.email,
              isAdmin: userData.isAdmin === true,
            });
          } else {
            setProfile((prevProfile) => ({
              ...prevProfile,
              email: user.email,
              isAdmin: false,
            }));
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load profile data. Please try again.");
        });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        displayName: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        interests: profile.interests,
        isAdmin: profile.isAdmin,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/3 bg-blue-600 p-8 text-center">
            <div className="mb-4">
              <img
                src={user?.photoURL || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto border-4 border-white"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {profile.displayName || "User"}
            </h1>
            <p className="text-blue-200 mb-2">{profile.email}</p>
            <p className="text-blue-200 mb-4">
              {profile.isAdmin ? "Admin" : "Customer"}
            </p>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-blue-600 px-4 py-2 rounded-full font-bold hover:bg-blue-100 transition duration-300"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
          <div className="md:w-2/3 p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
              Profile Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="displayName"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <FaUser className="mr-2" /> Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <FaEnvelope className="mr-2" /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                />
              </div>
              <div>
                <label
                  htmlFor="userType"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <FaUserShield className="mr-2" /> User Type
                </label>
                <input
                  type="text"
                  id="userType"
                  name="userType"
                  value={profile.isAdmin ? "Admin" : "Customer"}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                />
              </div>
              <div>
                <label
                  htmlFor="bio"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <FaUser className="mr-2" /> Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="location"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <FaMapMarkerAlt className="mr-2" /> Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="interests"
                  className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  <FaHeart className="mr-2" /> Interests
                </label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  value={profile.interests}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
