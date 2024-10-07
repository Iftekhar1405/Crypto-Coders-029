import React from "react";
import { motion } from "framer-motion";

const CookiePolicy = () => {
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
      className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 py-16 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden"
        variants={itemVariants}
      >
        <motion.div
          className="bg-gradient-to-r from-green-500 to-blue-600 py-6 px-8"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white">Cookie Policy</h1>
        </motion.div>
        <motion.div className="p-8 space-y-6" variants={containerVariants}>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              What Are Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Cookies are small text files that are placed on your computer or
              mobile device when you visit a website. They are widely used to
              make websites work more efficiently and provide information to the
              owners of the site.
            </p>
          </motion.section>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              How We Use Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              We use cookies to improve your browsing experience, remember your
              preferences, and provide personalized content. Cookies also help
              us understand how our users interact with our website, which
              allows us to continually improve our service.
            </p>
          </motion.section>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Types of Cookies We Use
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                Essential cookies: These are necessary for the website to
                function properly.
              </li>
              <li>
                Analytical/performance cookies: These help us improve the way
                our website works.
              </li>
              <li>
                Functionality cookies: These remember your preferences and
                enhance your experience.
              </li>
              <li>
                Targeting cookies: These record your visit to our website and
                your browsing habits.
              </li>
            </ul>
          </motion.section>
          <motion.section variants={itemVariants}>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Managing Cookies
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Most web browsers allow you to control cookies through their
              settings. However, if you limit the ability of websites to set
              cookies, you may worsen your overall user experience.
            </p>
          </motion.section>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CookiePolicy;
