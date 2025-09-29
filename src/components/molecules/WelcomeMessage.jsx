import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const WelcomeMessage = () => {
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 }
  };

  const suggestions = [
    "Explain quantum computing in simple terms",
    "Write a creative short story",
    "Help me plan a weekend trip",
    "Suggest a healthy recipe for dinner"
  ];

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-6 text-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl"
        variants={itemVariants}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <ApperIcon name="Sparkles" size={32} className="text-white" />
      </motion.div>

      <motion.h1
        className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-4"
        variants={itemVariants}
      >
        Welcome to Gemini Chat
      </motion.h1>

      <motion.p
        className="text-xl text-text-secondary mb-12 max-w-md"
        variants={itemVariants}
      >
        Start a conversation with Google's advanced AI assistant. Ask anything, get instant responses.
      </motion.p>

      <motion.div
        className="w-full max-w-md space-y-3"
        variants={itemVariants}
      >
        <p className="text-sm font-medium text-text-secondary mb-4">Try asking:</p>
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:bg-gray-50 transition-colors cursor-pointer shadow-sm hover:shadow-md"
            variants={itemVariants}
            whileHover={{ scale: 1.02, x: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex-shrink-0"></div>
              <p className="text-text-primary text-sm">{suggestion}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default WelcomeMessage;