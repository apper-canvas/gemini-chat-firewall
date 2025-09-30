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
      
      // Enhanced error categorization with specific user guidance
      const isConnectionError = err.message?.includes('internet') || 
                               err.message?.includes('connection') ||
                               err.message?.includes('check your connection') ||
                               err.message?.includes('slow or unstable');
      
      const isNetworkError = err.message?.includes('network') || 
                            err.message?.includes('fetch') ||
                            err.message?.includes('Network Error');
      
      const isTimeoutError = err.message?.includes('timeout') ||
                            err.message?.includes('timed out');
      
      const isServiceError = err.message?.includes('busy') ||
                            err.message?.includes('loading') ||
                            err.message?.includes('temporarily unavailable') ||
                            err.message?.includes('rate limit');
      
      const isRetryableError = isConnectionError || isNetworkError || isTimeoutError || isServiceError ||
                              err.message?.includes('Tried') ||
                              err.message?.includes('Stream') ||
                              err.message?.includes('500') ||
                              err.message?.includes('502') ||
                              err.message?.includes('503');
      if (isRetryableError) {
        // Add a retry button to the toast for retryable errors
        toast.error(
          <div>
            <div>{errorMessage}</div>
            <button 
              onClick={() => {
                toast.dismiss(); // Close current toast
                handleSendMessage(content);
              }}
              className="mt-2 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded px-2 py-1"
            >
              Try Again
            </button>
          </div>,
          { 
            autoClose: false,
            closeOnClick: false 
          }
        );
      } else {
        // Show appropriate toast message for non-retryable errors
        const toastMessage = errorMessage.length > 80 ? 
          "AI service error. Please try again later." : 
          errorMessage;
        toast.error(toastMessage, {
          autoClose: 5000
        });
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
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