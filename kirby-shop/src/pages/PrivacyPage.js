// src/pages/PrivacyPage.js

import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/LegalPage.css';

const PrivacyPage = () => {
  return (
    <>
      <Header />
      <div className="legal-page">
        <div className="legal-container">
          <h1>개인정보처리방침</h1>
          <div className="legal-content">
            <section>
              <h2>1. 개인정보의 처리목적</h2>
              <p>
                ㈜커비숍(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
              </p>
              <ul>
                <li><strong>회원 가입 및 관리:</strong> 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 연령확인, 만14세 미만 아동 개인정보 수집 시 법정 대리인 동의여부 확인, 불만처리 등 민원처리, 고지사항 전달</li>
                <li><strong>재화 또는 서비스 제공:</strong> 물품배송, 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공, 맞춤 서비스 제공, 본인인증, 연령인증</li>
                <li><strong>마케팅 및 광고에의 활용:</strong> 신규 서비스(제품) 개발 및 특화, 이벤트 등 광고성 정보 전달, 접속빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
              </ul>
            </section>

            <section>
              <h2>2. 개인정보의 처리 및 보유기간</h2>
              <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              <ul>
                <li><strong>회원정보:</strong> 회원탈퇴 시까지 (단, 관계법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)</li>
                <li><strong>계약 또는 청약철회 등에 관한 기록:</strong> 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                <li><strong>대금결제 및 재화 등의 공급에 관한 기록:</strong> 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                <li><strong>소비자의 불만 또는 분쟁처리에 관한 기록:</strong> 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                <li><strong>표시·광고에 관한 기록:</strong> 6개월 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
              </ul>
            </section>

            <section>
              <h2>3. 처리하는 개인정보의 항목</h2>
              <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
              <ul>
                <li><strong>필수항목:</strong> 이메일, 비밀번호, 이름, 생년월일, 성별, 연락처, 주소</li>
                <li><strong>선택항목:</strong> 직업, 관심분야, 결혼여부, 기념일</li>
                <li><strong>자동 수집 항목:</strong> IP주소, 쿠키, MAC주소, 서비스 이용 기록, 방문 기록, 불량 이용 기록</li>
              </ul>
            </section>

            <section>
              <h2>4. 개인정보의 제3자 제공</h2>
              <p>
                회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
            </section>

            <section>
              <h2>5. 개인정보처리의 위탁</h2>
              <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
              <ul>
                <li><strong>배송업무:</strong> 택배사 (배송업무 수행을 위한 배송정보 제공)</li>
                <li><strong>결제처리:</strong> PG사 (결제처리 및 정산업무 수행을 위한 결제정보 제공)</li>
                <li><strong>고객상담:</strong> 콜센터 (고객상담 및 민원처리 업무 수행을 위한 고객정보 제공)</li>
              </ul>
            </section>

            <section>
              <h2>6. 정보주체의 권리·의무 및 행사방법</h2>
              <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
              <ul>
                <li>개인정보 처리현황 통지요구</li>
                <li>개인정보 열람요구</li>
                <li>개인정보 정정·삭제요구</li>
                <li>개인정보 처리정지요구</li>
              </ul>
            </section>

            <section>
              <h2>7. 개인정보의 안전성 확보조치</h2>
              <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
              <ul>
                <li><strong>관리적 조치:</strong> 내부관리계획 수립·시행, 전담조직 운영, 정기적 직원 교육</li>
                <li><strong>기술적 조치:</strong> 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 개인정보의 암호화, 보안프로그램 설치</li>
                <li><strong>물리적 조치:</strong> 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section>
              <h2>8. 개인정보보호책임자</h2>
              <p>
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.
              </p>
              <div className="contact-info">
                <p><strong>개인정보보호책임자:</strong> 커비매니저</p>
                <p><strong>연락처:</strong> privacy@kirbyshop.com</p>
                <p><strong>전화:</strong> 1588-0000</p>
              </div>
            </section>

            <section>
              <h2>9. 개인정보 처리방침 변경</h2>
              <p>
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
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

export default PrivacyPage;
