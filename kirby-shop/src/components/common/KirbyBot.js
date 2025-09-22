import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ShoppingBag, Star, Send } from 'lucide-react';
import { productsData, getBestSellerProducts, getNewProducts, getDiscountedProducts } from '../../data/products';
import '../../styles/KirbyBot.css';

const KirbyBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("찾고있는 상품을 추천해드릴게요~ ⭐");
  // 채팅 기능 상태
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // 실제 상품 데이터에서 추천 상품 생성
  const getRecommendationProducts = () => {
    const bestSellers = getBestSellerProducts();
    const newProducts = getNewProducts();
    const discountedProducts = getDiscountedProducts();
    
    // 다양한 추천 전략
    const strategies = [
      () => bestSellers.slice(0, 3), // 베스트셀러
      () => newProducts.slice(0, 3), // 신상품
      () => discountedProducts.slice(0, 3), // 할인상품
      () => productsData.filter(p => p.rating >= 4.5).slice(0, 3), // 높은 평점
      () => productsData.filter(p => p.stock <= 20).slice(0, 3), // 재고 부족 (긴급)
    ];
    
    // 랜덤 전략 선택
    const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
    return randomStrategy();
  };

  // 랜덤 메시지 배열
  const botMessages = [
    "찾고있는 상품을 추천해드릴게요~ ⭐",
    "오늘의 특별 추천 상품을 보여드릴게요! ✨",
    "커비가 엄선한 상품들을 확인해보세요~ 🌟",
    "인기 상품들을 추천해드릴게요! 💫",
    "특가 상품들을 찾아왔어요~ 🎁",
    "베스트셀러 상품을 추천해드릴게요! 🏆",
    "새로 나온 상품들을 확인해보세요! 🆕",
    "높은 평점의 상품들을 추천해드릴게요! ⭐⭐⭐⭐⭐"
  ];

  // 랜덤 추천 상품 생성
  const generateRecommendations = () => {
    setIsLoading(true);
    
    // 랜덤 메시지 선택
    const randomMessage = botMessages[Math.floor(Math.random() * botMessages.length)];
    setCurrentMessage(randomMessage);
    
    // 실제 상품 데이터에서 추천 상품 선택
    const selectedProducts = getRecommendationProducts();
    
    setTimeout(() => {
      setRecommendations(selectedProducts);
      setIsLoading(false);
    }, 800); // 로딩 시간을 조금 줄임
  };

  // 봇 클릭 시 자동으로 추천 갱신
  const handleBotClick = () => {
    if (!isOpen) {
      generateRecommendations();
    }
    toggleBot();
  };

  // 컴포넌트 마운트 시 추천 생성
  useEffect(() => {
    generateRecommendations();
    // 초기 환영 메시지 추가
    setChatMessages([
      {
        type: 'bot',
        message: '안녕하세요! 저는 커비봇이에요~ 🌟 궁금한 것이 있으시면 언제든 물어보세요!',
        timestamp: new Date()
      }
    ]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 채팅 응답 생성
  const generateChatResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // 키워드 기반 응답
    if (message.includes('안녕') || message.includes('hi') || message.includes('hello')) {
      return '안녕하세요! 커비봇이에요~ 😊 어떤 도움이 필요하신가요?';
    }
    
    if (message.includes('추천') || message.includes('상품')) {
      return '상품 추천을 원하신다면 위의 "채팅" 버튼을 눌러서 추천 모드로 바꿔보세요! 베스트셀러부터 신상품까지 다양하게 추천해드릴게요~ 🛍️';
    }
    
    if (message.includes('가격') || message.includes('할인')) {
      return '할인 상품을 찾고 계시는군요! 현재 특가 상품들이 많이 있어요~ 💰';
    }
    
    if (message.includes('배송')) {
      return '배송은 보통 2-3일 정도 걸려요! 무료배송 조건도 확인해보세요~ 📦';
    }
    
    if (message.includes('사이즈') || message.includes('크기')) {
      return '상품 상세페이지에서 사이즈 정보를 확인하실 수 있어요~ 📏';
    }
    
    if (message.includes('교환') || message.includes('환불')) {
      return '교환/환불은 구매일로부터 7일 이내에 가능해요! 자세한 내용은 고객센터에 문의해주세요~ 🔄';
    }
    
    if (message.includes('커비') || message.includes('kirby')) {
      const kirbyResponses = [
        '커비 상품들이 정말 귀엽죠! 저도 커비를 정말 좋아해요~ 💕',
        '커비는 정말 사랑스러워요! 특히 별을 먹을 때가 제일 귀여워요~ ⭐',
        '커비 굿즈 컬렉션이 정말 다양해요! 어떤 걸 찾고 계신가요? 🎀'
      ];
      return kirbyResponses[Math.floor(Math.random() * kirbyResponses.length)];
    }
    
    if (message.includes('결제') || message.includes('카드') || message.includes('페이')) {
      return '결제는 카카오페이, 토스페이, 네이버페이, 신용카드 등 다양한 방법으로 가능해요! 안전하게 결제하실 수 있어요~ 💳';
    }
    
    if (message.includes('쿠폰')) {
      return '쿠폰함에서 다양한 쿠폰을 확인하실 수 있어요! 신규가입 쿠폰부터 할인쿠폰까지 다양해요~ 🎫';
    }
    
    if (message.includes('고마') || message.includes('감사')) {
      return '천만에요! 도움이 되어서 기뻐요~ 또 궁금한 게 있으면 언제든 물어보세요! 😊';
    }
    
    if (message.includes('귀여') || message.includes('예쁘')) {
      return '헤헤~ 고마워요! 커비샵의 상품들도 다 귀엽고 예쁘답니다~ 💕';
    }
    
    // 기본 응답들
    const defaultResponses = [
      '흥미로운 질문이네요! 더 자세히 설명해주실 수 있나요? 🤔',
      '음... 그건 잘 모르겠어요! 고객센터에 문의해보시는 건 어떨까요? 📞',
      '좋은 질문이에요! 상품 상세페이지에서 더 많은 정보를 확인해보세요~ 📖',
      '커비봇이 더 공부해서 답변드릴게요! 지금은 상품 추천을 도와드릴 수 있어요~ 🌟',
      '와! 정말 궁금한 게 많으시네요! 다른 것도 물어보세요~ ✨',
      '저도 그게 궁금해요! 함께 알아보시겠어요? 🔍',
      '재미있는 이야기네요! 더 들려주세요~ 👂'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  // 채팅 메시지 전송
  const handleSendMessage = () => {
    if (!userInput.trim() || isTyping) return;
    
    const currentInput = userInput.trim(); // 입력값을 미리 저장하고 공백 제거
    const userMessage = {
      type: 'user',
      message: currentInput,
      timestamp: new Date()
    };
    
    console.log('메시지 전송:', currentInput);
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);
    
    // 봇 응답 시뮬레이션 (1-2초 후)
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        message: generateChatResponse(currentInput), // 저장된 입력값 사용
        timestamp: new Date()
      };
      
      console.log('봇 응답:', botResponse.message);
      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 700); // 응답 시간을 조금 더 빠르게
  };

  // Enter 키 처리
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 채팅 메시지 스크롤 자동 이동
  useEffect(() => {
    if (isChatMode && chatMessages.length > 0) {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        setTimeout(() => {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 100);
      }
    }
  }, [chatMessages, isChatMode]);

  // 추천 상품 클릭 핸들러
  const handleRecommendationClick = (product) => {
    // 상품 상세 페이지로 이동
    window.location.href = `/product/${product.id}`;
    // 클릭 후 말풍선 닫기
    setIsOpen(false);
  };

  // 봇 토글
  const toggleBot = () => {
    setIsOpen(!isOpen);
  };

  // 봇 다시 보이기 (3초 후)
  useEffect(() => {
    if (!isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="kirby-bot-container">
      {/* 말풍선 */}
      {isOpen && (
        <div className="kirby-bot-speech-bubble">
          <div className="speech-bubble-content">
            <div className="speech-bubble-header">
              <span className="bot-title">
                {isChatMode ? '💬 커비봇과 대화하기' : '✨ 커비 추천봇 ✨'}
              </span>
              <div className="header-buttons">
                <button 
                  className={`mode-toggle-btn ${isChatMode ? 'active' : ''}`}
                  onClick={() => {
                    setIsChatMode(!isChatMode);
                    console.log('채팅 모드 전환:', !isChatMode);
                  }}
                  title={isChatMode ? '추천 모드로 전환' : '채팅 모드로 전환'}
                >
                  <MessageCircle size={16} />
                  <span style={{fontSize: '10px', marginLeft: '4px'}}>
                    {isChatMode ? '추천' : '채팅'}
                  </span>
                </button>
                <button className="close-bot-btn" onClick={toggleBot}>
                  <X size={16} />
                </button>
              </div>
            </div>
            
            {/* 채팅 모드 */}
            {isChatMode ? (
              <div className="chat-container">
                <div className="chat-messages">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.type}`}>
                      <div className="message-content">
                        {msg.message}
                      </div>
                      <div className="message-time">
                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="chat-message bot typing">
                      <div className="message-content">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="chat-input-container">
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="메시지를 입력하세요..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button 
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!userInput.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* 추천 모드 */
              <div className="recommendation-container">
                <div className="speech-bubble-message">
                  <p>{currentMessage}</p>
                </div>

                {isLoading ? (
                  <div className="loading-recommendations">
                    <div className="loading-spinner"></div>
                    <p>추천 상품을 찾고 있어요...</p>
                  </div>
                ) : (
              <div className="recommendations-list">
                {recommendations.map((product) => (
                  <div 
                    key={product.id} 
                    className="recommendation-item"
                    onClick={() => handleRecommendationClick(product)}
                  >
                    <div className="recommendation-image">
                      <img src={product.image} alt={product.title} />
                      {product.discount > 0 && (
                        <div className="discount-badge">
                          -{product.discount}%
                        </div>
                      )}
                      {product.isNew && (
                        <div className="new-badge">
                          NEW
                        </div>
                      )}
                      {product.isBestSeller && (
                        <div className="bestseller-badge">
                          BEST
                        </div>
                      )}
                    </div>
                    <div className="recommendation-info">
                      <h4>{product.title}</h4>
                      <div className="recommendation-category">
                        {product.category}
                      </div>
                      <div className="recommendation-rating">
                        ⭐ {product.rating} ({product.reviewCount}개 리뷰)
                      </div>
                      <div className="recommendation-price">
                        {product.discount > 0 ? (
                          <>
                            <span className="original-price">
                              {product.originalPrice?.toLocaleString()}원
                            </span>
                            <span className="discounted-price">
                              {product.price.toLocaleString()}원
                            </span>
                          </>
                        ) : (
                          <span className="price">
                            {product.price.toLocaleString()}원
                          </span>
                        )}
                      </div>
                      <div className="recommendation-stock">
                        재고: {product.stock}개
                      </div>
                    </div>
                    <div className="recommendation-action">
                      <ShoppingBag size={16} />
                    </div>
                  </div>
                ))}
                  </div>
                )}

                <div className="speech-bubble-footer">
                  <button 
                    className="refresh-btn"
                    onClick={generateRecommendations}
                    disabled={isLoading}
                  >
                    <Star size={14} />
                    다른 추천 보기
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* 말풍선 꼬리 */}
          <div className="speech-bubble-tail"></div>
        </div>
      )}

      {/* 커비봇 아이콘 */}
      <div className="kirby-bot-icon" onClick={handleBotClick}>
        <img 
          src="/bot/kirby-star2.png" 
          alt="커비봇" 
          className="kirby-image"
        />
        <div className="bot-pulse"></div>
        <div className="bot-notification">
          <MessageCircle size={12} />
        </div>
      </div>
    </div>
  );
};

export default KirbyBot;
