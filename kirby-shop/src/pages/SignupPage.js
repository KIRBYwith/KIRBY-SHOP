import React, { useState } from 'react';
import DaumPostcode from 'react-daum-postcode'; // 주소검색 component
import '../styles/LoginSignup.css';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuth } from '../contexts/AuthContext';

const TermsModal = ({ open, onClose, title, content }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 style={{ marginBottom: 8 }}>{title}</h3>
        <div style={{ maxHeight: 300, overflow: "auto", whiteSpace: "pre-line", fontSize: 15, color: "#444" }}>
          {content}
        </div>
        <button style={{ marginTop: 18, width: "100%" }} onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

const SignupEventBanner = () => (
  <div className="welcome-message" style={{
    background: 'linear-gradient(90deg, #ffe9f5 0%, #f8e7ff 100%)',
    borderRadius: 18, marginBottom: 17, padding: '0.9rem 0.7rem'
  }}>
    <span style={{
      background: '#ff69b4', color: '#fff', fontWeight: 700, fontSize: '1.09rem',
      borderRadius: 11, padding: '4px 15px', marginRight: 14, letterSpacing: 1
    }}>
      NEW 회원혜택
    </span>
    <span style={{ fontWeight: 700, color: '#8b1a83' }}>
      20% 웰컴쿠폰
    </span>
    <span style={{ color: "#ff8c42", fontWeight: "600", margin: "0 6px" }}>
      선착순 랜덤굿즈 추첨
    </span>
    <span style={{ color: "#3757ff", marginRight: 7, fontWeight: 600 }}>
      가입 시 2,000P 즉시적립!
    </span>
    <span style={{
      marginLeft: 9, background: "#ffe100",
      color: "#da174e", fontWeight: 700,
      fontSize: "1rem", borderRadius: 9, padding: "3px 12px"
    }}>
      D-1 이벤트마감
    </span>
  </div>
);

const BenefitsBanner = () => (
  <div className="welcome-message">
    <h3 style={{ color: '#fd4766' }}>
      오늘 가입 시! 특별한 신규혜택 모두 드려요 🥤
    </h3>
    <div className="signup-benefits" style={{ fontSize: "1.03rem", marginBottom: 5 }}>
      <span style={{ background: "#fff3fa", color: "#fd4766" }}>✨ 20% 쿠폰 자동 지급</span>
      <span style={{ background: "#e8fafe", color: "#2ca6b6" }}>💬 가입시 2,000포인트</span>
      <span style={{ background: "#faf1ff", color: "#8b1a83" }}>🌟 랜덤 한정굿즈 추첨 응모권</span>
      <span style={{ background: "#fffae8", color: "#d68b00" }}>D-1 이벤트마감 / 오늘마지막</span>
    </div>
  </div>
);

const TERMS = {
  terms: `
제1조(목적) 본 약관은 커비숍(이하 '회사')이 제공하는 서비스와 관련하여 회사와 회원간의 권리, 의무 및 책임사항을 정함을 목적으로 합니다...
(실제 서비스 정책에 맞는 내용으로 수정)
  `,
  privacy: `
[필수] 개인정보 수집 및 이용 동의

수집항목: 성명, 아이디, 이메일, 휴대폰번호, 생년월일, 주소, 본인인증값 등
수집목적: 회원가입 및 본인확인, 서비스 이용 및 상담, 배송(필요시)
보유 및 이용기간: 회원탈퇴 후 법정 보존기간까지
  `,
  selection: `
[선택] 선택정보 수집 및 이용 동의

수집항목: 성별, 마케팅동의여부, 외국인 여부 등
수집목적: 맞춤형 서비스 및 이벤트 안내 등
보유 및 이용기간: 회원 탈퇴 시 즉시 파기
  `
};

const SignupPage = () => {
  const { signup, isLoading } = useAuth();

  const [form, setForm] = useState({
    name: '', username: '', email: '', phone: '', password: '', password2: '',
    birth: '', gender: '', isForeigner: false,
    address: '', addressDetail: '',
    agreeTerms: false, agreePrivacy: false, agreeMarketing: false, agreeSelect: false, agreeAll: false,
  });
  const [modal, setModal] = useState({ open: false, title: '', content: '' });
  const [formErr, setFormErr] = useState('');
  const [openPostCode, setOpenPostCode] = useState(false);

  // 카카오 주소검색 결과 반영
  const handleCompletePostcode = (data) => {
    let addr = '';
    let extraAddr = '';
    if (data.userSelectedType === 'R') {
      addr = data.roadAddress;
    } else {
      addr = data.jibunAddress;
    }
    if (data.userSelectedType === 'R') {
      if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
        extraAddr += data.bname;
      }
      if (data.buildingName !== '' && data.apartment === 'Y') {
        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
      }
      if (extraAddr !== '') {
        extraAddr = ' (' + extraAddr + ')';
      }
    }
    setForm(prev => ({
      ...prev,
      address: addr + extraAddr
    }));
    setOpenPostCode(false);
    setTimeout(() => {
      document.querySelector('input[name="addressDetail"]')?.focus();
    }, 100);
  };

  // 전체동의 체크 처리
  const handleAllCheck = e => {
    const checked = e.target.checked;
    setForm(f => ({
      ...f,
      agreeAll: checked,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeMarketing: checked,
      agreeSelect: checked
    }));
  };

  // 입력 핸들링
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (name === 'password' || name === 'password2') setFormErr('');
  };

  // 회원가입 처리
  const handleSubmit = async e => {
    e.preventDefault();

    // 로컬 유효성
    if (form.password !== form.password2) {
      setFormErr('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!form.agreeTerms || !form.agreePrivacy) {
      setFormErr('필수 약관에 모두 동의해야 가입이 가능합니다.');
      return;
    }
    setFormErr('');

    // 필수 데이터만 분기
    const signupData = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      birthDate: form.birth,
      gender: form.gender,
      isForeigner: form.isForeigner,
      address: form.address,
      addressDetail: form.addressDetail,
      agreeMarketing: form.agreeMarketing,
      agreeSelect: form.agreeSelect,
      username: form.username,
    };

    // 가입 진행
    const result = await signup(signupData);

    if (result?.success) {
      alert(result.message || '회원가입이 완료되었습니다!');
      window.location.href = '/';
    } else {
      setFormErr(result?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="kirby-shop login-page">
      <Header />
      <main style={{ minHeight: '80vh', paddingTop: 60 }}>
        <div className="login-container">
          <div className="page-header">
            <div className="page-title">
              <span>✨</span>
              <h2 style={{ fontWeight: 800 }}>회원가입</h2>
              <span style={{
                marginLeft: 12, color: "#d68b00",
                borderRadius: 11, padding: "4px 7px", fontWeight: 700, fontSize: "1.07rem"
              }}>
                선착순 웰컴박스 지급🎁
              </span>
            </div>
          </div>
          <SignupEventBanner />
          <BenefitsBanner />
          <form className="form-container" onSubmit={handleSubmit} autoComplete="off">

            {/* 성명 */}
            <div className="input-group">
              <label htmlFor="signup-name">이름</label>
              <div className="input-wrapper">
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  className="login-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="이름"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* 아이디 */}
            <div className="input-group">
              <label htmlFor="signup-username">아이디</label>
              <div className="input-wrapper">
                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  className="login-input"
                  value={form.username}
                  onChange={handleChange}
                  required
                  placeholder="아이디(4~20자)"
                  autoComplete="username"
                />
                <button className="input-check-btn" type="button">중복확인</button>
              </div>
            </div>

            {/* 이메일 */}
            <div className="input-group">
              <label htmlFor="signup-email">이메일</label>
              <div className="input-wrapper">
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  className="login-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                  autoComplete="email"
                />
                <button className="input-check-btn" type="button">중복확인</button>
              </div>
            </div>

            {/* 휴대폰 */}
            <div className="input-group">
              <label htmlFor="signup-phone">휴대폰번호</label>
              <div className="input-wrapper">
                <input
                  id="signup-phone"
                  name="phone"
                  type="tel"
                  className="login-input"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder="010-0000-0000"
                  autoComplete="tel"
                />
                <button className="input-check-btn" type="button">본인인증</button>
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="input-group">
              <label htmlFor="signup-password">비밀번호</label>
              <div className="input-wrapper">
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  className="login-input"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="8~20자(영문/숫자/특수문자)"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="signup-password2">비밀번호 확인</label>
              <div className="input-wrapper">
                <input
                  id="signup-password2"
                  name="password2"
                  type="password"
                  className="login-input"
                  value={form.password2}
                  onChange={handleChange}
                  required
                  placeholder="비밀번호 확인"
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            {/* 생년월일 */}
            <div className="input-group">
              <label htmlFor="signup-birth">생년월일</label>
              <div className="input-wrapper">
                <input
                  id="signup-birth"
                  name="birth"
                  type="date"
                  className="login-input"
                  value={form.birth}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* 성별 */}
            <div className="input-group">
              <label>성별</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={form.gender === "M"}
                    onChange={handleChange}
                    style={{ marginRight: '6px' }}
                  />
                  남성
                </label>
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="gender"
                    value="F"
                    checked={form.gender === "F"}
                    onChange={handleChange}
                    style={{ marginRight: '6px' }}
                  />
                  여성
                </label>
              </div>
            </div>

            {/* 외국인 체크박스 */}
            <div style={{ margin: "12px 0" }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="isForeigner"
                  checked={form.isForeigner}
                  onChange={handleChange}
                  style={{ marginRight: '8px' }}
                />
                외국인입니다
              </label>
            </div>

            {/* 주소+상세 */}
            <div className="input-group">
              <label htmlFor="signup-address">주소</label>
              <div className="input-wrapper">
                <input
                  id="signup-address"
                  name="address"
                  type="text"
                  className="login-input"
                  placeholder="(도로명/지번)"
                  value={form.address}
                  readOnly
                />
                <button
                  type="button"
                  className="input-check-btn"
                  onClick={() => setOpenPostCode(true)}
                >
                  주소검색
                </button>
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <input
                  name="addressDetail"
                  type="text"
                  className="login-input"
                  placeholder="상세주소"
                  value={form.addressDetail}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* 약관 - 중복 체크박스 제거 */}
            <div className="agreement-section">
              <div className="agreement-all">
                <label className="agreement-item" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.agreeAll}
                    onChange={handleAllCheck}
                  />
                  <span className="agreement-text">전체 약관 동의</span>
                </label>
              </div>

              <label className="agreement-item required" style={{ cursor: 'pointer' }}>
                <input
                  name="agreeTerms"
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={handleChange}
                />
                <span className="agreement-text">이용약관 동의 (필수)</span>
                <button
                  type="button"
                  className="view-terms"
                  onClick={() => setModal({ open: true, title: "이용약관", content: TERMS.terms })}
                >
                  보기
                </button>
              </label>

              <label className="agreement-item required" style={{ cursor: 'pointer' }}>
                <input
                  name="agreePrivacy"
                  type="checkbox"
                  checked={form.agreePrivacy}
                  onChange={handleChange}
                />
                <span className="agreement-text">개인정보 수집 및 이용 동의 (필수)</span>
                <button
                  type="button"
                  className="view-terms"
                  onClick={() => setModal({ open: true, title: "개인정보 수집 및 이용 동의", content: TERMS.privacy })}
                >
                  보기
                </button>
              </label>

              <label className="agreement-item" style={{ cursor: 'pointer' }}>
                <input
                  name="agreeSelect"
                  type="checkbox"
                  checked={form.agreeSelect}
                  onChange={handleChange}
                />
                <span className="agreement-text">(선택) 선택정보 수집 및 이용 동의</span>
                <button
                  type="button"
                  className="view-terms"
                  onClick={() => setModal({ open: true, title: "선택정보 동의", content: TERMS.selection })}
                >
                  보기
                </button>
              </label>

              <label className="agreement-item" style={{ cursor: 'pointer' }}>
                <input
                  name="agreeMarketing"
                  type="checkbox"
                  checked={form.agreeMarketing}
                  onChange={handleChange}
                />
                <span className="agreement-text">마케팅/이벤트 정보 수신 동의 (선택, 즉시 할인추가증정!)</span>
              </label>
            </div>

            {(formErr) && (
              <div className="submit-error">{formErr}</div>
            )}

            <button className="submit-button" type="submit" style={{ marginTop: 17 }} disabled={isLoading}>
              {isLoading ? <span className="spinner spinning" /> : '가입하고 혜택받기'}
            </button>

            <div className="bottom-links">
              <p>
                이미 계정이 있으신가요?{' '}
                <a className="link-button" href="/login">로그인</a>
              </p>
            </div>
          </form>

          {/* 약관 모달 */}
          <TermsModal {...modal} onClose={() => setModal(s => ({ ...s, open: false }))} />

          {/* 주소검색 모달 - 중복 제거 */}
          {openPostCode && (
            <div className="modal-overlay" onClick={() => setOpenPostCode(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                <DaumPostcode
                  onComplete={handleCompletePostcode}
                  autoClose={false}
                  style={{ width: '100%', height: '440px', border: "none" }}
                />
                <button style={{ marginTop: 14, width: "100%" }} onClick={() => setOpenPostCode(false)}>
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;