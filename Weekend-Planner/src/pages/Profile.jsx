import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { database } from "../utils/firebase";
import { ref, get, set } from "firebase/database";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

// Define animations
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const InputField = ({ icon, label, name, value, onChange, disabled }) => (
  <motion.div variants={itemVariants}>
    <label
      htmlFor={name}
      className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {React.cloneElement(icon, { className: "mr-2" })} {label}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
        disabled ? "bg-gray-100 dark:bg-gray-600" : ""
      }`}
    />
  </motion.div>
);

const TextAreaField = ({ icon, label, name, value, onChange, disabled }) => (
  <motion.div variants={itemVariants}>
    <label
      htmlFor={name}
      className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {React.cloneElement(icon, { className: "mr-2" })} {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      rows={4}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
        disabled ? "bg-gray-100 dark:bg-gray-600" : ""
      }`}
    ></textarea>
  </motion.div>
);

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
              displayName: user.displayName || userData.name || "",
              email: user.email,
              isAdmin: userData.isAdmin === true,
            });
          } else {
            setProfile((prevProfile) => ({
              ...prevProfile,
              displayName: user.displayName || "",
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
        ...profile,
        name: profile.displayName, // Update the 'name' field in the database
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="md:flex">
          <motion.div
            className="md:w-1/3 bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="mb-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <img
                src={user?.photoURL || "https://via.placeholder.com/150"}
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg"
              />
            </motion.div>
            <motion.h1
              className="text-2xl font-bold text-white mb-2"
              variants={itemVariants}
            >
              {profile.displayName || "User"}
            </motion.h1>
            <motion.p className="text-blue-200 mb-2" variants={itemVariants}>
              {profile.email}
            </motion.p>
            <motion.p className="text-blue-200 mb-4" variants={itemVariants}>
              {profile.isAdmin ? "Admin" : "Customer"}
            </motion.p>
            <motion.button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-100 transition duration-300 shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isEditing ? (
                <>
                  <FaTimes className="inline-block mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <FaEdit className="inline-block mr-2" />
                  Edit Profile
                </>
              )}
            </motion.button>
          </motion.div>
          <motion.div
            className="md:w-2/3 p-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.h2
              className="text-3xl font-bold mb-6 text-gray-800 dark:text-white"
              variants={itemVariants}
            >
              Profile Information
            </motion.h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField
                icon={<FaUser />}
                label="Name"
                name="displayName"
                value={profile.displayName}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <InputField
                icon={<FaEnvelope />}
                label="Email"
                name="email"
                value={profile.email}
                disabled={true}
              />
              <InputField
                icon={<FaUserShield />}
                label="User Type"
                name="userType"
                value={profile.isAdmin ? "Admin" : "Customer"}
                disabled={true}
              />
              <TextAreaField
                icon={<FaUser />}
                label="Bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <InputField
                icon={<FaMapMarkerAlt />}
                label="Location"
                name="location"
                value={profile.location}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <InputField
                icon={<FaHeart />}
                label="Interests"
                name="interests"
                value={profile.interests}
                onChange={handleChange}
                disabled={!isEditing}
              />
              {isEditing && (
                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSave className="inline-block mr-2" />
                    Save Changes
                  </motion.button>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
