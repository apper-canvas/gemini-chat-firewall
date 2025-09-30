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

async sendMessage(userMessage, onStream = null, retryCount = 0) {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second base delay
    
    try {
      // Enhanced network connectivity check
      if (!navigator.onLine) {
        throw new Error("No internet connection. Please check your connection and try again.");
      }
      
// Test actual connectivity with a quick request
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        await fetch('https://httpbin.org/get', { 
          method: 'HEAD', 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (connectTest) {
        if (connectTest.name === 'AbortError' || connectTest.message?.includes('timeout')) {
          throw new Error("Connection is slow or unstable. Please check your internet connection and try again.");
        }
      }
      
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

      // Add timeout to the function call
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000); // 30 second timeout
      });

      const functionCall = apperClient.functions.invoke(import.meta.env.VITE_GEMINI_CHAT, {
        body: JSON.stringify({ message: userMessage }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await Promise.race([functionCall, timeoutPromise]);
      
      // Check if we have a streaming response (Response object with body stream)
      if (result && result.body && typeof result.body.getReader === 'function') {
        return this.handleStreamingResponse(result, onStream);
      }
      
      // Fallback to non-streaming response handling
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
      
      // Determine if this is a retryable error
      const isRetryable = this.isRetryableError(error);
      
      if (isRetryable && retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying request in ${delay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendMessage(userMessage, onStream, retryCount + 1);
      }
      
      // Enhanced error handling with specific user-friendly messages
      let errorMessage = "Unable to get AI response. Please try again.";
      
      if (error.message?.includes('No internet connection')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Request timeout')) {
        errorMessage = "Request timed out. The AI service might be busy. Please try again.";
      } else if (error.message?.includes('ApperSDK')) {
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
      
      // Add retry information to error message if max retries exceeded
if (isRetryable && retryCount >= maxRetries) {
        errorMessage += ` (Tried ${maxRetries + 1} times)`;
        // For network errors after retries, suggest checking connection
        if (error.message?.includes('network') || error.message?.includes('connect') || error.message?.includes('fetch')) {
          errorMessage += ". Please check your internet connection and try again.";
        }
      }
      
      throw new Error(errorMessage);
    }
  }

  // Helper method to determine if an error is retryable
  isRetryableError(error) {
    const retryablePatterns = [
      /network/i,
      /fetch/i,
      /connect/i,
      /timeout/i,
      /502/,
      /503/,
      /504/,
      /500/,
      /ApperSDK/i,
      /Invalid response/i
    ];
    
    return retryablePatterns.some(pattern => pattern.test(error.message || ''));
  }

async handleStreamingResponse(response, onStream) {
    return new Promise((resolve, reject) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let streamTimeout;
      let hasReceivedData = false;

      // Set up timeout for streaming response
      const timeoutDuration = 60000; // 60 seconds for streaming
      streamTimeout = setTimeout(() => {
        reader.cancel();
        reject(new Error("Streaming response timed out"));
      }, timeoutDuration);

      const readChunk = async () => {
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            clearTimeout(streamTimeout);
            // If we never received any valid data, reject
            if (!hasReceivedData && !accumulatedText.trim()) {
              reject(new Error("No data received from streaming response"));
              return;
            }
            resolve(accumulatedText);
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const dataStr = line.slice(6).trim();
                if (!dataStr) continue;

                const data = JSON.parse(dataStr);
                hasReceivedData = true;
                
                if (data.success === false) {
                  clearTimeout(streamTimeout);
                  reject(new Error(data.error || "Streaming error occurred"));
                  return;
                }

                // Handle both streaming text and direct text
                if (data.text) {
                  accumulatedText += data.text;
                  if (onStream) {
                    try {
                      onStream(accumulatedText);
                    } catch (streamError) {
                      console.error("Error in streaming callback:", streamError);
                      // Don't reject, just log and continue
                    }
                  }
                }

                // Handle completion signals
                if (data.complete || data.success === true) {
                  clearTimeout(streamTimeout);
                  resolve(accumulatedText);
                  return;
                }
              } catch (parseError) {
                console.error("Failed to parse streaming data:", parseError, "Raw line:", line);
                // For malformed data, try to extract any text content
                const textMatch = line.match(/"text"\s*:\s*"([^"]*)"/) || line.match(/"([^"]*)"$/);
                if (textMatch && textMatch[1]) {
                  accumulatedText += textMatch[1];
                  hasReceivedData = true;
                  if (onStream) {
                    try {
                      onStream(accumulatedText);
                    } catch (streamError) {
                      console.error("Error in streaming callback:", streamError);
                    }
                  }
                }
              }
            } else if (line.startsWith('event: done') || line.includes('complete')) {
              clearTimeout(streamTimeout);
              resolve(accumulatedText);
              return;
            } else if (line.startsWith('event: error')) {
              clearTimeout(streamTimeout);
              reject(new Error("Streaming error event received"));
              return;
            }
          }

          // Continue reading next chunk
          readChunk();
        } catch (error) {
          clearTimeout(streamTimeout);
          // Enhanced error handling for streaming
          if (error.name === 'AbortError') {
            reject(new Error("Stream was cancelled"));
          } else if (error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
            reject(new Error("Network error during streaming. Please check your connection."));
          } else if (error.message?.includes('timeout')) {
            reject(new Error("Connection timeout during streaming. Please try again."));
          } else {
            reject(new Error("Stream reading failed: " + error.message));
          }
        }
      };

      readChunk();
    });
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