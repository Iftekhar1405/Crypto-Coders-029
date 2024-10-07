import React from "react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
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

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 py-16 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden"
        variants={itemVariants}
      >
        <motion.div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 py-6 px-8"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white">
            Privacy Policy for Weekend Planner
          </h1>
          <p className="text-sm text-indigo-100 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>
        <motion.div className="p-8 space-y-6" variants={containerVariants}>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              1. Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Welcome to Weekend Planner. We are committed to protecting your
              personal information and your right to privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your
              information when you use our application.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              2. Information We Collect
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We collect personal information that you provide to us such as
              name, email address, and other contact information. We also
              collect information automatically when you use the application,
              including usage data and device information.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We use the information we collect to provide, maintain, and
              improve our services, to communicate with you, and to comply with
              legal obligations. We may also use your information to personalize
              your experience and to send you promotional communications.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              4. Data Storage and Security
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We implement a variety of security measures to maintain the safety
              of your personal information. Your personal information is
              contained behind secured networks and is only accessible by a
              limited number of persons who have special access rights.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              5. Your Rights
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You have the right to access, update, or delete the information we
              have on you. You can object to processing of your personal
              information, ask us to restrict processing of your personal
              information or request portability of your personal information.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              6. Changes to This Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date.
            </p>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              7. Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              If you have any questions about this Privacy Policy, please
              contact us at support@weekendplanner.com.
            </p>
          </motion.section>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PrivacyPolicy;
