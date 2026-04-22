import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";
import { API_V1_URL } from "../../config/apiConfig";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your HMS Virtual Assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${API_V1_URL}/chatbot/ask`,
        { message: userMessage },
        {
          headers: { Authorization: `Bearer ${getAuthToken()}` },
          withCredentials: true
        }
      );
      
      setMessages((prev) => [...prev, { sender: "bot", text: response.data.answer }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I'm having trouble connecting right now. Please try again later." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      <button className={`chatbot-toggle-btn ${isOpen ? "hide" : ""}`} onClick={toggleChat}>
        <i className="fas fa-comment-medical"></i>
      </button>

      <div className={`chatbot-window ${isOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <div className="chatbot-title">
            <i className="fas fa-robot"></i> HMS Assistant
          </div>
          <button className="close-btn" onClick={toggleChat}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="chatbot-body" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.sender}`}>
              <div className="message-bubble">{msg.text}</div>
            </div>
          ))}
          {isTyping && (
            <div className="message-row bot">
              <div className="message-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
        </div>

        <form className="chatbot-footer" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !input.trim()}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
