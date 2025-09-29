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
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Simulate AI response based on user input
          const response = this.generateAIResponse(userMessage);
          resolve(response);
        } catch (error) {
          reject(new Error("Failed to get AI response"));
        }
      }, 1500); // Simulate AI processing time
    });
  }

  generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Simple response patterns for demo
    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return "Hello! I'm Gemini, your AI assistant. How can I help you today?";
    }
    
    if (message.includes("weather")) {
      return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for the most current conditions in your area.";
    }
    
    if (message.includes("time") || message.includes("date")) {
      const now = new Date();
      return `The current date and time is ${now.toLocaleString()}. Is there anything specific about time or dates you'd like to know?`;
    }
    
    if (message.includes("help") || message.includes("what can you do")) {
      return "I can help you with a wide variety of topics! I can answer questions, explain concepts, help with creative writing, provide analysis, solve problems, and have conversations on many subjects. What would you like assistance with?";
    }
    
    if (message.includes("joke") || message.includes("funny")) {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "Why don't programmers like nature? It has too many bugs!",
        "What do you call a fake noodle? An impasta!"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
    
    if (message.includes("thank")) {
      return "You're very welcome! I'm happy to help. Is there anything else you'd like to know or discuss?";
    }
    
    // Default responses for various topics
    const responses = [
      "That's an interesting question! Let me think about that for you...",
      "I'd be happy to help you with that. Based on what you're asking, here's what I think...",
      "Great question! Here's my perspective on that topic...",
      "I understand what you're asking about. Let me provide you with some helpful information...",
      "That's a thoughtful inquiry. I can certainly help explain that to you..."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Add topic-specific context
    if (message.includes("code") || message.includes("programming")) {
      return randomResponse + " When it comes to programming, there are many approaches and best practices to consider. What specific aspect would you like to focus on?";
    }
    
    if (message.includes("learn") || message.includes("study")) {
      return randomResponse + " Learning is a wonderful journey! The key is to break things down into manageable steps and practice regularly. What subject are you interested in learning about?";
    }
    
    if (message.includes("work") || message.includes("career")) {
      return randomResponse + " Career development is important, and there are many factors to consider when making professional decisions. What specific aspect of work or career would you like to explore?";
    }
    
    return randomResponse + " I'm here to help with whatever you'd like to discuss or learn about. Feel free to ask me anything!";
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