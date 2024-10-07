"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { database, storage } from "../utils/firebase";
import { ref as dbRef, get, set } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaHeart,
  FaUserShield,
  FaEdit,
  FaSave,
  FaTimes,
  FaCamera,
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
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
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
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
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
    photoURL: "",
    providerPhotoURL: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const userRef = dbRef(database, `users/${user.uid}`);
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setProfile({
              ...userData,
              displayName: user.displayName || userData.name || "",
              email: user.email,
              isAdmin: userData.isAdmin === true,
              photoURL:
                userData.photoURL ||
                "https://media.istockphoto.com/id/610003972/vector/vector-businessman-black-silhouette-isolated.jpg?s=612x612&w=0&k=20&c=Iu6j0zFZBkswfq8VLVW8XmTLLxTLM63bfvI6uXdkacM=",
              providerPhotoURL: user.photoURL || "",
            });
          } else {
            setProfile((prevProfile) => ({
              ...prevProfile,
              displayName: user.displayName || "",
              email: user.email,
              isAdmin: false,
              photoURL:
                "https://media.istockphoto.com/id/526947869/vector/man-silhouette-profile-picture.jpg?s=612x612&w=0&k=20&c=5I7Vgx_U6UPJe9U2sA2_8JFF4grkP7bNmDnsLXTYlSc=",
              providerPhotoURL: user.photoURL || "",
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
      const userRef = dbRef(database, `users/${user.uid}`);
      await set(userRef, {
        ...profile,
        name: profile.displayName,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const fileRef = storageRef(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);
        setProfile((prev) => ({ ...prev, photoURL: downloadURL }));

        const userRef = dbRef(database, `users/${user.uid}`);
        await set(userRef, {
          ...profile,
          photoURL: downloadURL,
        });

        toast.success("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        toast.error("Failed to update profile picture. Please try again.");
      }
    }
  };

  const getProfilePicture = () => {
    if (profile.providerPhotoURL) {
      return profile.providerPhotoURL;
    } else if (
      profile.photoURL &&
      profile.photoURL !== "https://via.placeholder.com/150"
    ) {
      return profile.photoURL;
    } else {
      return "https://via.placeholder.com/150";
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
              className="mb-4 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg overflow-hidden">
                <img
                  src={getProfilePicture()}
                  alt="Profile"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowFullImage(true)}
                />
              </div>
              {isEditing && !profile.providerPhotoURL && (
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-1/2 transform translate-x-1/2 bg-white dark:bg-gray-800 rounded-full p-2 cursor-pointer"
                >
                  <FaCamera className="text-blue-600" />
                  <input
                    type="file"
                    id="profile-picture"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
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

      <AnimatePresence>
        {showFullImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setShowFullImage(false)}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="relative"
            >
              <img
                src={getProfilePicture()}
                alt="Full size profile"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 rounded-full p-2"
                onClick={() => setShowFullImage(false)}
              >
                <FaTimes />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
