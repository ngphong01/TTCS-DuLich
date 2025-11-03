import { getAuthHeaders } from "../utils/fetchHelpers";
import { useState, useRef, useEffect } from "react";
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  PaperAirplaneIcon,
  UserIcon,
  SparklesIcon,
  TrashIcon,
  ClockIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là AI Assistant của TravelGo. Tôi có thể giúp bạn tìm hiểu về các điểm đến, đặt chỗ, hoặc trả lời bất kỳ câu hỏi nào về du lịch. Bạn cần hỗ trợ gì?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch("/api/chat/history?limit=20", {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.messages && data.messages.length > 0) {
        const historyMessages: Message[] = [];
        data.messages.forEach((msg: { id: string; message: string; createdAt: string; response: string }) => {
          historyMessages.push({
            id: `user-${msg.id}`,
            text: msg.message,
            isUser: true,
            timestamp: new Date(msg.createdAt)
          });
          historyMessages.push({
            id: `ai-${msg.id}`,
            text: msg.response,
            isUser: false,
            timestamp: new Date(msg.createdAt)
          });
        });
        
        // Add history messages before the welcome message
        setMessages(prev => [
          ...historyMessages.reverse(),
          ...prev.filter(msg => msg.id !== "1")
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const clearChatHistory = async () => {
    try {
      await fetch("/api/chat/history", { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      setMessages([
        {
          id: "1",
          text: "Xin chào! Tôi là AI Assistant của TravelGo. Tôi có thể giúp bạn tìm hiểu về các điểm đến, đặt chỗ, hoặc trả lời bất kỳ câu hỏi nào về du lịch. Bạn cần hỗ trợ gì?",
          isUser: false,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error("Error clearing chat history:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: "typing",
      text: "",
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: userMessage.text }),
      });

      // Remove typing indicator first
      setMessages(prev => prev.filter(msg => msg.id !== "typing"));

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Xin lỗi, tôi không thể trả lời câu hỏi này. Vui lòng thử lại sau.",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== "typing"));

      // Add error message with more specific error handling
      let errorText = "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.";
      
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        errorText = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.";
      } else if (error instanceof Error) {
        errorText = `Lỗi: ${error.message}`;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-50 group"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6 mx-auto group-hover:scale-110 transition-transform duration-200" />
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">TravelGo AI</h3>
                  <p className="text-xs opacity-90">Trực tuyến</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={loadChatHistory}
                disabled={isLoadingHistory}
                className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors disabled:opacity-50"
              >
                <ClockIcon className="h-3 w-3" />
                {isLoadingHistory ? "Đang tải..." : "Lịch sử"}
              </button>
              <button
                onClick={clearChatHistory}
                className="flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs hover:bg-white/30 transition-colors"
              >
                <TrashIcon className="h-3 w-3" />
                Xóa
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-2 max-w-[80%] ${message.isUser ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser 
                      ? "bg-gradient-to-r from-blue-500 to-purple-500" 
                      : "bg-gradient-to-r from-purple-500 to-pink-500"
                  }`}>
                    {message.isUser ? (
                      <UserIcon className="h-4 w-4 text-white" />
                    ) : (
                      <SparklesIcon className="h-4 w-4 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  }`}>
                    {message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Powered by Google AI • TravelGo Assistant
            </p>
          </div>
        </div>
      )}
    </>
  );
}
