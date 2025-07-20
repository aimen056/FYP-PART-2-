import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const LoginPage = () => {
  const [currentView, setCurrentView] = useState("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    dob: "",
    country: "Pakistan",
    city: "Rawalpindi",
    diseases: [],
    wantsAlerts: false,
    rememberMe: false,
  });

  const navigate = useNavigate();
  const formRef = useRef(null); // Ref for the form container

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        password: savedPassword,
        rememberMe: true,
      }));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login attempt with:", formData);

    if (!formData.email || !formData.password) {
      alert("Please enter email and password.");
      return;
    }

    // Handle "Remember Me" functionality
    if (formData.rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
      localStorage.setItem("rememberedPassword", formData.password);
    } else {
      localStorage.removeItem("rememberedEmail");
      localStorage.removeItem("rememberedPassword");
    }

    // Check for specific credentials
    if (formData.email === "airguardteam@gmail.com" && formData.password === "airguardteam") {
      console.log("Login successful. Redirecting to Dashboard...");
      localStorage.setItem("token", "dummy-token-for-airguardteam");
      localStorage.setItem("user", JSON.stringify({ email: formData.email, loggedIn: true }));
      alert("Login successful! Redirecting to Dashboard...");
      navigate("/dashboard");
      return;
    }

    try {
      const response = await fetch("https://airguard-f6mb.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Login Response:", data);

      if (response.ok) {
        console.log("Login successful. Redirecting to User Dashboard...");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ ...data.user, loggedIn: true }));
        alert("Login successful! Redirecting to User Dashboard...");
        navigate("/userdashboard");
      } else {
        console.log("Login failed:", data);
        alert(data.error || "Login failed!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Something went wrong during login.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      if (type === "checkbox") {
        if (name === "wantsAlerts") {
          return {
            ...prev,
            wantsAlerts: checked,
            ...(checked ? {} : { diseases: [] }),
          };
        } else if (name === "diseases") {
          return {
            ...prev,
            diseases: checked ? [...prev.diseases, value] : prev.diseases.filter((d) => d !== value),
          };
        } else if (name === "rememberMe") {
          return { ...prev, [name]: checked };
        } else {
          return { ...prev, [name]: checked };
        }
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }

    if (!formData.email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    if (formData.wantsAlerts) {
      setCurrentView("alert");
      return;
    }

    await registerUser();
  };

  const handleAlertSubmit = async (e) => {
    e.preventDefault();

    await registerUser();
  };

  const registerUser = async () => {
    try {
      const response = await fetch("https://airguard-f6mb.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          contact: formData.contact || "",
          dob: formData.dob || "",
          country: formData.country || "",
          city: formData.city || "",
          wantsAlerts: formData.wantsAlerts,
          ...(formData.wantsAlerts && {
            diseases: formData.diseases || [],
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert(data.message);
      setCurrentView("thankyou");
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.message || "Something went wrong during signup.");
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    if (!formData.email) {
      alert("Please enter your email");
      return;
    }

    try {
      const response = await fetch("https://airguard-f6mb.onrender.com/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        const subject = "Password Reset Request";
        const body = `Click the link below to reset your password:\n\n${data.resetLink}`;
        const mailtoLink = `mailto:${formData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoLink;

        alert("Password reset link sent to your email!");
      } else {
        alert(data.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error sending reset link:", error);
      alert("Failed to send reset link. Please try again later.");
    }
  };

  const toggleView = (view) => {
    if (view === "signup" && currentView === "login" && formData.email) {
      setFormData((prev) => ({ ...prev, email: prev.email }));
    }
    setCurrentView(view);
    // Scroll to form when switching to signup
    if (view === "signup" && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Animation variants for 3D card
  const cardVariants = {
    hidden: { opacity: 0, rotateY: 90, scale: 0.8 },
    visible: { opacity: 1, rotateY: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    exit: { opacity: 0, rotateY: -90, scale: 0.8, transition: { duration: 0.6, ease: "easeIn" } },
  };

  // Animation variants for form elements
  const inputVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen w-screen flex justify-center items-center bg-gradient-to-br from-green-900 to-orange-500 dark:from-gray-900 dark:to-gray-700 font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row transform-gpu perspective-1000 hover:shadow-3xl transition-shadow duration-300"
        >
          {currentView === "thankyou" ? (
            <div className="w-full flex flex-col sm:flex-row">
              <motion.div
                className="w-full sm:w-1/2 bg-gradient-to-br from-orange-500 to-green-900 dark:from-gray-700 dark:to-gray-900 text-white flex flex-col justify-center items-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8 } }}
              >
                <motion.h1
                  className="text-4xl font-bold mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.6 } }}
                >
                  Thank You for Registering!
                </motion.h1>
                <motion.p
                  className="text-lg text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.6 } }}
                >
                  Your account has been created successfully.
                </motion.p>
              </motion.div>
              <motion.div
                className="w-full sm:w-1/2 p-8 flex flex-col items-center bg-gray-50 dark:bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8 } }}
              >
                <motion.h2
                  className="text-teal-700 dark:text-teal-400 text-2xl font-semibold mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.6 } }}
                >
                  What's Next?
                </motion.h2>
                <motion.p
                  className="mb-6 text-gray-600 dark:text-gray-300 text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.6 } }}
                >
                  Explore your Dashboard or set up additional preferences.
                </motion.p>
                <motion.button
                  type="button"
                  onClick={() => navigate("/UserDashboard")}
                  className="bg-teal-700 text-white px-6 py-3 rounded-full hover:bg-orange-500 dark:hover:bg-orange-600 transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Go to Dashboard
                </motion.button>
              </motion.div>
            </div>
          ) : currentView === "forgotPassword" ? (
            <motion.div
              className="w-full p-8 flex flex-col items-center bg-gray-50 dark:bg-gray-900"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.8 } }}
            >
              <motion.h2
                className="text-teal-700 dark:text-teal-400 text-3xl font-bold mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.6 } }}
              >
                Reset Password
              </motion.h2>
              <motion.p
                className="mb-6 text-gray-600 dark:text-gray-300 text-center"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.6 } }}
              >
                Enter your email to receive password reset instructions.
              </motion.p>
              <form ref={formRef} onSubmit={handleForgotPassword} className="flex flex-col gap-4 w-full max-w-sm">
                <div className="relative mb-2">
                  <motion.span
                    initial={{ y: 0, color: '#64748b' }}
                    whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                    style={{ marginTop: '-18px' }}
                  >
                    Email
                  </motion.span>
                <motion.input
                  variants={inputVariants}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                  required
                />
                </div>
                <motion.button
                  type="submit"
                  className="bg-teal-700 text-white px-6 py-3 rounded-full hover:bg-orange-500 dark:hover:bg-orange-600 transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Reset Link
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setCurrentView("login")}
                  className="text-orange-500 dark:text-orange-400 hover:underline text-sm mt-2"
                  whileHover={{ scale: 1.05 }}
                >
                  Back to Login
                </motion.button>
              </form>
            </motion.div>
          ) : currentView === "alert" ? (
            <div className="flex flex-col sm:flex-row w-full">
              <motion.div
                className="w-full sm:w-1/2 bg-gradient-to-br from-orange-500 to-green-900 dark:from-gray-700 dark:to-gray-900 text-white flex flex-col justify-center items-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8 } }}
              >
                <motion.h1
                  className="text-4xl font-bold mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.6 } }}
                >
                  Alert Preferences
                </motion.h1>
                <motion.p
                  className="text-lg text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.6 } }}
                >
                  Set up personalized alerts for better health and updates.
                </motion.p>
              </motion.div>
              <motion.div
                className="w-full sm:w-1/2 p-8 flex flex-col bg-gray-50 dark:bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8 } }}
              >
                <motion.h2
                  className="text-teal-700 dark:text-teal-400 text-2xl font-semibold mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.6 } }}
                >
                  Set Alerts
                </motion.h2>
                <form ref={formRef} onSubmit={handleAlertSubmit} className="flex flex-col gap-4">
                  <motion.p
                    variants={inputVariants}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    Do you have a history of any of these illnesses?
                  </motion.p>
                  {["Respiratory Diseases", "Cardiovascular Conditions", "Chronic Illnesses"].map(
                    (disease) => (
                      <motion.label
                        key={disease}
                        variants={inputVariants}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <input
                          type="checkbox"
                          name="diseases"
                          value={disease}
                          onChange={handleInputChange}
                          placeholder={disease}
                          className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded text-teal-500 focus:ring-teal-500 dark:focus:ring-teal-400"
                        />
                        {disease}
                      </motion.label>
                    ),
                  )}
                  <motion.button
                    type="submit"
                    className="bg-teal-700 text-white px-6 py-3 rounded-full hover:bg-orange-500 dark:hover:bg-orange-600 transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Finish
                  </motion.button>
                </form>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row w-full">
              <motion.div
                className="w-full sm:w-1/2 bg-gradient-to-br from-orange-500 to-green-900 dark:from-gray-700 dark:to-gray-900 text-white flex flex-col justify-center items-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8 } }}
              >
                <motion.h1
                  className="text-4xl font-bold mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.6 } }}
                >
                  {currentView === "signup" ? "Join Us Today!" : "Welcome Back!"}
                </motion.h1>
                <motion.p
                  className="text-lg text-center"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.4, duration: 0.6 } }}
                >
                  {currentView === "signup"
                    ? "Create your account to access personalized updates."
                    : "Sign in to continue to your Dashboard."}
                </motion.p>
                <motion.button
                  onClick={() => toggleView(currentView === "signup" ? "login" : "signup")}
                  className="border border-white rounded-full px-6 py-2 mt-6 hover:bg-white hover:text-teal-700 dark:hover:text-gray-900 transition duration-300 shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {currentView === "signup"
                    ? "Already have an account? Sign In"
                    : "Don't have an account? Sign Up"}
                </motion.button>
              </motion.div>
              <motion.div
                className="w-full sm:w-1/2 p-8 flex flex-col items-center bg-gray-50 dark:bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.8 } }}
              >
                <motion.h2
                  className="text-teal-700 dark:text-teal-400 text-3xl font-bold mb-4"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.2, duration: 0.6 } }}
                >
                  {currentView === "signup" ? "Create Account" : "Sign In"}
                </motion.h2>
                <form
                  ref={formRef}
                  onSubmit={currentView === "signup" ? handleSignUpSubmit : handleLogin}
                  className="flex flex-col gap-4 w-full max-w-sm"
                >
                  {currentView === "signup" ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative mb-2 md:pr-2">
                          <motion.span
                            initial={{ y: 0, color: '#64748b' }}
                            whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                            style={{ marginTop: '-18px' }}
                          >
                            Full Name
                          </motion.span>
                          <motion.input
                            variants={inputVariants}
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                            required
                          />
                        </div>
                        <div className="relative mb-2 md:pl-2">
                          <motion.span
                            initial={{ y: 0, color: '#64748b' }}
                            whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                            style={{ marginTop: '-18px' }}
                          >
                            Email
                          </motion.span>
                          <motion.input
                            variants={inputVariants}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                            required
                          />
                        </div>
                        <div className="relative mb-2 md:pr-2">
                          <motion.span
                            initial={{ y: 0, color: '#64748b' }}
                            whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                            style={{ marginTop: '-18px' }}
                          >
                            Password
                          </motion.span>
                          <motion.input
                            variants={inputVariants}
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                            required
                          />
                        </div>
                        <div className="relative mb-2 md:pl-2">
                          <motion.span
                            initial={{ y: 0, color: '#64748b' }}
                            whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                            style={{ marginTop: '-18px' }}
                          >
                            Confirm Password
                          </motion.span>
                          <motion.input
                            variants={inputVariants}
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm Password"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                            required
                          />
                        </div>
                        <div className="relative mb-2 md:pr-2">
                          <motion.span
                            initial={{ y: 0, color: '#64748b' }}
                            whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                            style={{ marginTop: '-18px' }}
                          >
                            Contact Number
                          </motion.span>
                          <motion.input
                            variants={inputVariants}
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleInputChange}
                            placeholder="Contact Number"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                          />
                        </div>
                        <div className="relative mb-2 md:pl-2">
                          <motion.span
                            initial={{ y: 0, color: '#64748b' }}
                            whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                            style={{ marginTop: '-18px' }}
                          >
                            Date of Birth
                          </motion.span>
                          <motion.input
                            variants={inputVariants}
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleInputChange}
                            placeholder="Date of Birth"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300 w-full"
                            required
                          />
                        </div>
                        <div className="relative mb-2 md:pr-2">
                          <motion.span
                            initial={{ y: 0, color: '#64748b' }}
                            whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                            style={{ marginTop: '-18px' }}
                          >
                            City
                          </motion.span>
                          <motion.input
                            variants={inputVariants}
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                          />
                        </div>
                        <div className="relative mb-2 md:pl-2">
                          <motion.span
                            initial={{ y: 0, color: '#64748b' }}
                            whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                            style={{ marginTop: '-18px' }}
                          >
                            Country
                          </motion.span>
                          <motion.select
                            variants={inputVariants}
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                            placeholder="Country"
                          >
                            <option value="Pakistan">Pakistan</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                          </motion.select>
                        </div>
                      </div>
                      <motion.label
                        variants={inputVariants}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                      >
                        <input
                          type="checkbox"
                          name="wantsAlerts"
                          checked={formData.wantsAlerts}
                          onChange={handleInputChange}
                          placeholder="Receive Alerts"
                          className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded text-teal-500 focus:ring-teal-500 dark:focus:ring-teal-400"
                        />
                        I want to receive alerts
                      </motion.label>
                    </>
                  ) : (
                    <>
                      <div className="relative mb-2">
                        <motion.span
                          initial={{ y: 0, color: '#64748b' }}
                          whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                          style={{ marginTop: '-18px' }}
                        >
                          Email
                        </motion.span>
                      <motion.input
                        variants={inputVariants}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                        required
                      />
                      </div>
                      <div className="relative mb-2">
                        <motion.span
                          initial={{ y: 0, color: '#64748b' }}
                          whileHover={{ y: -8, color: '#14b8a6', scale: 1.05 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                          className="absolute left-3 top-2 text-sm font-medium pointer-events-none z-10 dark:bg-gray-700 px-1 bg-white dark:bg-gray-800"
                          style={{ marginTop: '-18px' }}
                        >
                          Password
                        </motion.span>
                      <motion.input
                        variants={inputVariants}
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Password"
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 shadow-sm transition-all duration-300"
                        required
                      />
                      </div>
                      <motion.div
                        variants={inputVariants}
                        className="flex justify-between items-center mt-2"
                      >
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleInputChange}
                            placeholder="Remember Me"
                            className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded text-teal-500 focus:ring-teal-500 dark:focus:ring-teal-400"
                          />
                          Remember Me
                        </label>
                        <motion.button
                          type="button"
                          className="text-orange-500 dark:text-orange-400 hover:underline text-sm"
                          onClick={() => setCurrentView("forgotPassword")}
                          whileHover={{ scale: 1.05 }}
                        >
                          Forgot Password?
                        </motion.button>
                      </motion.div>
                    </>
                  )}
                  <motion.button
                    type="submit"
                    className="bg-teal-700 text-white px-6 py-3 rounded-full hover:bg-orange-500 dark:hover:bg-orange-600 transition duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {currentView === "signup" ? "Sign Up" : "Sign In"}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;