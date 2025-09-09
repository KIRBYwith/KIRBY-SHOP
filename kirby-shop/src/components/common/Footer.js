// src/components/common/Footer.js

import React from 'react';
import { Star, Heart, Mail, Phone, MapPin, Clock, Sparkles } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (linkType, value) => {
    switch (linkType) {
      case 'phone':
        window.open(`tel:${value}`);
        break;
      case 'email':
        window.open(`mailto:${value}`);
        break;
      case 'chat':
        // 실제로는 채팅 시스템 연동
        alert('실시간 채팅 상담을 시작합니다! 💬');
        break;
      case 'external':
        window.open(value, '_blank');
        break;
      default:
        console.log(`${linkType} 페이지로 이동:`, value);
    }
  };

  return (
    <footer className="footer">
      {/* 메인 푸터 콘텐츠 */}
      <div className="footer-content">
        {/* 고객센터 정보 */}
        <div className="footer-section">
          <h3 className="footer-title">
            <Phone size={20} />
            고객센터
          </h3>
          <div className="footer-links">
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('phone', '1588-0000')}
            >
              📞 1588-0000
            </button>
            <div className="footer-text">
              <Clock size={16} />
              <span>평일 9:00-18:00 (토/일/공휴일 휴무)</span>
            </div>
            <div className="footer-text">
              <span>점심시간 12:00-13:00</span>
            </div>
            <button 
              className="footer-link chat-link"
              onClick={() => handleLinkClick('chat')}
            >
              💬 실시간 채팅 상담
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('email', 'support@kirbyshop.com')}
            >
              <Mail size={16} />
              이메일 문의
            </button>
          </div>
        </div>

        {/* 쇼핑 정보 */}
        <div className="footer-section">
          <h3 className="footer-title">
            <Star size={20} />
            쇼핑 정보
          </h3>
          <div className="footer-links">
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/mypage/orders')}
            >
              📦 주문/배송 조회
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/mypage/returns')}
            >
              🔄 교환/반품 신청
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/reviews')}
            >
              ⭐ 리뷰 작성
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/faq')}
            >
              ❓ 자주 묻는 질문
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/size-guide')}
            >
              📏 사이즈 가이드
            </button>
          </div>
        </div>

        {/* 회사 정보 */}
        <div className="footer-section">
          <h3 className="footer-title">
            <Sparkles size={20} />
            커비숍
          </h3>
          <div className="footer-links">
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/about')}
            >
              🏢 회사소개
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/careers')}
            >
              💼 채용정보
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/partnership')}
            >
              🤝 제휴문의
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLinkClick('page', '/press')}
            >
              📰 보도자료
            </button>
            <div className="footer-text">
              <MapPin size={16} />
              <span>서울시 강남구 커비로 123</span>
            </div>
          </div>
        </div>

        {/* 소셜 미디어 & 앱 다운로드 */}
        <div className="footer-section">
          <h3 className="footer-title">
            <Heart size={20} />
            소셜 & 앱
          </h3>
          <div className="footer-links">
            <div className="social-links">
              <button 
                className="social-button instagram"
                onClick={() => handleLinkClick('external', 'https://instagram.com/kirbyshop')}
              >
                📸 인스타그램
              </button>
              <button 
                className="social-button youtube"
                onClick={() => handleLinkClick('external', 'https://youtube.com/kirbyshop')}
              >
                📺 유튜브
              </button>
              <button 
                className="social-button kakao"
                onClick={() => handleLinkClick('external', 'https://pf.kakao.com/kirbyshop')}
              >
                💬 카카오톡
              </button>
            </div>
            <div className="app-download">
              <p className="app-text">📱 앱 다운로드</p>
              <button 
                className="app-button ios"
                onClick={() => handleLinkClick('external', 'https://apps.apple.com/kirbyshop')}
              >
                🍎 App Store
              </button>
              <button 
                className="app-button android"
                onClick={() => handleLinkClick('external', 'https://play.google.com/store/apps/kirbyshop')}
              >
                🤖 Google Play
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="footer-divider"></div>

      {/* 하단 정보 */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          {/* 회사 법적 정보 */}
          <div className="company-info">
            <p>
              <strong>㈜커비숍</strong> | 대표: 커비킹 | 사업자등록번호: 123-45-67890
            </p>
            <p>
              통신판매업신고: 제2024-서울강남-1234호 | 
              개인정보보호책임자: 커비매니저 (privacy@kirbyshop.com)
            </p>
            <p>
              주소: 서울시 강남구 커비로 123, 커비빌딩 5층 | 
              호스팅서비스: ㈜커비클라우드
            </p>
          </div>

          {/* 법적 링크들 */}
          <div className="legal-links">
            <button 
              className="legal-link"
              onClick={() => handleLinkClick('page', '/terms')}
            >
              이용약관
            </button>
            <span className="divider">|</span>
            <button 
              className="legal-link privacy"
              onClick={() => handleLinkClick('page', '/privacy')}
            >
              <strong>개인정보처리방침</strong>
            </button>
            <span className="divider">|</span>
            <button 
              className="legal-link"
              onClick={() => handleLinkClick('page', '/youth-protection')}
            >
              청소년보호정책
            </button>
            <span className="divider">|</span>
            <button 
              className="legal-link"
              onClick={() => handleLinkClick('page', '/dispute')}
            >
              분쟁처리절차
            </button>
          </div>

          {/* 저작권 정보 */}
          <div className="copyright">
            <p>
              © {currentYear} KIRBY-SHOP. All rights reserved. 
              <Star size={16} className="copyright-icon" />
            </p>
            <p className="copyright-sub">
              커비 캐릭터는 Nintendo의 상표입니다. 당사는 정식 라이선스를 보유하고 있습니다.
            </p>
          </div>

          {/* 인증 마크들 */}
          <div className="certifications">
            <div className="cert-item">
              <span className="cert-mark">🛡️</span>
              <span className="cert-text">SSL 보안인증</span>
            </div>
            <div className="cert-item">
              <span className="cert-mark">✅</span>
              <span className="cert-text">전자상거래 우수업체</span>
            </div>
            <div className="cert-item">
              <span className="cert-mark">💳</span>
              <span className="cert-text">안전결제 시스템</span>
            </div>
          </div>
        </div>
      </div>

      {/* 플로팅 버튼들 (모바일에서 유용) */}
      <div className="floating-buttons">
        <button 
          className="floating-button top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="맨 위로"
        >
          ⬆️
        </button>
        <button 
          className="floating-button chat"
          onClick={() => handleLinkClick('chat')}
          title="실시간 상담"
        >
          💬
        </button>
      </div>
    </footer>
  );
};

export default Footer;