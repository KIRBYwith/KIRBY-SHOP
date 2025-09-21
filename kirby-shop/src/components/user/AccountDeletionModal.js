// src/components/user/AccountDeletionModal.js

import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, Shield, Calendar, Database, 
  CheckCircle, Eye, EyeOff, Lock, UserX, Clock,
  FileText, Scale, Heart, Trash2, ArrowRight
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/AccountDeletionModal.css';

const AccountDeletionModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onDeleteAccount, 
  loading = false 
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1); // 1: 안내, 2: 확인, 3: 비밀번호, 4: 완료
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [agreedItems, setAgreedItems] = useState([]);
  const [passwordError, setPasswordError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const requiredText = '회원탈퇴를 진행합니다';
  const agreementItems = [
    {
      id: 'data_retention',
      title: '개인정보 보관 및 파기 정책 이해',
      description: '관련 법령에 따라 일부 정보는 최대 5년간 보관될 수 있음을 이해합니다.'
    },
    {
      id: 'service_restriction',
      title: '서비스 이용 제한 안내',
      description: '탈퇴 후 동일 이메일로 재가입 시 30일간 제한될 수 있음을 이해합니다.'
    },
    {
      id: 'data_recovery',
      title: '데이터 복구 불가 안내',
      description: '탈퇴 후 개인정보 및 서비스 이용기록은 복구할 수 없음을 이해합니다.'
    },
    {
      id: 'pending_orders',
      title: '진행중인 거래 확인',
      description: '진행중인 주문이나 문의사항이 없음을 확인합니다.'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep(1);
      setPassword('');
      setConfirmText('');
      setAgreedItems([]);
      setPasswordError('');
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
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isProcessing]);

  const handleClose = () => {
    if (isProcessing) {
      toast.warning('탈퇴 처리 중입니다. 잠시만 기다려주세요.');
      return;
    }
    onClose();
  };

  const handleAgreementToggle = (itemId) => {
    setAgreedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (agreedItems.length !== agreementItems.length) {
        toast.warning('모든 항목에 동의해주세요.');
        return;
      }
      if (confirmText !== requiredText) {
        toast.warning('확인 문구를 정확히 입력해주세요.');
        return;
      }
      setStep(3);
    }
  };

  const handlePasswordVerification = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setPasswordError('비밀번호를 입력해주세요.');
      return;
    }

    setIsProcessing(true);
    setPasswordError('');

    try {
      // 실제로는 백엔드 API 호출
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 임시 검증 로직
      if (password === 'password123' || password === user.password) {
        await handleAccountDeletion();
      } else {
        setPasswordError('비밀번호가 일치하지 않습니다.');
        toast.error('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
      toast.error('처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      // 실제 계정 삭제 처리
      await onDeleteAccount();
      setStep(4);
      
      toast.success('회원탈퇴가 완료되었습니다.', {
        duration: 5000,
        kirbyStyle: true
      });
      
      // 3초 후 모달 닫기 및 홈으로 리디렉트
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error) {
      toast.error('회원탈퇴 처리 중 오류가 발생했습니다.');
      setStep(3);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="account-deletion-modal-overlay" onClick={handleClose}>
      <div className="account-deletion-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-content">
            <UserX className="header-icon" size={28} />
            <div>
              <h2>회원탈퇴</h2>
              <p>
                {step === 1 && '탈퇴 전 꼭 확인해주세요'}
                {step === 2 && '탈퇴 조건에 동의해주세요'}
                {step === 3 && '본인 확인이 필요합니다'}
                {step === 4 && '탈퇴가 완료되었습니다'}
              </p>
            </div>
          </div>
          {step !== 4 && (
            <button className="close-button" onClick={handleClose} disabled={isProcessing}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* 진행 단계 */}
        <div className="step-progress">
          {[1, 2, 3, 4].map(stepNum => (
            <div key={stepNum} className={`step-item ${step >= stepNum ? 'active' : ''} ${step > stepNum ? 'completed' : ''}`}>
              <div className="step-circle">
                {step > stepNum ? <CheckCircle size={16} /> : stepNum}
              </div>
              <span className="step-label">
                {stepNum === 1 && '안내'}
                {stepNum === 2 && '동의'}
                {stepNum === 3 && '확인'}
                {stepNum === 4 && '완료'}
              </span>
            </div>
          ))}
        </div>

        {/* 내용 */}
        <div className="modal-content">
          {/* 1단계: 탈퇴 안내 */}
          {step === 1 && (
            <div className="step-content">
              <div className="warning-section">
                <div className="warning-header">
                  <AlertTriangle className="warning-icon" size={24} />
                  <h3>회원탈퇴 전 반드시 확인해주세요</h3>
                </div>
                
                <div className="warning-content">
                  <div className="warning-item">
                    <Heart className="item-icon sad" size={20} />
                    <div>
                      <h4>정말 떠나시는 건가요?</h4>
                      <p>커비숍과 함께한 소중한 추억들이 사라져요. 혹시 불편한 점이 있으시다면 고객센터로 문의해주세요.</p>
                    </div>
                  </div>
                  
                  <div className="warning-item">
                    <Database className="item-icon" size={20} />
                    <div>
                      <h4>개인정보 보관 및 파기</h4>
                      <p>
                        <strong>즉시 파기:</strong> 이름, 이메일, 전화번호 등 개인식별정보<br/>
                        <strong>5년 보관:</strong> 주문/결제 기록 (전자상거래법)<br/>
                        <strong>3년 보관:</strong> 고객상담 기록 (전자상거래법)<br/>
                        <strong>3개월 보관:</strong> 접속 로그 (통신비밀보호법)
                      </p>
                    </div>
                  </div>
                  
                  <div className="warning-item">
                    <Clock className="item-icon" size={20} />
                    <div>
                      <h4>재가입 제한</h4>
                      <p>동일한 이메일로 재가입 시 30일간 제한됩니다. 탈퇴 철회는 개인정보 파기 전까지만 가능합니다.</p>
                    </div>
                  </div>
                  
                  <div className="warning-item">
                    <Trash2 className="item-icon danger" size={20} />
                    <div>
                      <h4>복구 불가능한 정보</h4>
                      <p>적립금, 쿠폰, 찜한 상품, 리뷰 등 모든 서비스 이용 기록이 영구적으로 삭제되며 복구할 수 없습니다.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="legal-notice">
                <Scale className="legal-icon" size={20} />
                <div className="legal-content">
                  <h4>법적 근거</h4>
                  <ul>
                    <li>개인정보보호법 제21조 (개인정보의 파기)</li>
                    <li>전자상거래 등에서의 소비자보호에 관한 법률</li>
                    <li>통신비밀보호법 제15조의2 (통신사실확인자료의 보관)</li>
                  </ul>
                </div>
              </div>

              <div className="alternative-options">
                <h4>🤔 탈퇴 대신 이런 방법은 어떠세요?</h4>
                <div className="option-grid">
                  <div className="option-item">
                    <div className="option-icon">⏸️</div>
                    <div>
                      <h5>계정 비활성화</h5>
                      <p>일시적으로 계정을 비활성화하고 나중에 다시 이용하실 수 있어요</p>
                    </div>
                  </div>
                  <div className="option-item">
                    <div className="option-icon">📧</div>
                    <div>
                      <h5>마케팅 수신 거부</h5>
                      <p>광고성 이메일이나 문자를 받지 않으실 수 있어요</p>
                    </div>
                  </div>
                  <div className="option-item">
                    <div className="option-icon">🔒</div>
                    <div>
                      <h5>개인정보 최소화</h5>
                      <p>필수 정보만 남기고 선택 정보를 삭제할 수 있어요</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2단계: 동의 및 확인 */}
          {step === 2 && (
            <div className="step-content">
              <div className="agreement-section">
                <h3>탈퇴 조건 확인 및 동의</h3>
                
                <div className="agreement-list">
                  {agreementItems.map(item => (
                    <div key={item.id} className="agreement-item">
                      <label className="agreement-label">
                        <input
                          type="checkbox"
                          checked={agreedItems.includes(item.id)}
                          onChange={() => handleAgreementToggle(item.id)}
                          className="agreement-checkbox"
                        />
                        <div className="checkbox-custom">
                          {agreedItems.includes(item.id) && <CheckCircle size={16} />}
                        </div>
                        <div className="agreement-text">
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="confirmation-section">
                <h4>확인 문구 입력</h4>
                <p>아래 문구를 정확히 입력해주세요:</p>
                <div className="required-text">"{requiredText}"</div>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="위 문구를 정확히 입력하세요"
                  className={`confirm-input ${confirmText === requiredText ? 'valid' : ''}`}
                />
                {confirmText && confirmText !== requiredText && (
                  <p className="error-text">문구가 일치하지 않습니다.</p>
                )}
              </div>
            </div>
          )}

          {/* 3단계: 비밀번호 확인 */}
          {step === 3 && (
            <div className="step-content">
              <div className="password-section">
                <div className="security-notice">
                  <Shield className="notice-icon" size={24} />
                  <div>
                    <h3>본인 확인</h3>
                    <p>회원탈퇴를 위해 현재 비밀번호를 입력해주세요.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordVerification} className="password-form">
                  <div className="input-group">
                    <label htmlFor="password">현재 비밀번호</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError('');
                        }}
                        placeholder="현재 비밀번호를 입력하세요"
                        className={passwordError ? 'error' : ''}
                        disabled={isProcessing}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isProcessing}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordError && (
                      <span className="error-message">
                        <AlertTriangle size={16} />
                        {passwordError}
                      </span>
                    )}
                  </div>

                  <div className="final-warning">
                    <AlertTriangle className="warning-icon" size={20} />
                    <div>
                      <h4>⚠️ 최종 경고</h4>
                      <p>
                        이 작업은 <strong>되돌릴 수 없습니다</strong>. 
                        회원탈퇴를 진행하시면 모든 데이터가 영구적으로 삭제됩니다.
                      </p>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="delete-button"
                    disabled={isProcessing || !password.trim()}
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="small" type="default" />
                        탈퇴 처리 중...
                      </>
                    ) : (
                      <>
                        <UserX size={18} />
                        회원탈퇴 진행
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 4단계: 완료 */}
          {step === 4 && (
            <div className="step-content completion">
              <div className="completion-content">
                <div className="completion-icon">
                  <CheckCircle size={64} />
                </div>
                <h3>회원탈퇴가 완료되었습니다</h3>
                <p>
                  그동안 커비숍을 이용해주셔서 감사했습니다.<br/>
                  언제든지 다시 돌아와 주세요. 🌟
                </p>
                
                <div className="completion-details">
                  <div className="detail-item">
                    <Calendar className="detail-icon" />
                    <span>탈퇴 처리일: {new Date().toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="detail-item">
                    <Clock className="detail-icon" />
                    <span>재가입 가능일: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
                
                <div className="final-message">
                  <p>
                    개인정보는 관련 법령에 따라 안전하게 처리됩니다.<br/>
                    문의사항이 있으시면 고객센터(1588-1234)로 연락주세요.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        {step !== 4 && (
          <div className="modal-footer">
            <div className="footer-buttons">
              {step > 1 && (
                <button 
                  className="back-button" 
                  onClick={() => setStep(step - 1)}
                  disabled={isProcessing}
                >
                  이전
                </button>
              )}
              
              {step < 3 && (
                <button 
                  className="next-button" 
                  onClick={handleNextStep}
                  disabled={
                    (step === 2 && (agreedItems.length !== agreementItems.length || confirmText !== requiredText))
                  }
                >
                  다음
                  <ArrowRight size={16} />
                </button>
              )}
              
              <button 
                className="cancel-button" 
                onClick={handleClose}
                disabled={isProcessing}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDeletionModal;
