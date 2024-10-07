"use client";

import React, { useState, useEffect } from "react";
import { database } from "../utils/firebase";
import {
  ref,
  onValue,
  off,
  update,
  remove,
  set,
  serverTimestamp,
} from "firebase/database";
import { useAuth } from "../hooks/useAuth";
import {
  FaClock,
  FaRupeeSign,
  FaStar,
  FaStarHalfAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaUser,
  FaCalendarPlus,
  FaSearch,
} from "react-icons/fa";

const ActivitySuggestions = () => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    priceRange: "",
    nameFilter: "",
  });
  const { user } = useAuth();
  const [editingActivity, setEditingActivity] = useState(null);
  const [newActivity, setNewActivity] = useState({
    name: "",
    location: "",
    openingTime: "",
    closingTime: "",
    price: "",
    reviewCount: "",
    rating: 0,
    description: "",
  });
  const [sortOrder, setSortOrder] = useState("newest");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const activitiesRef = ref(database, "activities");
    onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activitiesList = Object.entries(data).map(([id, activity]) => ({
          id,
          ...activity,
        }));
        setActivities(activitiesList);
      } else {
        setActivities([]);
      }
    });

    return () => {
      off(activitiesRef);
    };
  }, []);

  useEffect(() => {
    filterActivities();
  }, [activities, userPreferences, sortOrder]);

  const filterActivities = () => {
    let filtered = activities;

    if (userPreferences.nameFilter) {
      filtered = filtered.filter((activity) =>
        activity.name
          .toLowerCase()
          .includes(userPreferences.nameFilter.toLowerCase())
      );
    }

    if (userPreferences.priceRange) {
      const [min, max] = userPreferences.priceRange.split("-").map(Number);
      filtered = filtered.filter(
        (activity) => activity.price >= min && activity.price <= max
      );
    }

    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return (
            (b.updatedAt || b.createdAt || 0) -
            (a.updatedAt || a.createdAt || 0)
          );
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    setFilteredActivities(filtered);
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setUserPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <>
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <FaStar key={i} className="text-yellow-400" />;
          } else if (i === fullStars && hasHalfStar) {
            return <FaStarHalfAlt key={i} className="text-yellow-400" />;
          } else {
            return <FaStar key={i} className="text-gray-300" />;
          }
        })}
      </>
    );
  };

  const validateForm = () => {
    const errors = {};
    if (!newActivity.name) errors.name = "Name is required";
    if (!newActivity.location) errors.location = "Location is required";
    if (!newActivity.openingTime)
      errors.openingTime = "Opening time is required";
    if (!newActivity.closingTime)
      errors.closingTime = "Closing time is required";
    if (!newActivity.price) errors.price = "Price is required";
    if (!newActivity.reviewCount)
      errors.reviewCount = "Review count is required";
    if (!newActivity.rating) errors.rating = "Rating is required";
    if (!newActivity.description)
      errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateActivity = () => {
    if (editingActivity && validateForm()) {
      const activityRef = ref(database, `activities/${editingActivity.id}`);
      update(activityRef, {
        ...newActivity,
        price: parseFloat(newActivity.price) || 0,
        reviewCount: parseInt(newActivity.reviewCount, 10) || 0,
        updatedAt: serverTimestamp(),
      });
      setEditingActivity(null);
      setNewActivity({
        name: "",
        location: "",
        openingTime: "",
        closingTime: "",
        price: "",
        reviewCount: "",
        rating: 0,
        description: "",
      });
      setFormErrors({});
    }
  };

  const handleDeleteActivity = (activityId) => {
    const activityRef = ref(database, `activities/${activityId}`);
    remove(activityRef);
  };

  const handleClearAllActivities = () => {
    const activitiesRef = ref(database, "activities");
    set(activitiesRef, null);
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setNewActivity({
      ...activity,
      price: activity.price?.toString() || "",
      reviewCount: activity.reviewCount?.toString() || "",
    });
    setFormErrors({});
  };

  const formatNumber = (num) => {
    return num >= 1000 ? (num / 1000).toFixed(1) + "k" : num;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md max-w-7xl mx-auto">
      {user && user.isAdmin && editingActivity && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">
            Edit Activity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
              <label
                htmlFor="activityName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Activity Name
              </label>
              <input
                id="activityName"
                type="text"
                value={newActivity.name}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, name: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${
                  formErrors.name ? "border-red-500" : ""
                }`}
                required
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
              <label
                htmlFor="activityLocation"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Location
              </label>
              <input
                id="activityLocation"
                type="text"
                value={newActivity.location}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, location: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${
                  formErrors.location ? "border-red-500" : ""
                }`}
                required
              />
              {formErrors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.location}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="openingTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Opening Time
              </label>
              <input
                id="openingTime"
                type="time"
                value={newActivity.openingTime}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    openingTime: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${
                  formErrors.openingTime ? "border-red-500" : ""
                }`}
                required
              />
              {formErrors.openingTime && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.openingTime}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="closingTime"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Closing Time
              </label>
              <input
                id="closingTime"
                type="time"
                value={newActivity.closingTime}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    closingTime: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${
                  formErrors.closingTime ? "border-red-500" : ""
                }`}
                required
              />
              {formErrors.closingTime && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.closingTime}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="activityPrice"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Price (INR)
              </label>
              <input
                id="activityPrice"
                type="number"
                value={newActivity.price}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, price: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${
                  formErrors.price ? "border-red-500" : ""
                }`}
                required
              />
              {formErrors.price && (
                <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="reviewCount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Number of Reviews
              </label>
              <input
                id="reviewCount"
                type="number"
                value={newActivity.reviewCount}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    reviewCount: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${
                  formErrors.reviewCount ? "border-red-500" : ""
                }`}
                required
              />
              {formErrors.reviewCount && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.reviewCount}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="activityRating"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Rating (0-5)
              </label>
              <input
                id="activityRating"
                type="number"
                value={newActivity.rating}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    rating: Number(e.target.value),
                  })
                }
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${
                  formErrors.rating ? "border-red-500" : ""
                }`}
                step="0.1"
                min="0"
                max="5"
                required
              />
              {formErrors.rating && (
                <p className="text-red-500 text-xs mt-1">{formErrors.rating}</p>
              )}
            </div>
            <div className="col-span-1 sm:col-span-2 lg:col-span-4">
              <label
                htmlFor="activityDescription"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description
              </label>
              <textarea
                id="activityDescription"
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity({
                    ...newActivity,
                    description: e.target.value,
                  })
                }
                className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 ${
                  formErrors.description ? "border-red-500" : ""
                }`}
                rows={3}
                required
              ></textarea>
              {formErrors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.description}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleUpdateActivity}
              className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors w-full sm:w-auto"
            >
              Update Activity
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="text"
            name="nameFilter"
            value={userPreferences.nameFilter}
            onChange={handlePreferenceChange}
            placeholder="Filter by name"
            className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <select
          name="priceRange"
          value={userPreferences.priceRange}
          onChange={handlePreferenceChange}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All price ranges</option>
          <option value="0-500">₹0 - ₹500</option>
          <option value="501-1000">₹501 - ₹1000</option>
          <option value="1001-2000">₹1001 - ₹2000</option>
          <option value="2001-5000">₹2001 - ₹5000</option>
          <option value="5001-10000">₹5001+</option>
        </select>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleSortChange("newest")}
          className={`px-4 py-2 rounded-md transition-colors ${
            sortOrder === "newest"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Newest
        </button>
        <button
          onClick={() => handleSortChange("priceAsc")}
          className={`px-4 py-2 rounded-md transition-colors ${
            sortOrder === "priceAsc"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Price: Low to High
        </button>
        <button
          onClick={() => handleSortChange("priceDesc")}
          className={`px-4 py-2 rounded-md transition-colors ${
            sortOrder === "priceDesc"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          Price: High to Low
        </button>
      </div>

      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {activity.name}
                </h3>
                {user && user.isAdmin && (
                  <div>
                    <button
                      onClick={() => handleEditActivity(activity)}
                      className="text-blue-500 hover:text-blue-600 mr-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <FaMapMarkerAlt className="mr-2" />
                <span>{activity.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <FaClock className="mr-2" />
                <span>
                  {activity.openingTime} - {activity.closingTime}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                <FaRupeeSign className="mr-2" />
                <span>₹{activity.price}</span>
              </div>
              <div className="flex items-center mb-2">
                {renderStars(activity.rating)}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {activity.rating ? activity.rating.toFixed(1) : "N/A"}
                </span>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaUser className="inline mr-1" />
                  {formatNumber(activity.reviewCount)} reviews
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {activity.description}
              </p>
              {(activity.updatedAt || activity.createdAt) && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <FaCalendarPlus className="inline mr-1" />
                  {activity.updatedAt ? "Updated: " : "Added: "}
                  {new Date(
                    activity.updatedAt || activity.createdAt
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No activity suggestions available based on your preferences.
        </p>
      )}

      {user && user.isAdmin && (
        <div className="mt-6">
          <button
            onClick={handleClearAllActivities}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Clear All Activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivitySuggestions;
