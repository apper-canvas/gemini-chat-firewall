import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
      adjustTextareaHeight();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <motion.div 
      className="bg-white border-t border-gray-200 p-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-300 rounded-xl placeholder-text-muted transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white resize-none min-h-[50px] max-h-[120px]"
            disabled={disabled}
            rows={1}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="icon"
          disabled={!message.trim() || disabled}
          className="px-4 py-3 h-[50px] w-[50px] flex-shrink-0"
        >
          <ApperIcon 
            name="Send" 
            size={20}
            className="transform rotate-45"
          />
        </Button>
      </form>
    </motion.div>
  );
};

export default MessageInput;