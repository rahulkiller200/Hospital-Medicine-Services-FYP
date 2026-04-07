import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_V1_URL } from '../config/apiConfig';

const AIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Logic for health API integration (Obj 3)
      const response = await axios.post(`${API_V1_URL}/health-chat`, { query: input });
      const botMessage = { text: response.data.reply || "I'm sorry, I couldn't process that request.", sender: 'ai' };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot API Error:', error);
      const errorMessage = { text: "Error connecting to the health API.", sender: 'ai' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chatbot-container">
      <h2>AI Health Chatbot (Obj 3)</h2>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && <div className="message ai"><i className="fas fa-spinner fa-spin"></i> Typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a health question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AIChatbot;