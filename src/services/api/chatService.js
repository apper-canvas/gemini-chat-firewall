import messagesData from "@/services/mockData/messages.json";

class ChatService {
  constructor() {
    this.messages = [...messagesData];
    this.storageKey = "gemini-chat-messages";
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.messages = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load messages from storage:", error);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.messages));
    } catch (error) {
      console.error("Failed to save messages to storage:", error);
    }
  }

  async getChatHistory() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.messages]);
      }, 300);
    });
  }

  async saveMessage(message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage = {
          ...message,
          Id: this.getNextId()
        };
        this.messages.push(newMessage);
        this.saveToStorage();
        resolve(newMessage);
      }, 200);
    });
  }

async sendMessage(userMessage) {
    try {
      // Wait for ApperSDK to be ready with timeout
      await this.waitForApperSDK();
      
      const { ApperClient } = window.ApperSDK;
      
      if (!ApperClient) {
        throw new Error("ApperSDK failed to initialize");
      }

      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

const result = await apperClient.functions.invoke(import.meta.env.VITE_GEMINI_CHAT, {
        body: JSON.stringify({ message: userMessage }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // ApperSDK returns data directly, not a Response object with .json() method
      let responseData;
      
      // Handle different response formats defensively
      if (result && typeof result === 'object') {
        responseData = result;
      } else if (typeof result === 'string') {
        try {
          responseData = JSON.parse(result);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error("Invalid response format from AI service");
        }
      } else {
        throw new Error("Unexpected response format from AI service");
      }

      // Validate response structure
      if (!responseData || typeof responseData !== 'object') {
        console.info(`apper_info: Invalid response structure from function: ${import.meta.env.VITE_GEMINI_CHAT}. Response: ${JSON.stringify(responseData)}.`);
        throw new Error("Invalid response from AI service");
      }

      if (!responseData.success) {
        console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_GEMINI_CHAT}. The response body is: ${JSON.stringify(responseData)}.`);
        throw new Error(responseData.error || "Failed to get AI response");
      }

      if (!responseData.response) {
        throw new Error("No response content received from AI service");
      }

      return responseData.response;
    } catch (error) {
      console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_GEMINI_CHAT}. The error is: ${error.message}`);
      
      // Enhanced error handling with specific user-friendly messages
      let errorMessage = "Unable to get AI response. Please try again.";
      
      if (error.message?.includes('ApperSDK')) {
        errorMessage = "Chat service is loading. Please wait a moment and try again.";
      } else if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('connect')) {
        errorMessage = "Connection issue. Please check your internet and try again.";
      } else if (error.message?.includes('API key') || error.message?.includes('401')) {
        errorMessage = "AI service temporarily unavailable. Please try again later.";
      } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.message?.includes('500') || error.message?.includes('server')) {
        errorMessage = "AI service is experiencing issues. Please try again in a few minutes.";
      } else if (error.message?.includes('Invalid response') || error.message?.includes('parse')) {
        errorMessage = "AI service returned an invalid response. Please try again.";
      } else if (error.message && !error.message.includes('Failed to get AI response')) {
        errorMessage = error.message; // Use specific error from edge function
      }
      
      throw new Error(errorMessage);
    }
  }

  // Helper method to wait for ApperSDK to be ready
  async waitForApperSDK(timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (window.ApperSDK?.ApperClient) {
        return;
      }
      
      // Wait 100ms before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error("ApperSDK failed to load within timeout period");
  }

  async clearChat() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.messages = [];
        this.saveToStorage();
        resolve();
      }, 300);
    });
  }

  getNextId() {
    const ids = this.messages.map(msg => msg.Id).filter(id => Number.isInteger(id));
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }
}

const chatService = new ChatService();
export default chatService;