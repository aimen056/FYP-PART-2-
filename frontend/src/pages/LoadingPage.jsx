import React from "react";
import { motion } from "framer-motion";

const LoadingPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900">
      {/* AQI gauge ring */}
      <div className="relative w-32 h-32 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(14,165,233,0.15)" strokeWidth="8" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="327"
            initial={{ strokeDashoffset: 327 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-sky-400 font-bold text-base"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          >
            AQI
          </motion.span>
        </div>
      </div>

      {/* Brand name */}
      <motion.h1
        className="text-4xl font-bold text-white mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        AIR<span className="text-sky-400">GUARD</span>
      </motion.h1>

      <p className="text-sky-300/60 text-sm">Monitoring the air you breathe</p>
    </div>
  );
};

export default LoadingPage;
