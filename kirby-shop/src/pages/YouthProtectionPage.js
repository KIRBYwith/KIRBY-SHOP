// src/pages/YouthProtectionPage.js

import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/LegalPage.css';

const YouthProtectionPage = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>청소년보호정책</h1>
          <div className="legal-content">
            <section>
              <h2>1. 청소년보호정책의 목적</h2>
              <p>
                ㈜커비숍(이하 "회사")은 청소년이 건전한 인터넷 환경에서 안전하게 활동할 수 있도록 청소년보호정책을 수립하여 운영하고 있습니다. 회사는 청소년의 건전한 성장을 저해하는 각종 유해정보와 행위로부터 청소년을 보호하기 위해 최선을 다하고 있습니다.
              </p>
            </section>

            <section>
              <h2>2. 청소년 유해매체물의 차단</h2>
              <p>회사는 청소년에게 유해한 매체물이 유통되지 않도록 다음과 같은 조치를 취하고 있습니다.</p>
              <ul>
                <li><strong>상품 등급 분류:</strong> 모든 상품에 대해 연령 등급을 명확히 표시</li>
                <li><strong>유해상품 차단:</strong> 청소년에게 유해한 상품의 판매 금지</li>
                <li><strong>검수 시스템:</strong> 상품 등록 시 청소년 유해성 검수</li>
                <li><strong>신고 제도:</strong> 청소년 유해상품 신고 및 처리 시스템 운영</li>
              </ul>
            </section>

            <section>
              <h2>3. 청소년 보호를 위한 기술적 조치</h2>
              <p>회사는 청소년 보호를 위해 다음과 같은 기술적 조치를 취하고 있습니다.</p>
              <ul>
                <li><strong>연령 확인 시스템:</strong> 청소년 연령 확인을 위한 본인인증 시스템</li>
                <li><strong>부모 동의 시스템:</strong> 미성년자 구매 시 법정대리인 동의 확인</li>
                <li><strong>시간 제한:</strong> 청소년의 야간 시간 구매 제한</li>
                <li><strong>금액 제한:</strong> 청소년의 과도한 구매 방지를 위한 금액 제한</li>
              </ul>
            </section>

            <section>
              <h2>4. 청소년 유해정보 신고 및 처리</h2>
              <p>
                회사는 청소년에게 유해한 정보나 행위를 발견한 경우 신고할 수 있는 시스템을 운영하고 있습니다.
              </p>
              <ul>
                <li><strong>신고 방법:</strong> 고객센터 전화, 이메일, 온라인 신고 시스템</li>
                <li><strong>처리 절차:</strong> 신고 접수 → 검토 → 조치 → 결과 통보</li>
                <li><strong>처리 기간:</strong> 신고 접수 후 24시간 이내 조치</li>
                <li><strong>보상 제도:</strong> 유해정보 신고자에 대한 포인트 지급</li>
              </ul>
            </section>

            <section>
              <h2>5. 청소년 보호 교육 및 캠페인</h2>
              <p>회사는 청소년 보호를 위한 교육 및 캠페인을 지속적으로 실시하고 있습니다.</p>
              <ul>
                <li><strong>직원 교육:</strong> 청소년 보호 관련 정기 교육 실시</li>
                <li><strong>고객 교육:</strong> 청소년 보호 관련 정보 제공</li>
                <li><strong>캠페인:</strong> 청소년 보호 관련 온라인 캠페인 실시</li>
                <li><strong>협력:</strong> 청소년 보호 관련 기관과의 협력</li>
              </ul>
            </section>

            <section>
              <h2>6. 청소년 보호 책임자</h2>
              <p>
                회사는 청소년 보호 업무를 총괄하여 책임지고, 청소년 유해정보 신고 및 피해구제 등을 위하여 청소년보호책임자를 지정하고 있습니다.
              </p>
              <div className="contact-info">
                <p><strong>청소년보호책임자:</strong> 커비가디언</p>
                <p><strong>연락처:</strong> youth@kirbyshop.com</p>
                <p><strong>전화:</strong> 1588-0000 (내선 2번)</p>
                <p><strong>팩스:</strong> 02-1234-5678</p>
              </div>
            </section>

            <section>
              <h2>7. 청소년 보호 관련 법령 준수</h2>
              <p>회사는 다음 법령을 준수하여 청소년을 보호하고 있습니다.</p>
              <ul>
                <li>청소년보호법</li>
                <li>정보통신망 이용촉진 및 정보보호 등에 관한 법률</li>
                <li>전자상거래 등에서의 소비자보호에 관한 법률</li>
                <li>개인정보보호법</li>
              </ul>
            </section>

            <section>
              <h2>8. 청소년 보호 정책의 개선</h2>
              <p>
                회사는 청소년 보호 정책을 지속적으로 개선하기 위해 다음과 같은 노력을 하고 있습니다.
              </p>
              <ul>
                <li>정기적인 정책 검토 및 개선</li>
                <li>청소년 보호 관련 기술 개발</li>
                <li>관련 기관과의 협력 강화</li>
                <li>국제적 청소년 보호 동향 파악</li>
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

export default YouthProtectionPage;
