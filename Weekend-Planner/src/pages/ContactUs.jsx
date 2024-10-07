import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaTimes } from "react-icons/fa";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setShowPopup(true);
    setFormData({ name: "", email: "", message: "" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: "easeIn",
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 py-16 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden"
        variants={itemVariants}
      >
        <motion.div
          className="bg-gradient-to-r from-purple-500 to-pink-600 py-6 px-8"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white">Contact Us</h1>
        </motion.div>
        <div className="p-8 md:flex">
          <motion.div
            className="md:w-1/2 mb-8 md:mb-0 md:pr-8"
            variants={containerVariants}
          >
            <motion.h2
              className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white"
              variants={itemVariants}
            >
              Get in Touch
            </motion.h2>
            <motion.p
              className="mb-4 text-gray-600 dark:text-gray-300"
              variants={itemVariants}
            >
              We'd love to hear from you. Please fill out the form below or use
              our contact information.
            </motion.p>
            <motion.div className="space-y-4" variants={containerVariants}>
              <motion.div className="flex items-center" variants={itemVariants}>
                <FaEnvelope className="text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">
                  support@weekendplanner.com
                </span>
              </motion.div>
              <motion.div className="flex items-center" variants={itemVariants}>
                <FaPhone className="text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">
                  +91 7276771921
                </span>
              </motion.div>
              <motion.div className="flex items-center" variants={itemVariants}>
                <FaMapMarkerAlt className="text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">
                  777 Weekend St, Planners ville, India, 431001
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div className="md:w-1/2" variants={containerVariants}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring h-12 focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 text-gray-900  dark:text-white"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring h-12 focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </motion.div>
              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={popupVariants}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full relative"
              variants={popupVariants}
            >
              <motion.button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowPopup(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="w-6 h-6" />
              </motion.button>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Thank You!
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Your message has been sent successfully. We'll get back to you
                as soon as possible.
              </p>
              <motion.button
                className="mt-6 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300"
                onClick={() => setShowPopup(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
