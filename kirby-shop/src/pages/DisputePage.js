// src/pages/DisputePage.js

import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/LegalPage.css';

const DisputePage = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>분쟁처리절차</h1>
          <div className="legal-content">
            <section>
              <h2>1. 분쟁처리절차의 목적</h2>
              <p>
                ㈜커비숍(이하 "회사")은 고객과의 분쟁을 신속하고 공정하게 해결하기 위해 분쟁처리절차를 수립하여 운영하고 있습니다. 회사는 고객의 권익을 보호하고 서비스의 품질을 향상시키기 위해 최선을 다하고 있습니다.
              </p>
            </section>

            <section>
              <h2>2. 분쟁 신고 및 접수</h2>
              <p>고객은 다음과 같은 방법으로 분쟁을 신고할 수 있습니다.</p>
              <ul>
                <li><strong>고객센터:</strong> 1588-0000 (평일 9:00-18:00)</li>
                <li><strong>이메일:</strong> dispute@kirbyshop.com</li>
                <li><strong>온라인 신고:</strong> 홈페이지 고객센터 게시판</li>
                <li><strong>우편:</strong> 서울시 강남구 커비로 123, 커비빌딩 5층 고객센터</li>
              </ul>
            </section>

            <section>
              <h2>3. 분쟁처리 절차</h2>
              <div className="process-steps">
                <div className="step">
                  <h3>1단계: 신고 접수</h3>
                  <p>고객의 분쟁 신고를 접수하고 접수번호를 부여합니다.</p>
                  <span className="step-time">접수 후 즉시</span>
                </div>
                <div className="step">
                  <h3>2단계: 사안 검토</h3>
                  <p>신고된 내용을 검토하고 관련 자료를 수집합니다.</p>
                  <span className="step-time">접수 후 1일 이내</span>
                </div>
                <div className="step">
                  <h3>3단계: 조사 및 확인</h3>
                  <p>관련 부서와 협의하여 사실관계를 확인합니다.</p>
                  <span className="step-time">접수 후 3일 이내</span>
                </div>
                <div className="step">
                  <h3>4단계: 해결방안 제시</h3>
                  <p>분쟁 해결을 위한 구체적인 방안을 제시합니다.</p>
                  <span className="step-time">접수 후 5일 이내</span>
                </div>
                <div className="step">
                  <h3>5단계: 결과 통보</h3>
                  <p>분쟁 처리 결과를 고객에게 통보합니다.</p>
                  <span className="step-time">접수 후 7일 이내</span>
                </div>
              </div>
            </section>

            <section>
              <h2>4. 분쟁 유형별 처리 기준</h2>
              <div className="dispute-types">
                <div className="dispute-type">
                  <h3>배송 관련 분쟁</h3>
                  <ul>
                    <li>배송 지연: 배송비 환불 또는 보상</li>
                    <li>배송 오류: 재배송 또는 환불</li>
                    <li>상품 손상: 교환 또는 환불</li>
                  </ul>
                </div>
                <div className="dispute-type">
                  <h3>결제 관련 분쟁</h3>
                  <ul>
                    <li>중복 결제: 즉시 환불</li>
                    <li>결제 오류: 정정 및 보상</li>
                    <li>할인 미적용: 차액 환불</li>
                  </ul>
                </div>
                <div className="dispute-type">
                  <h3>상품 관련 분쟁</h3>
                  <ul>
                    <li>상품 불량: 교환 또는 환불</li>
                    <li>상품 정보 오류: 교환 또는 환불</li>
                    <li>사이즈 불일치: 교환</li>
                  </ul>
                </div>
                <div className="dispute-type">
                  <h3>서비스 관련 분쟁</h3>
                  <ul>
                    <li>고객응대 불만: 개선 및 사과</li>
                    <li>정보 오류: 정정 및 보상</li>
                    <li>시스템 장애: 복구 및 보상</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2>5. 분쟁조정기관</h2>
              <p>
                회사 내부에서 해결되지 않는 분쟁의 경우, 다음 기관에 조정을 신청할 수 있습니다.
              </p>
              <ul>
                <li><strong>공정거래위원회:</strong> 02-2000-2000</li>
                <li><strong>소비자분쟁조정위원회:</strong> 02-3460-3000</li>
                <li><strong>전자상거래분쟁조정위원회:</strong> 02-2122-3000</li>
                <li><strong>한국소비자원:</strong> 02-3460-3000</li>
              </ul>
            </section>

            <section>
              <h2>6. 분쟁처리 담당자</h2>
              <div className="contact-info">
                <p><strong>분쟁처리책임자:</strong> 커비메디에이터</p>
                <p><strong>연락처:</strong> dispute@kirbyshop.com</p>
                <p><strong>전화:</strong> 1588-0000 (내선 3번)</p>
                <p><strong>팩스:</strong> 02-1234-5678</p>
                <p><strong>주소:</strong> 서울시 강남구 커비로 123, 커비빌딩 5층</p>
              </div>
            </section>

            <section>
              <h2>7. 분쟁처리 기록 관리</h2>
              <p>회사는 분쟁처리 과정을 다음과 같이 기록하고 관리합니다.</p>
              <ul>
                <li><strong>기록 보관:</strong> 분쟁처리 완료 후 3년간 보관</li>
                <li><strong>통계 분석:</strong> 분쟁 유형별 통계 분석 및 개선방안 도출</li>
                <li><strong>교육 자료:</strong> 분쟁 예방을 위한 직원 교육 자료로 활용</li>
                <li><strong>정책 개선:</strong> 분쟁처리 경험을 바탕으로 정책 개선</li>
              </ul>
            </section>

            <section>
              <h2>8. 분쟁 예방을 위한 노력</h2>
              <p>회사는 분쟁을 예방하기 위해 다음과 같은 노력을 하고 있습니다.</p>
              <ul>
                <li>명확한 약관 및 정책 수립</li>
                <li>상품 정보의 정확한 제공</li>
                <li>배송 및 결제 시스템의 안정화</li>
                <li>고객 응대 서비스의 개선</li>
                <li>정기적인 고객 만족도 조사</li>
              </ul>
            </section>

            <div className="legal-footer">
              <p><strong>시행일자:</strong> 2024년 1월 1일</p>
              <p><strong>최종 수정일:</strong> 2024년 12월 1일</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DisputePage;
