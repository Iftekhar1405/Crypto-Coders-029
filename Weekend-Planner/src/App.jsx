// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Activities from "./pages/Activities";
import Groups from "./pages/Groups";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactUs from "./pages/ContactUs";
import Registration from "./pages/Registration";
import AuthForm from "./components/AuthForm";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

function App() {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false,
      offset: 100,
    });

    // Set dark mode as default
    document.documentElement.classList.add("dark");
    localStorage.setItem("darkMode", "true");
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white transition-colors duration-300">
          <Header />
          <AnimatePresence mode="wait">
            <motion.main
              className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<AuthForm />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/contact-us" element={<ContactUs />} />
              </Routes>
            </motion.main>
          </AnimatePresence>
          <Footer />
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      </AuthProvider>
    </Router>
  );
}

export default App;
