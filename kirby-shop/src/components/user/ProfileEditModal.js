// src/components/user/ProfileEditModal.js

import React, { useState, useEffect } from 'react';
import { 
  X, Eye, EyeOff, Lock, User, Mail, Phone, Calendar, 
  MapPin, AlertCircle, CheckCircle, Shield, Key 
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/ProfileEditModal.css';

const ProfileEditModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateProfile, 
  loading = false 
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState('verify'); // 'verify', 'edit', 'changePassword'
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 비밀번호 확인 단계
  const [currentPassword, setCurrentPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // 프로필 수정 데이터
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: ''
  });

  // 비밀번호 변경 데이터
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen && user) {
      setStep('verify');
      setCurrentPassword('');
      setPasswordError('');
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        birthDate: user.birthDate || ''
      });
      setPasswordData({
        newPassword: '',
        confirmPassword: ''
      });
      setFormErrors({});
      setPasswordErrors({});
    }
  }, [isOpen, user]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    setStep('verify');
    setCurrentPassword('');
    setPasswordError('');
    onClose();
  };

  // 현재 비밀번호 확인
  const handlePasswordVerification = async (e) => {
    e.preventDefault();
    
    if (!currentPassword.trim()) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }

    setVerifying(true);
    setPasswordError('');

    try {
      // 실제로는 백엔드 API 호출
      // const response = await verifyCurrentPassword(currentPassword);
      
      // 임시 검증 로직 (실제 구현에서는 백엔드에서 처리)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 임시로 비밀번호가 'password123'이면 성공으로 처리
      if (currentPassword === 'password123' || currentPassword === user.password) {
        setStep('edit');
        toast.success('비밀번호가 확인되었습니다.', {
          kirbyStyle: true
        });
      } else {
        setPasswordError('현재 비밀번호가 일치하지 않습니다.');
        toast.error('비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      setPasswordError('비밀번호 확인 중 오류가 발생했습니다.');
      toast.error('비밀번호 확인 실패');
    } finally {
      setVerifying(false);
    }
  };

  // 프로필 정보 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 제거
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 비밀번호 변경 입력
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 제거
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 프로필 수정 유효성 검사
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = '이름을 입력해주세요.';
    }
    
    if (!formData.email.trim()) {
      errors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    
    if (formData.phone && !/^[0-9-+().\s]+$/.test(formData.phone)) {
      errors.phone = '올바른 전화번호 형식을 입력해주세요.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 비밀번호 변경 유효성 검사
  const validatePassword = () => {
    const errors = {};
    
    if (!passwordData.newPassword) {
      errors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = '비밀번호는 8자 이상이어야 합니다.';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      errors.newPassword = '비밀번호는 영문과 숫자를 포함해야 합니다.';
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    
    if (passwordData.newPassword === currentPassword) {
      errors.newPassword = '현재 비밀번호와 동일합니다.';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 프로필 저장
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('입력 정보를 확인해주세요.');
      return;
    }

    try {
      await onUpdateProfile(formData);
      toast.success('프로필이 성공적으로 수정되었습니다!', {
        kirbyStyle: true
      });
      handleClose();
    } catch (error) {
      toast.error('프로필 수정 중 오류가 발생했습니다.');
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      toast.warning('비밀번호 정보를 확인해주세요.');
      return;
    }

    try {
      // 실제로는 백엔드 API 호출
      // await changePassword(currentPassword, passwordData.newPassword);
      
      toast.success('비밀번호가 성공적으로 변경되었습니다!', {
        kirbyStyle: true
      });
      handleClose();
    } catch (error) {
      toast.error('비밀번호 변경 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-edit-modal-overlay" onClick={handleClose}>
      <div className="profile-edit-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-content">
            <Shield className="header-icon" size={24} />
            <div>
              <h2>
                {step === 'verify' && '본인 확인'}
                {step === 'edit' && '프로필 수정'}
                {step === 'changePassword' && '비밀번호 변경'}
              </h2>
              <p>
                {step === 'verify' && '보안을 위해 현재 비밀번호를 확인해주세요'}
                {step === 'edit' && '개인정보를 안전하게 수정하세요'}
                {step === 'changePassword' && '새로운 비밀번호를 설정하세요'}
              </p>
            </div>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* 단계 표시 */}
        <div className="step-indicator">
          <div className={`step ${step === 'verify' ? 'active' : 'completed'}`}>
            <div className="step-number">1</div>
            <span>본인확인</span>
          </div>
          <div className={`step ${step === 'edit' ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>정보수정</span>
          </div>
        </div>

        {/* 내용 */}
        <div className="modal-content">
          {/* 1단계: 비밀번호 확인 */}
          {step === 'verify' && (
            <form onSubmit={handlePasswordVerification} className="verify-form">
              <div className="security-notice">
                <Lock className="notice-icon" size={20} />
                <div>
                  <h4>보안 확인</h4>
                  <p>개인정보 보호를 위해 현재 비밀번호를 입력해주세요.</p>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="currentPassword">현재 비밀번호</label>
                <div className="input-wrapper">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호를 입력하세요"
                    className={passwordError ? 'error' : ''}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && (
                  <span className="error-message">
                    <AlertCircle size={16} />
                    {passwordError}
                  </span>
                )}
              </div>

              <button 
                type="submit" 
                className="verify-button"
                disabled={verifying || !currentPassword.trim()}
              >
                {verifying ? (
                  <LoadingSpinner size="small" type="default" />
                ) : (
                  <>
                    <CheckCircle size={18} />
                    확인
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2단계: 프로필 수정 */}
          {step === 'edit' && (
            <div className="edit-content">
              {/* 탭 메뉴 */}
              <div className="tab-menu">
                <button 
                  className="tab-button active"
                  onClick={() => setStep('edit')}
                >
                  <User size={16} />
                  기본 정보
                </button>
                <button 
                  className="tab-button"
                  onClick={() => setStep('changePassword')}
                >
                  <Key size={16} />
                  비밀번호 변경
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="edit-form">
                <div className="form-grid">
                  <div className="input-group">
                    <label htmlFor="name">이름 *</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="이름을 입력하세요"
                        className={formErrors.name ? 'error' : ''}
                      />
                    </div>
                    {formErrors.name && (
                      <span className="error-message">
                        <AlertCircle size={16} />
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="email">이메일 *</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="이메일을 입력하세요"
                        className={formErrors.email ? 'error' : ''}
                      />
                    </div>
                    {formErrors.email && (
                      <span className="error-message">
                        <AlertCircle size={16} />
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="phone">전화번호</label>
                    <div className="input-wrapper">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="전화번호를 입력하세요"
                        className={formErrors.phone ? 'error' : ''}
                      />
                    </div>
                    {formErrors.phone && (
                      <span className="error-message">
                        <AlertCircle size={16} />
                        {formErrors.phone}
                      </span>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="birthDate">생년월일</label>
                    <div className="input-wrapper">
                      <input
                        type="date"
                        id="birthDate"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className={formErrors.birthDate ? 'error' : ''}
                      />
                    </div>
                  </div>

                  <div className="input-group full-width">
                    <label htmlFor="address">주소</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="주소를 입력하세요"
                        className={formErrors.address ? 'error' : ''}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={handleClose}>
                    취소
                  </button>
                  <button type="submit" className="save-button" disabled={loading}>
                    {loading ? (
                      <LoadingSpinner size="small" type="default" />
                    ) : (
                      '저장하기'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 비밀번호 변경 */}
          {step === 'changePassword' && (
            <div className="password-change-content">
              {/* 탭 메뉴 */}
              <div className="tab-menu">
                <button 
                  className="tab-button"
                  onClick={() => setStep('edit')}
                >
                  <User size={16} />
                  기본 정보
                </button>
                <button 
                  className="tab-button active"
                  onClick={() => setStep('changePassword')}
                >
                  <Key size={16} />
                  비밀번호 변경
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="password-form">
                <div className="security-tips">
                  <h4>안전한 비밀번호 만들기</h4>
                  <ul>
                    <li>8자 이상의 길이</li>
                    <li>영문과 숫자 조합</li>
                    <li>특수문자 포함 권장</li>
                    <li>개인정보와 관련없는 내용</li>
                  </ul>
                </div>

                <div className="input-group">
                  <label htmlFor="newPassword">새 비밀번호 *</label>
                  <div className="input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="새 비밀번호를 입력하세요"
                      className={passwordErrors.newPassword ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {passwordErrors.newPassword}
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label htmlFor="confirmPassword">새 비밀번호 확인 *</label>
                  <div className="input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      className={passwordErrors.confirmPassword ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <span className="error-message">
                      <AlertCircle size={16} />
                      {passwordErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={() => setStep('edit')}>
                    뒤로가기
                  </button>
                  <button type="submit" className="save-button" disabled={loading}>
                    {loading ? (
                      <LoadingSpinner size="small" type="default" />
                    ) : (
                      '비밀번호 변경'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
