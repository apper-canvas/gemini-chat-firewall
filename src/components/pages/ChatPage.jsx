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
  const [isStreaming, setIsStreaming] = useState(false);
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

      // Create placeholder AI message for streaming
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: "",
        sender: "ai",
        timestamp: new Date().toISOString(),
        streaming: true
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      setIsStreaming(true);

      // Get AI response with streaming
      const aiResponse = await chatService.sendMessage(content, (streamedText) => {
        // Update the AI message content as text streams in
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessage.id 
              ? { ...msg, content: streamedText, streaming: true }
              : msg
          )
        );
      });
      
      // Update final message and mark as complete
      const finalAiMessage = {
        ...aiMessage,
        content: aiResponse,
        streaming: false
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessage.id ? finalAiMessage : msg
        )
      );
      
      // Save final AI message
      await chatService.saveMessage(finalAiMessage);
      
    } catch (err) {
      const errorMessage = err.message || "Failed to get AI response. Please try again.";
      setError(errorMessage);
      console.error("Send message error:", err);
      
      // Remove the placeholder AI message on error
      setMessages(prev => prev.filter(msg => !(msg.sender === "ai" && msg.content === "")));
      
      // Show appropriate toast message based on error length and content
      const toastMessage = errorMessage.length > 60 ? "Failed to send message" : errorMessage;
      toast.error(toastMessage);
    } finally {
setIsLoading(false);
      setIsStreaming(false);
      
      // Check if error is network-related and offer retry
      if (error.message?.includes('internet') || error.message?.includes('network') || error.message?.includes('connection')) {
        // Add a retry button to the toast for network errors
        toast.error(
          <div>
            <div>{error.message}</div>
            <button 
              onClick={() => handleSendMessage(content)}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>,
          { autoClose: false }
        );
      } else {
        toast.error(error.message);
      }
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
        isStreaming={isStreaming}
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        disabled={isLoading}
      />
    </motion.div>
  );
};

export default ChatPage;