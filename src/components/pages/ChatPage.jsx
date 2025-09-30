import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ChatHeader from "@/components/organisms/ChatHeader";
import MessageList from "@/components/organisms/MessageList";
import MessageInput from "@/components/molecules/MessageInput";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
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
      console.error("Chat error:", err);
      
      // Remove the failed AI message if it exists
      setMessages(prev => prev.filter(msg => msg.id !== (Date.now() + 1).toString()));
      
      // Check if this is an empty response or parse error (retryable)
      const isEmptyResponse = err.message?.includes("Empty response");
      const isParseError = err.message?.includes("parse") || err.message?.includes("Invalid");
      const isRetryableError = 
        isEmptyResponse ||
        isParseError ||
        err.message?.includes("timeout") ||
        err.message?.includes("network") ||
        err.message?.includes("503");
      
      const errorMessage = err.message || "Failed to send message";
      setError(errorMessage);
      
      // Show more helpful error message for retryable errors
      if (isRetryableError) {
        let userMessage = errorMessage;
        if (isEmptyResponse) {
          userMessage = "The AI service returned an empty response. This sometimes happens - please try again.";
        } else if (isParseError) {
          userMessage = "Received unexpected response format. Please try again.";
        }
        
        toast.error(
          <div>
            <div>{userMessage}</div>
            <button 
              onClick={() => {
                toast.dismiss();
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
        toast.error(errorMessage.length > 80 ? "AI service error. Please try again later." : errorMessage, {
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
      toast.success("Chat cleared successfully");
    } catch (err) {
      console.error("Failed to clear chat:", err);
      setError("Failed to clear chat");
      toast.error("Failed to clear chat");
    }
  };

  const handleRetry = () => {
    setError("");
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage.content);
    } else {
      loadChatHistory();
    }
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