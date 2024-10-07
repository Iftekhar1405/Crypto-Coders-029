import React from "react";
import { motion } from "framer-motion";

const TermsOfService = () => {
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
      className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 py-16 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden"
        variants={itemVariants}
      >
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-600 py-6 px-8"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        </motion.div>
        <motion.div className="p-8 space-y-6" variants={containerVariants}>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              By accessing or using the Weekend Planner service, you agree to be
              bound by these Terms of Service. If you do not agree to these
              terms, please do not use our service.
            </p>
          </motion.section>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              2. Description of Service
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Weekend Planner provides a platform for users to plan and organize
              weekend activities with friends and family. Our service includes
              features such as group scheduling, activity suggestions, and
              polls.
            </p>
          </motion.section>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              3. User Responsibilities
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Users are responsible for maintaining the confidentiality of their
              account information and for all activities that occur under their
              account. Users must not use the service for any illegal or
              unauthorized purpose.
            </p>
          </motion.section>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              4. Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your privacy is important to us. Please refer to our Privacy
              Policy for information on how we collect, use, and disclose your
              personal information.
            </p>
          </motion.section>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              5. Modifications to Service
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We reserve the right to modify or discontinue, temporarily or
              permanently, the service (or any part thereof) with or without
              notice at any time.
            </p>
          </motion.section>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default TermsOfService;
