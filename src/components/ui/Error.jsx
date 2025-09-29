import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong", 
  onRetry,
  showRetry = true
}) => {
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
      className="h-screen flex items-center justify-center bg-background px-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="text-center max-w-md">
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
        >
          <ApperIcon name="AlertCircle" size={24} className="text-white" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-xl font-bold text-text-primary mb-3">
            Oops! Something went wrong
          </h3>
          <p className="text-text-secondary mb-6 leading-relaxed">
            {message}
          </p>
        </motion.div>

        {showRetry && onRetry && (
          <motion.div variants={itemVariants}>
            <Button
              onClick={onRetry}
              variant="primary"
              className="px-6 py-3"
            >
              <ApperIcon name="RefreshCw" size={16} className="mr-2" />
              Try Again
            </Button>
          </motion.div>
        )}

        <motion.div 
          className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-200"
          variants={itemVariants}
        >
          <p className="text-sm text-text-muted">
            If the problem persists, please check your internet connection or try refreshing the page.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Error;