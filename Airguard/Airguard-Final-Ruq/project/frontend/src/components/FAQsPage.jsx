import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const slideUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      variants={fadeIn}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600 mb-6 overflow-hidden transform hover:scale-[1.02] transition-transform duration-300"
      whileHover={{ boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {question}
        </h3>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-teal-600 dark:text-teal-400 text-lg"
        >
          ▼
        </motion.span>
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: isOpen ? "auto" : 0, 
          opacity: isOpen ? 1 : 0 
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <p className="p-6 text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
};

const FAQsPage = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "What is Air Quality Index (AQI)?",
      answer: "The Air Quality Index (AQI) is a measure used to communicate how polluted the air currently is or how polluted it is forecast to become. It focuses on health effects that can happen within a few hours or days after breathing polluted air.",
    },
    {
      question: "How is AQI measured?",
      answer: "AQI is calculated based on the concentrations of major air pollutants, including PM2.5, PM10, CO, O3, NO2, and SO2. These measurements are taken from air quality sensors and converted into a standardized scale from 0 to 500.",
    },
    {
      question: "How often is the air quality data updated?",
      answer: "Our air quality data is updated every minute, providing near real-time information about current conditions in your selected zone.",
    },
    {
      question: "How are health recommendations generated?",
      answer: "Health recommendations are personalized based on the current AQI levels, your location, and any health conditions you specify in your profile. They provide guidance on outdoor activities and precautions.",
    },
    {
      question: "How can I report pollution incidents?",
      answer: "You can report pollution incidents through the User Dashboard by navigating to the 'Report Pollution' section, where you can submit details and photos of the incident.",
    },
    {
      question: "How do I set up air quality alerts?",
      answer: "To set up alerts, go to your profile settings and enable notifications. You can choose your preferred notification type (email or SMS) and frequency (daily or weekly).",
    },
    {
      question: "How accurate is the air quality data?",
      answer: "Our data comes from verified air quality sensors and is cross-checked for accuracy. While we strive for precision, local conditions may cause minor variations.",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-green-900 to-orange-500 dark:from-gray-900 dark:to-gray-700 text-gray-800 dark:text-gray-200 pt-16 w-full px-4 overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.header
        variants={fadeIn}
        className="mt-12 bg-gray-100 dark:bg-gray-800 py-4 border-b border-gray-200 dark:border-gray-700 w-full rounded-2xl shadow-lg"
      >
        <div className="w-full px-4 flex items-center justify-between">
          <motion.button
            onClick={() => navigate(-1)}
            className="bg-teal-700 text-white px-4 py-2 rounded-full hover:bg-orange-500 dark:hover:bg-orange-600 transition duration-300 shadow-lg flex items-center gap-2"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
          <h1 className="text-3xl font-bold text-teal-600 dark:text-teal-400 flex items-center justify-center flex-1">
            Frequently Asked Questions <span className="ml-2 animate-pulse">❓</span>
          </h1>
        </div>
      </motion.header>

      <motion.div variants={slideUp} className="max-w-4xl mx-auto my-12">
        <motion.p
          variants={fadeIn}
          className="text-center text-gray-200 dark:text-gray-300 text-lg mb-12 bg-gray-800/50 dark:bg-gray-900/50 p-6 rounded-xl shadow-inner"
        >
          Find answers to common questions about air quality monitoring and our platform.
        </motion.p>

        <motion.div
          className="relative bg-[url('./assets/wave-pattern.svg')] bg-repeat bg-opacity-10 rounded-3xl p-8 shadow-2xl"
          variants={staggerContainer}
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default FAQsPage;