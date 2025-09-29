import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Loading = ({ message = "Loading chat..." }) => {
  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="h-screen flex items-center justify-center bg-background"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="text-center">
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          variants={itemVariants}
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
        >
          <ApperIcon name="Sparkles" size={24} className="text-white" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
          
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {message}
          </h3>
          <p className="text-text-secondary">
            Getting everything ready for you...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Loading;