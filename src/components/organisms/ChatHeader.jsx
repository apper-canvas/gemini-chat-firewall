import React, { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const ChatHeader = ({ onClearChat, messageCount = 0 }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearChat = () => {
    if (messageCount === 0) {
      toast.info("No messages to clear");
      return;
    }
    setShowConfirm(true);
  };

  const confirmClear = () => {
    onClearChat();
    setShowConfirm(false);
    toast.success("Chat cleared successfully");
  };

  const cancelClear = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <motion.header
        className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-md">
            <ApperIcon name="Sparkles" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Gemini Chat</h1>
            <p className="text-sm text-text-secondary">
              {messageCount > 0 ? `${messageCount} message${messageCount > 1 ? "s" : ""}` : "Ready to chat"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-text-secondary hover:text-accent-600"
            disabled={messageCount === 0}
          >
            <ApperIcon name="Trash2" size={16} className="mr-2" />
            Clear
          </Button>
        </div>
      </motion.header>

      {/* Confirmation Modal */}
      {showConfirm && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                <ApperIcon name="AlertTriangle" size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Clear Chat</h3>
            </div>
            
            <p className="text-text-secondary mb-6">
              Are you sure you want to clear all messages? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={cancelClear}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmClear}
                className="flex-1"
              >
                Clear Chat
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ChatHeader;