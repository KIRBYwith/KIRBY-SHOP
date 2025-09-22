// src/components/legal/PrivacyPolicyModal.js

import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Eye, Lock, Database, UserCheck, 
  Calendar, Phone, Mail, FileText, AlertTriangle,
  CheckCircle, Clock, Globe, Server, Smartphone
} from 'lucide-react';
import '../../styles/PrivacyPolicyModal.css';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [acceptedSections, setAcceptedSections] = useState([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSectionAccept = (sectionId) => {
    setAcceptedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  if (!isOpen) return null;

  const sections = [
    {
      id: 'overview',
      title: '개요',
      icon: Shield,
      content: (
        <div className="policy-section">
          <div className="section-header">
            <Shield className="section-icon" size={24} />
            <h3>개인정보처리방침 개요</h3>
          </div>
          
          <div className="policy-content">
            <div className="highlight-box">
              <h4>🌟 커비숍이 여러분의 개인정보를 소중히 보호합니다</h4>
              <p>
                커비숍(이하 "회사")은 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 
                관련 법령에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 
                하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
              </p>
            </div>

            <div className="info-grid">
              <div className="info-item">
                <Calendar className="info-icon" />
                <div>
                  <h5>최종 수정일</h5>
                  <p>2024년 1월 1일</p>
                </div>
              </div>
              <div className="info-item">
                <Clock className="info-icon" />
                <div>
                  <h5>시행일</h5>
                  <p>2024년 1월 1일</p>
                </div>
              </div>
              <div className="info-item">
                <Globe className="info-icon" />
                <div>
                  <h5>적용 범위</h5>
                  <p>커비숍 전체 서비스</p>
                </div>
              </div>
              <div className="info-item">
                <Phone className="info-icon" />
                <div>
                  <h5>문의처</h5>
                  <p>1588-1234</p>
                </div>
              </div>
            </div>

            <div className="company-info">
              <h4>회사 정보</h4>
              <ul>
                <li><strong>회사명:</strong> 주식회사 커비숍</li>
                <li><strong>대표자:</strong> 커비</li>
                <li><strong>주소:</strong> 서울특별시 강남구 테헤란로 123, 커비타워 10층</li>
                <li><strong>사업자등록번호:</strong> 123-45-67890</li>
                <li><strong>통신판매업신고:</strong> 제2024-서울강남-0123호</li>
                <li><strong>개인정보보호책임자:</strong> privacy@kirbyshop.com</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'collection',
      title: '개인정보 수집·이용',
      icon: Database,
      content: (
        <div className="policy-section">
          <div className="section-header">
            <Database className="section-icon" size={24} />
            <h3>개인정보 수집 및 이용 목적</h3>
          </div>
          
          <div className="policy-content">
            <div className="collection-table">
              <h4>📋 수집하는 개인정보 항목</h4>
              
              <div className="table-container">
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>구분</th>
                      <th>필수항목</th>
                      <th>선택항목</th>
                      <th>수집목적</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="category">회원가입</td>
                      <td>이메일, 비밀번호, 이름</td>
                      <td>전화번호, 생년월일, 주소</td>
                      <td>회원 식별, 서비스 이용</td>
                    </tr>
                    <tr>
                      <td className="category">주문/결제</td>
                      <td>배송지 정보, 결제정보</td>
                      <td>요청사항</td>
                      <td>상품배송, 결제처리</td>
                    </tr>
                    <tr>
                      <td className="category">고객지원</td>
                      <td>문의내용, 연락처</td>
                      <td>첨부파일</td>
                      <td>고객상담, 불만처리</td>
                    </tr>
                    <tr>
                      <td className="category">마케팅</td>
                      <td>-</td>
                      <td>이메일, SMS 수신동의</td>
                      <td>이벤트 안내, 맞춤형 광고</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="automatic-collection">
              <h4>🔄 자동으로 수집되는 정보</h4>
              <div className="auto-info-grid">
                <div className="auto-info-item">
                  <Smartphone className="auto-icon" />
                  <div>
                    <h5>접속 정보</h5>
                    <p>IP주소, 접속시간, 브라우저 정보</p>
                  </div>
                </div>
                <div className="auto-info-item">
                  <Server className="auto-icon" />
                  <div>
                    <h5>서비스 이용 기록</h5>
                    <p>페이지 방문기록, 검색기록, 구매이력</p>
                  </div>
                </div>
                <div className="auto-info-item">
                  <Eye className="auto-icon" />
                  <div>
                    <h5>쿠키 정보</h5>
                    <p>로그인 상태 유지, 맞춤형 서비스 제공</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="collection-methods">
              <h4>📥 개인정보 수집 방법</h4>
              <ul className="method-list">
                <li>홈페이지 회원가입 및 서비스 이용 과정에서 이용자가 직접 입력</li>
                <li>고객센터를 통한 상담 과정에서 수집</li>
                <li>이벤트 및 프로모션 참여 과정에서 수집</li>
                <li>제휴사로부터의 정보 제공 (사전 동의 시에만)</li>
                <li>생성정보 수집 도구를 통한 자동 수집</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'usage',
      title: '개인정보 이용·제공',
      icon: UserCheck,
      content: (
        <div className="policy-section">
          <div className="section-header">
            <UserCheck className="section-icon" size={24} />
            <h3>개인정보 이용 및 제3자 제공</h3>
          </div>
          
          <div className="policy-content">
            <div className="usage-purposes">
              <h4>🎯 개인정보 이용 목적</h4>
              <div className="purpose-grid">
                <div className="purpose-item">
                  <div className="purpose-icon">👤</div>
                  <div>
                    <h5>회원관리</h5>
                    <p>회원 식별, 본인 확인, 중복가입 방지, 연령 확인, 불량회원 제재</p>
                  </div>
                </div>
                <div className="purpose-item">
                  <div className="purpose-icon">🛒</div>
                  <div>
                    <h5>서비스 제공</h5>
                    <p>상품 주문/배송, 결제 처리, 맞춤형 서비스 제공, 고객상담</p>
                  </div>
                </div>
                <div className="purpose-item">
                  <div className="purpose-icon">📊</div>
                  <div>
                    <h5>서비스 개선</h5>
                    <p>이용 패턴 분석, 서비스 개선, 신규 서비스 개발, 통계 작성</p>
                  </div>
                </div>
                <div className="purpose-item">
                  <div className="purpose-icon">📢</div>
                  <div>
                    <h5>마케팅 활용</h5>
                    <p>이벤트 정보 제공, 맞춤형 광고, 프로모션 안내 (동의 시에만)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="third-party-provision">
              <h4>🤝 제3자 제공 현황</h4>
              <div className="provision-notice">
                <AlertTriangle className="notice-icon" size={20} />
                <p>
                  커비숍은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
                  단, 다음의 경우에는 예외로 합니다.
                </p>
              </div>
              
              <div className="exception-list">
                <div className="exception-item">
                  <CheckCircle className="check-icon" size={16} />
                  <div>
                    <h5>법령에 의한 요구</h5>
                    <p>법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</p>
                  </div>
                </div>
                <div className="exception-item">
                  <CheckCircle className="check-icon" size={16} />
                  <div>
                    <h5>서비스 제공을 위한 업무위탁</h5>
                    <p>배송업체, 결제대행업체 등 서비스 제공에 필요한 최소한의 정보만 제공</p>
                  </div>
                </div>
              </div>

              <div className="partner-table">
                <h5>📋 업무위탁 현황</h5>
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>수탁업체</th>
                      <th>위탁업무</th>
                      <th>제공정보</th>
                      <th>보유기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>CJ대한통운</td>
                      <td>상품배송</td>
                      <td>이름, 주소, 전화번호</td>
                      <td>배송완료 후 7일</td>
                    </tr>
                    <tr>
                      <td>KG이니시스</td>
                      <td>결제처리</td>
                      <td>결제정보</td>
                      <td>거래완료 후 5년</td>
                    </tr>
                    <tr>
                      <td>카카오톡</td>
                      <td>알림톡 발송</td>
                      <td>전화번호</td>
                      <td>발송 후 즉시 삭제</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'retention',
      title: '보유·파기',
      icon: Clock,
      content: (
        <div className="policy-section">
          <div className="section-header">
            <Clock className="section-icon" size={24} />
            <h3>개인정보 보유 및 파기</h3>
          </div>
          
          <div className="policy-content">
            <div className="retention-policy">
              <h4>📅 개인정보 보유기간</h4>
              <div className="retention-table">
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>정보 구분</th>
                      <th>보유기간</th>
                      <th>관련 법령</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>회원정보</td>
                      <td>회원탈퇴 시까지</td>
                      <td>-</td>
                      <td>탈퇴 즉시 파기</td>
                    </tr>
                    <tr>
                      <td>주문/결제 정보</td>
                      <td>5년</td>
                      <td>전자상거래법</td>
                      <td>계약/청약철회 기록</td>
                    </tr>
                    <tr>
                      <td>배송 정보</td>
                      <td>5년</td>
                      <td>전자상거래법</td>
                      <td>대금결제/재화공급 기록</td>
                    </tr>
                    <tr>
                      <td>고객상담 기록</td>
                      <td>3년</td>
                      <td>전자상거래법</td>
                      <td>소비자 불만/분쟁처리 기록</td>
                    </tr>
                    <tr>
                      <td>접속 로그</td>
                      <td>3개월</td>
                      <td>통신비밀보호법</td>
                      <td>통신사실확인자료</td>
                    </tr>
                    <tr>
                      <td>마케팅 동의정보</td>
                      <td>동의철회 시까지</td>
                      <td>-</td>
                      <td>철회 즉시 파기</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="destruction-policy">
              <h4>🗑️ 개인정보 파기 절차 및 방법</h4>
              
              <div className="destruction-process">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h5>파기 대상 선정</h5>
                    <p>보유기간이 경과한 개인정보를 정기적으로 선정합니다.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h5>파기 계획 수립</h5>
                    <p>개인정보보호책임자의 승인을 거쳐 파기 계획을 수립합니다.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h5>안전한 파기</h5>
                    <p>전자파일은 복구 불가능한 방법으로, 인쇄물은 분쇄하여 파기합니다.</p>
                  </div>
                </div>
                <div className="process-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h5>파기 완료 확인</h5>
                    <p>파기 작업 완료 후 파기 대장에 기록하여 관리합니다.</p>
                  </div>
                </div>
              </div>

              <div className="destruction-methods">
                <h5>파기 방법</h5>
                <div className="method-grid">
                  <div className="method-item">
                    <div className="method-icon">💾</div>
                    <div>
                      <h6>전자파일</h6>
                      <p>기록을 재생할 수 없는 기술적 방법을 사용하여 완전 삭제</p>
                    </div>
                  </div>
                  <div className="method-item">
                    <div className="method-icon">📄</div>
                    <div>
                      <h6>종이문서</h6>
                      <p>분쇄기로 분쇄하거나 소각하여 복원 불가능하게 처리</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="withdrawal-info">
              <h4>🚪 회원탈퇴 및 개인정보 처리 현황</h4>
              <div className="withdrawal-process">
                <div className="info-box important">
                  <h5>⚠️ 중요 안내사항</h5>
                  <ul>
                    <li>회원탈퇴 시 개인정보는 즉시 파기됩니다.</li>
                    <li>단, 관련 법령에 의해 보존해야 하는 정보는 별도 보관됩니다.</li>
                    <li>탈퇴 후에도 주문/결제 관련 정보는 전자상거래법에 의해 5년간 보관됩니다.</li>
                    <li>탈퇴 철회는 개인정보 파기 전까지만 가능합니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'rights',
      title: '권리·의무',
      icon: Lock,
      content: (
        <div className="policy-section">
          <div className="section-header">
            <Lock className="section-icon" size={24} />
            <h3>정보주체의 권리·의무 및 행사방법</h3>
          </div>
          
          <div className="policy-content">
            <div className="rights-overview">
              <h4>✊ 개인정보 자기결정권</h4>
              <p className="rights-intro">
                이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다. 
                각 권리는 온라인 또는 서면, 전화를 통해 행사하실 수 있습니다.
              </p>
            </div>

            <div className="rights-list">
              <div className="right-item">
                <div className="right-icon">👁️</div>
                <div className="right-content">
                  <h5>개인정보 처리현황 통지 요구</h5>
                  <p>본인의 개인정보 처리현황에 대한 통지를 요구할 수 있습니다.</p>
                  <div className="right-details">
                    <span className="detail-tag">방법</span>
                    <span>마이페이지 > 개인정보 관리 또는 고객센터 문의</span>
                  </div>
                </div>
              </div>

              <div className="right-item">
                <div className="right-icon">🔍</div>
                <div className="right-content">
                  <h5>개인정보 열람 요구</h5>
                  <p>처리되고 있는 본인의 개인정보에 대한 열람을 요구할 수 있습니다.</p>
                  <div className="right-details">
                    <span className="detail-tag">처리기간</span>
                    <span>요청일로부터 10일 이내</span>
                  </div>
                </div>
              </div>

              <div className="right-item">
                <div className="right-icon">✏️</div>
                <div className="right-content">
                  <h5>개인정보 정정·삭제 요구</h5>
                  <p>잘못된 개인정보의 정정이나 삭제를 요구할 수 있습니다.</p>
                  <div className="right-details">
                    <span className="detail-tag">제한</span>
                    <span>법령에서 보존하도록 한 정보는 삭제 불가</span>
                  </div>
                </div>
              </div>

              <div className="right-item">
                <div className="right-icon">⏸️</div>
                <div className="right-content">
                  <h5>개인정보 처리정지 요구</h5>
                  <p>본인의 개인정보 처리를 중단하도록 요구할 수 있습니다.</p>
                  <div className="right-details">
                    <span className="detail-tag">예외</span>
                    <span>법령에 특별한 규정이 있는 경우 처리 계속 가능</span>
                  </div>
                </div>
              </div>

              <div className="right-item">
                <div className="right-icon">📧</div>
                <div className="right-content">
                  <h5>마케팅 수신거부</h5>
                  <p>광고성 정보 수신을 거부할 수 있습니다.</p>
                  <div className="right-details">
                    <span className="detail-tag">방법</span>
                    <span>이메일 수신거부 링크 또는 마이페이지 설정</span>
                  </div>
                </div>
              </div>

              <div className="right-item">
                <div className="right-icon">💔</div>
                <div className="right-content">
                  <h5>손해배상 청구</h5>
                  <p>개인정보 침해로 인한 정신적·재산적 피해 배상을 청구할 수 있습니다.</p>
                  <div className="right-details">
                    <span className="detail-tag">기관</span>
                    <span>개인정보보호위원회, 개인정보 분쟁조정위원회 등</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="exercise-methods">
              <h4>📞 권리행사 방법</h4>
              <div className="contact-methods">
                <div className="contact-item">
                  <Mail className="contact-icon" />
                  <div>
                    <h5>이메일</h5>
                    <p>privacy@kirbyshop.com</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone className="contact-icon" />
                  <div>
                    <h5>전화</h5>
                    <p>1588-1234 (평일 09:00~18:00)</p>
                  </div>
                </div>
                <div className="contact-item">
                  <FileText className="contact-icon" />
                  <div>
                    <h5>서면</h5>
                    <p>서울특별시 강남구 테헤란로 123, 커비타워 10층</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="obligations">
              <h4>⚖️ 정보주체의 의무</h4>
              <div className="obligation-list">
                <div className="obligation-item">
                  <CheckCircle className="check-icon" size={16} />
                  <span>본인의 개인정보를 최신 정보로 정확하게 입력해야 합니다.</span>
                </div>
                <div className="obligation-item">
                  <CheckCircle className="check-icon" size={16} />
                  <span>타인의 개인정보를 도용하거나 허위 정보를 입력해서는 안 됩니다.</span>
                </div>
                <div className="obligation-item">
                  <CheckCircle className="check-icon" size={16} />
                  <span>개인정보처리방침의 변경사항을 정기적으로 확인해야 합니다.</span>
                </div>
                <div className="obligation-item">
                  <CheckCircle className="check-icon" size={16} />
                  <span>개인정보 보호를 위해 안전한 비밀번호를 설정하고 주기적으로 변경해야 합니다.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      title: '안전성 확보조치',
      icon: Shield,
      content: (
        <div className="policy-section">
          <div className="section-header">
            <Shield className="section-icon" size={24} />
            <h3>개인정보 안전성 확보조치</h3>
          </div>
          
          <div className="policy-content">
            <div className="security-overview">
              <h4>🔒 보안 관리 체계</h4>
              <p className="security-intro">
                커비숍은 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 
                기술적·관리적 및 물리적 조치를 하고 있습니다.
              </p>
            </div>

            <div className="security-measures">
              <div className="measure-category">
                <h5>🛡️ 기술적 조치</h5>
                <div className="measure-list">
                  <div className="measure-item">
                    <div className="measure-icon">🔐</div>
                    <div>
                      <h6>개인정보 암호화</h6>
                      <p>비밀번호는 단방향 해시함수를 이용하여 암호화 저장되며, 중요 개인정보는 별도의 보안기능을 통해 암호화됩니다.</p>
                    </div>
                  </div>
                  <div className="measure-item">
                    <div className="measure-icon">🔥</div>
                    <div>
                      <h6>해킹 등에 대비한 기술적 대책</h6>
                      <p>해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적으로 갱신·점검하고 있습니다.</p>
                    </div>
                  </div>
                  <div className="measure-item">
                    <div className="measure-icon">🌐</div>
                    <div>
                      <h6>개인정보처리시스템 등의 접근권한 관리</h6>
                      <p>개인정보처리시스템에 대한 접근권한을 업무상 필요한 최소한의 범위로 제한하여 운영하고 있습니다.</p>
                    </div>
                  </div>
                  <div className="measure-item">
                    <div className="measure-icon">📊</div>
                    <div>
                      <h6>접근통제시스템 설치</h6>
                      <p>개인정보를 처리하는 데이터베이스시스템에 대한 접근통제를 위하여 접근통제시스템을 설치·운영하고 있습니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="measure-category">
                <h5>👥 관리적 조치</h5>
                <div className="measure-list">
                  <div className="measure-item">
                    <div className="measure-icon">📋</div>
                    <div>
                      <h6>내부관리계획 수립·시행</h6>
                      <p>개인정보의 안전한 처리를 위하여 내부관리계획을 수립하고 시행하고 있습니다.</p>
                    </div>
                  </div>
                  <div className="measure-item">
                    <div className="measure-icon">🎓</div>
                    <div>
                      <h6>개인정보 취급직원의 최소화 및 교육</h6>
                      <p>개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화하여 개인정보를 관리하는 대책을 시행하고 있습니다.</p>
                    </div>
                  </div>
                  <div className="measure-item">
                    <div className="measure-icon">🔄</div>
                    <div>
                      <h6>정기적 자체 감사</h6>
                      <p>개인정보 취급 관련 안정성 확보를 위해 정기적으로 자체 감사를 실시하고 있습니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="measure-category">
                <h5>🏢 물리적 조치</h5>
                <div className="measure-list">
                  <div className="measure-item">
                    <div className="measure-icon">🚪</div>
                    <div>
                      <h6>개인정보처리시스템 등의 물리적 보호</h6>
                      <p>전산실, 자료보관실 등의 접근통제를 위하여 출입통제절차를 수립·운영하고 있습니다.</p>
                    </div>
                  </div>
                  <div className="measure-item">
                    <div className="measure-icon">📹</div>
                    <div>
                      <h6>보관시설 보안</h6>
                      <p>개인정보가 포함된 서류, 보조저장매체 등을 잠금장치가 있는 안전한 장소에 보관하고 있습니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="security-certifications">
              <h4>🏆 보안 인증 및 준수사항</h4>
              <div className="cert-grid">
                <div className="cert-item">
                  <div className="cert-icon">🛡️</div>
                  <div>
                    <h5>개인정보보호 관리체계(PIMS) 인증</h5>
                    <p>개인정보보호 관리체계 인증을 획득하여 체계적으로 개인정보를 보호하고 있습니다.</p>
                  </div>
                </div>
                <div className="cert-item">
                  <div className="cert-icon">🔒</div>
                  <div>
                    <h5>정보보호 관리체계(ISMS) 인증</h5>
                    <p>정보보호 관리체계 인증을 통해 안전한 정보보호 환경을 구축하고 있습니다.</p>
                  </div>
                </div>
                <div className="cert-item">
                  <div className="cert-icon">🌐</div>
                  <div>
                    <h5>SSL 보안서버 인증서</h5>
                    <p>모든 개인정보 전송 구간에 SSL 암호화 통신을 적용하고 있습니다.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="incident-response">
              <h4>🚨 개인정보 침해신고센터</h4>
              <div className="response-info">
                <p>
                  개인정보 침해로 인한 신고, 상담이 필요하신 경우에는 아래의 기관에 문의하시기 바랍니다.
                </p>
                <div className="center-list">
                  <div className="center-item">
                    <h5>개인정보 침해신고센터</h5>
                    <p>privacy.go.kr / 전화: (국번없이) 182</p>
                  </div>
                  <div className="center-item">
                    <h5>개인정보 분쟁조정위원회</h5>
                    <p>www.kopico.go.kr / 전화: (국번없이) 1833-6972</p>
                  </div>
                  <div className="center-item">
                    <h5>대검찰청 사이버범죄수사단</h5>
                    <p>www.spo.go.kr / 전화: 02-3480-3573</p>
                  </div>
                  <div className="center-item">
                    <h5>경찰청 사이버테러대응센터</h5>
                    <p>www.netan.go.kr / 전화: (국번없이) 182</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="privacy-policy-modal-overlay" onClick={onClose}>
      <div className="privacy-policy-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-content">
            <Shield className="header-icon" size={28} />
            <div>
              <h1>개인정보처리방침</h1>
              <p>커비숍이 여러분의 개인정보를 어떻게 보호하는지 알아보세요</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* 사이드바 네비게이션 */}
          <div className="sidebar">
            <div className="section-nav">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    <Icon size={18} />
                    <span>{section.title}</span>
                    {acceptedSections.includes(section.id) && (
                      <CheckCircle className="accepted-icon" size={16} />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="acceptance-summary">
              <div className="summary-header">
                <h4>읽기 진행률</h4>
                <span>{acceptedSections.length}/{sections.length}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(acceptedSections.length / sections.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="main-content">
            {currentSection && currentSection.content}
            
            {/* 섹션 읽음 확인 */}
            <div className="section-actions">
              <button
                className={`read-confirm-btn ${acceptedSections.includes(activeSection) ? 'confirmed' : ''}`}
                onClick={() => handleSectionAccept(activeSection)}
              >
                {acceptedSections.includes(activeSection) ? (
                  <>
                    <CheckCircle size={18} />
                    읽음 확인 완료
                  </>
                ) : (
                  <>
                    <Eye size={18} />
                    이 섹션을 읽었습니다
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="modal-footer">
          <div className="footer-info">
            <p>
              본 개인정보처리방침은 2024년 1월 1일부터 적용됩니다. 
              개인정보처리방침이 변경되는 경우 웹사이트 공지사항을 통하여 공지할 것입니다.
            </p>
          </div>
          <div className="footer-actions">
            <button className="contact-btn">
              <Phone size={16} />
              문의하기
            </button>
            <button className="close-btn" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
