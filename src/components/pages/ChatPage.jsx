import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ChatHeader from "@/components/organisms/ChatHeader";
import MessageList from "@/components/organisms/MessageList";
import MessageInput from "@/components/molecules/MessageInput";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import chatService from "@/services/api/chatService";

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      setInitialLoading(true);
      const history = await chatService.getChatHistory();
      setMessages(history);
    } catch (err) {
      setError("Failed to load chat history");
      console.error("Chat history error:", err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError("");

    try {
      // Save user message
      await chatService.saveMessage(userMessage);

      // Get AI response
      const aiResponse = await chatService.sendMessage(content);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI message
      await chatService.saveMessage(aiMessage);
      
} catch (err) {
      const errorMessage = err.message || "Failed to get AI response. Please try again.";
      setError(errorMessage);
      console.error("Send message error:", err);
      toast.error(errorMessage.length > 50 ? "Failed to send message" : errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await chatService.clearChat();
      setMessages([]);
      setError("");
    } catch (err) {
      setError("Failed to clear chat");
      console.error("Clear chat error:", err);
      toast.error("Failed to clear chat");
    }
  };

  const handleRetry = () => {
    setError("");
    loadChatHistory();
  };

  if (initialLoading) {
    return <Loading />;
  }

  if (error && messages.length === 0) {
    return <Error message={error} onRetry={handleRetry} />;
  }

  return (
    <motion.div 
      className="h-screen flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ChatHeader 
        onClearChat={handleClearChat} 
        messageCount={messages.length}
      />
      
      {error && messages.length > 0 && (
        <motion.div
          className="bg-accent-50 border-l-4 border-accent-500 p-4 m-4 rounded-r-lg"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="flex items-center">
            <p className="text-sm text-accent-700">{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-auto text-accent-500 hover:text-accent-700"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}

      <MessageList 
        messages={messages} 
        isLoading={isLoading}
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </motion.div>
  );
};

export default ChatPage;