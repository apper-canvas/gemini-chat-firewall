import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No messages yet",
  description = "Start a conversation with Gemini AI",
  actionText = "Send Message",
  onAction,
  icon = "MessageCircle"
}) => {
  const containerVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const floatingVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className="h-full flex items-center justify-center bg-gradient-to-b from-background to-gray-50 px-4"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="text-center max-w-md">
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl"
          variants={itemVariants}
          animate={floatingVariants}
        >
          <ApperIcon name={icon} size={32} className="text-white" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-3">
            {title}
          </h3>
          <p className="text-text-secondary mb-8 text-lg leading-relaxed">
            {description}
          </p>
        </motion.div>

        {onAction && (
          <motion.div variants={itemVariants}>
            <Button
              onClick={onAction}
              variant="primary"
              size="lg"
              className="px-8 py-4 text-lg"
            >
              <ApperIcon name="Plus" size={20} className="mr-2" />
              {actionText}
            </Button>
          </motion.div>
        )}

        <motion.div 
          className="mt-12 grid grid-cols-2 gap-4"
          variants={itemVariants}
        >
          {[
            { icon: "Zap", text: "Fast responses" },
            { icon: "Shield", text: "Secure chats" },
            { icon: "Sparkles", text: "Smart AI" },
            { icon: "Heart", text: "Easy to use" }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <ApperIcon name={feature.icon} size={16} className="text-primary-600" />
              </div>
              <span className="text-sm font-medium text-text-secondary">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Empty;