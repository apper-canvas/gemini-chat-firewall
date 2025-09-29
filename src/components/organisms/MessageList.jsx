import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MessageBubble from "@/components/molecules/MessageBubble";
import WelcomeMessage from "@/components/molecules/WelcomeMessage";

const MessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "end"
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-gray-50">
        <WelcomeMessage />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-gray-50 px-4 py-6"
    >
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
<AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message?.id || message?.timestamp || `message-${index}-${Date.now()}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3,
                layout: { duration: 0.2 }
              }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageBubble isTyping={true} />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </motion.div>
    </div>
  );
};

export default MessageList;