// src/components/chat/ChatModal.js

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, Mail, Clock, User, MessageCircle } from 'lucide-react';
import '../../styles/ChatModal.css';

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! 커비숍 고객센터입니다. 무엇을 도와드릴까요? 😊",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const botResponses = [
    "네, 말씀해주세요! 😊",
    "더 자세히 설명해주시면 도움을 드릴 수 있습니다.",
    "그런 경우에는 이렇게 해보시는 것이 좋습니다.",
    "혹시 다른 궁금한 점이 있으시면 언제든 말씀해주세요!",
    "커비숍을 이용해주셔서 감사합니다! 💖",
    "추가로 도움이 필요하시면 언제든 연락주세요.",
    "고객님의 소중한 의견 감사합니다!",
    "더 나은 서비스로 보답하겠습니다! ✨"
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // 봇 응답 시뮬레이션
    setTimeout(() => {
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { text: "주문/배송 문의", icon: "📦" },
    { text: "교환/반품 문의", icon: "🔄" },
    { text: "상품 문의", icon: "🛍️" },
    { text: "회원정보 문의", icon: "👤" },
    { text: "결제 문의", icon: "💳" },
    { text: "기타 문의", icon: "❓" }
  ];

  const handleQuickAction = (action) => {
    const message = `${action.icon} ${action.text}`;
    setInputMessage(message);
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <MessageCircle size={20} />
            </div>
            <div>
              <h3>커비숍 고객센터</h3>
              <span className="chat-status">온라인</span>
            </div>
          </div>
          <button className="chat-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 메시지 영역 */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 액션 */}
        <div className="quick-actions">
          <h4>빠른 문의</h4>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => handleQuickAction(action)}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-text">{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 입력 영역 */}
        <div className="chat-input-area">
          <div className="chat-input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="chat-input"
            />
            <button 
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              <Send size={18} />
            </button>
          </div>
          
          {/* 연락처 정보 */}
          <div className="contact-info">
            <div className="contact-item">
              <Phone size={16} />
              <span>1588-0000</span>
            </div>
            <div className="contact-item">
              <Mail size={16} />
              <span>support@kirbyshop.com</span>
            </div>
            <div className="contact-item">
              <Clock size={16} />
              <span>평일 9:00-18:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
