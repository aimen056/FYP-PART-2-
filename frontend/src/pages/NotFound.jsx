import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4"
    >
      {/* AQI-style illustration */}
      <div className="relative mb-8">
        <svg width="160" height="160" viewBox="0 0 160 160" fill="none" aria-hidden="true">
          <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(14,165,233,0.15)" strokeWidth="8" />
          <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(14,165,233,0.1)" strokeWidth="6" />
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
            className="fill-sky-500" style={{ fontSize: "52px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
            404
          </text>
        </svg>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-sky-400/20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Page not found
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition"
        >
          Go Home
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/userdashboard")}
          className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Dashboard
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NotFound;
