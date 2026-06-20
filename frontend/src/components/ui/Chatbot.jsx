import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiX, FiMessageSquare } from 'react-icons/fi';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      sender: 'bot',
      text: "Hello! I'm AirGuard, your air quality assistant. Ask me about AQI, air pollution, or health precautions!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    addMessage('user', userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/chatbot`, { message: userMessage });
      if (response.data.message) {
        addMessage('bot', response.data.message);
      } else {
        throw new Error('Empty response from server');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Sorry, I'm having trouble responding.";
      addMessage('bot', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (sender, text) => {
    const newMessage = {
      id: Date.now(),
      sender,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {isOpen ? (
        <div
          className="w-80 sm:w-96 h-[500px] bg-gradient-to-br from-green-100 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-2xl flex flex-col border border-green-200 dark:border-gray-600 overflow-hidden transform transition-all duration-300 ease-in-out animate-fadeIn"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-orange-500 text-white p-4 flex justify-between items-center rounded-t-2xl">
            <h3 className="font-semibold text-lg tracking-wide">AirGuard Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-green-100 transition-transform duration-200 transform hover:scale-110"
              aria-label="Close chat"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideIn`}
              >
                <div
                  className={`max-w-[80%] rounded-xl p-3 shadow-md transition-all duration-200 ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-white rounded-br-none'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-200 dark:bg-gray-600 rounded-xl rounded-bl-none p-3 shadow-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-3 border-t border-green-200 dark:border-gray-600 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about air quality..."
                className="flex-1 p-2 border border-green-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-orange-500 disabled:bg-green-300 transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                disabled={isLoading || !input.trim()}
              >
                <FiSend size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-br from-green-600 to-orange-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Open chat"
        >
          <FiMessageSquare size={24} className="animate-pulse" />
          <span className="sr-only">Open chat</span>
        </button>
      )}
    </div>
  );
};

export default Chatbot;