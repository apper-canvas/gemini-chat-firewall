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
      const { ApperClient } = window.ApperSDK;
      
      if (!ApperClient) {
        throw new Error("ApperSDK not loaded");
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
      const responseData = await result.json();

      if (!responseData.success) {
        console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_GEMINI_CHAT}. The response body is: ${JSON.stringify(responseData)}.`);
        throw new Error(responseData.error || "Failed to get AI response");
      }

      return responseData.response;
} catch (error) {
      console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_GEMINI_CHAT}. The error is: ${error.message}`);
      
      // Enhanced error handling with more specific messages
      let errorMessage = "Failed to get AI response from Gemini";
      
      if (error.message?.includes('ApperSDK')) {
        errorMessage = "Chat service is currently unavailable";
      } else if (error.message?.includes('fetch')) {
        errorMessage = "Network connection error. Please check your internet connection.";
      } else if (error.message?.includes('API key')) {
        errorMessage = "AI service configuration error. Please try again later.";
      }
      
      throw new Error(errorMessage);
    }
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