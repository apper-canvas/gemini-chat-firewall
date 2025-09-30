import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";

const MessageBubble = ({ message, isTyping = false }) => {
const isUser = message?.sender === "user";
  const isAI = message?.sender === "ai";
  const isStreamingMessage = message?.streaming === true;
  const bubbleVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const TypingIndicator = () => (
    <div className="flex items-center gap-1 p-2">
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );

  if (isTyping) {
    return (
      <motion.div
        className="flex justify-start mb-4"
        variants={bubbleVariants}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-start gap-3 max-w-[80%]">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
            <ApperIcon name="Sparkles" size={16} className="text-white" />
          </div>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <TypingIndicator />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 message-enter`}
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      layout
    >
      <div className={`flex items-start gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : ""}`}>
        {isAI && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
            <ApperIcon name="Sparkles" size={16} className="text-white" />
          </div>
        )}
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center shadow-md">
            <ApperIcon name="User" size={16} className="text-white" />
          </div>
        )}
        
        <div className="flex flex-col gap-1">
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              isUser
                ? "bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-tr-sm"
                : "bg-gradient-to-br from-gray-100 to-gray-200 text-text-primary rounded-tl-sm"
            }`}
>
            <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
              {message?.content}
              {isStreamingMessage && (
                <span className="inline-flex ml-1">
                  <span className="animate-pulse">▊</span>
                </span>
              )}
            </p>
          </div>
          
{message?.timestamp && !isStreamingMessage && (
            <div className={`text-xs text-text-muted px-2 ${isUser ? "text-right" : "text-left"}`}>
              {format(new Date(message.timestamp), "h:mm a")}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;