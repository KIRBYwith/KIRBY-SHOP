// src/pages/MyPage.js

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { useCart } from '../hooks/useCart';
import { 
  User, Star, ChevronRight, LogOut, MessageCircle, 
  Edit3, CreditCard, MapPin, Shield, Heart, 
  Award, ShoppingBag, Package, UserCheck, 
  Settings, HelpCircle, Trash2, Camera, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import KirbyLoader from '../components/common/KirbyLoader';
import ProfileEditModal from '../components/user/ProfileEditModal';
import PrivacyPolicyModal from '../components/legal/PrivacyPolicyModal';
import AccountDeletionModal from '../components/user/AccountDeletionModal';
import NotificationSettingsModal from '../components/settings/NotificationSettingsModal';
import PaymentMethodModal from '../components/payment/PaymentMethodModal';
import ShippingAddressModal from '../components/shipping/ShippingAddressModal';
import '../styles/MyPage.css';

const MyPage = () => {
  const { user, logout, updateUser } = useAuth();
  const { withLoading, isLoading, getLoadingText } = useLoading();
  const { cartSummary } = useCart(user);
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [imagePreview, setImagePreview] = useState(null);

  // 로그아웃시 홈으로 리디렉트
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 개인정보 수정 모달 열기
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // 프로필 이미지 업로드 모달 열기
  const handleImageUpload = () => {
    setShowImageModal(true);
  };

  // 이미지 파일 선택
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // 파일 크기 체크 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      // 파일 타입 체크
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 이미지 저장
  const handleSaveImage = async () => {
    if (imagePreview) {
      await withLoading('image-save', async () => {
        updateUser({ profileImage: imagePreview });
        setProfileImage(imagePreview);
        setShowImageModal(false);
        setImagePreview(null);
      }, '이미지를 저장하는 중...');
    }
  };

  // 프로필 이미지 삭제
  const handleDeleteImage = () => {
    updateUser({ profileImage: null });
    setProfileImage(null);
    setShowImageModal(false);
    setImagePreview(null);
  };

  // 회원 탈퇴 모달 열기
  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  // 실제 회원 탈퇴 처리
  const handleConfirmDelete = async () => {
    await withLoading('account-delete', async () => {
      logout();
      navigate('/');
    }, '계정을 삭제하는 중...');
  };

  // 만약 로그인 안되어 있을 때 예외처리
  if (!user) {
    return (
      <div className="mypage-page-wrapper">
        <Header />
        <div className="mypage-main-container">
          <div className="mypage-main-box">
            <p>로그인이 필요합니다.</p>
            <button className="btn" onClick={() => navigate('/login')}>로그인하러 가기</button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="mypage-page-wrapper">
      <Header />
      <div className="mypage-main-container">
        {/* 프로필 섹션 */}
      <div className="mypage-main-profile">
        <div className="profile-main">
            <div className="profile-avatar">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="프로필 이미지" 
                  className="profile-image"
                />
              ) : (
                <div className="kirby-profile-placeholder">
                  <div className="kirby-ball"></div>
                  <div className="kirby-shadow"></div>
                </div>
              )}
              <button className="edit-avatar-btn" onClick={handleImageUpload}>
                <Camera size={16} />
              </button>
            </div>
          <div className="profile-info">
              <div className="profile-header">
            <span className="profile-name">{user.name || '닉네임 없음'}</span>
                <button className="edit-profile-btn" onClick={handleEditProfile}>
                  <Edit3 size={16} />
                  수정
                </button>
              </div>
              <span className={`profile-grade ${user.grade}`}>{user.grade || '일반회원'}</span>
              <div className="profile-stats">
                <div className="stat-item" onClick={() => navigate('/points')} style={{ cursor: 'pointer' }}>
                  <span className="stat-label">포인트</span>
                  <span className="stat-value">{user.points || 0}P</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">주문횟수</span>
                  <span className="stat-value">{user.orderCount || 0}회</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 주문 관련 메뉴 */}
        <div className="mypage-main-section">
          <h3 className="section-title">주문 관리</h3>
          <div className="mypage-main-menu">
            <button className="menu-item" onClick={() => navigate('/orders')}>
              <Package size={20} />
              <div className="menu-content">
                <span className="menu-title">주문내역</span>
                <span className="menu-desc">주문한 상품을 확인하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => navigate('/cart')}>
              <ShoppingBag size={20} />
              <div className="menu-content">
                <span className="menu-title">장바구니</span>
                <span className="menu-desc">담은 상품을 확인하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => navigate('/wishlist')}>
              <Heart size={20} />
              <div className="menu-content">
                <span className="menu-title">찜목록</span>
                <span className="menu-desc">관심 상품을 관리하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 혜택 및 쿠폰 */}
        <div className="mypage-main-section">
          <h3 className="section-title">혜택 및 쿠폰</h3>
          <div className="mypage-main-menu">
            <button className="menu-item" onClick={() => navigate('/coupon')}>
              <Star size={20} />
              <div className="menu-content">
                <span className="menu-title">쿠폰함</span>
                <span className="menu-desc">사용 가능한 쿠폰을 확인하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => navigate('/points')}>
              <Award size={20} />
              <div className="menu-content">
                <span className="menu-title">포인트</span>
                <span className="menu-desc">적립 및 사용 내역을 확인하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 배송 및 결제 */}
        <div className="mypage-main-section">
          <h3 className="section-title">배송 및 결제</h3>
          <div className="mypage-main-menu">
            <button className="menu-item" onClick={() => setShowAddressModal(true)}>
              <MapPin size={20} />
              <div className="menu-content">
                <span className="menu-title">배송지 관리</span>
                <span className="menu-desc">배송 주소를 관리하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => setShowPaymentModal(true)}>
              <CreditCard size={20} />
              <div className="menu-content">
                <span className="menu-title">결제수단 관리</span>
                <span className="menu-desc">카드 및 계좌를 관리하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 리뷰 관리 */}
        <div className="mypage-main-section">
          <h3 className="section-title">리뷰 관리</h3>
          <div className="mypage-main-menu">
            <button className="menu-item" onClick={() => navigate('/review')}>
              <Star size={20} />
              <div className="menu-content">
                <span className="menu-title">리뷰 작성</span>
                <span className="menu-desc">구매한 상품에 리뷰를 작성하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => navigate('/review')}>
              <Edit3 size={20} />
              <div className="menu-content">
                <span className="menu-title">내 리뷰 관리</span>
                <span className="menu-desc">작성한 리뷰를 관리하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 고객지원 */}
        <div className="mypage-main-section">
          <h3 className="section-title">고객지원</h3>
          <div className="mypage-main-menu">
            <button className="menu-item" onClick={() => navigate('/qna')}>
              <MessageCircle size={20} />
              <div className="menu-content">
                <span className="menu-title">문의 내역</span>
                <span className="menu-desc">고객센터 문의를 확인하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => navigate('/qna')}>
              <HelpCircle size={20} />
              <div className="menu-content">
                <span className="menu-title">자주 묻는 질문</span>
                <span className="menu-desc">FAQ를 확인하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
      </div>

        {/* 설정 및 계정 */}
        <div className="mypage-main-section">
          <h3 className="section-title">설정 및 계정</h3>
      <div className="mypage-main-menu">
            <button className="menu-item" onClick={handleEditProfile}>
              <UserCheck size={20} />
              <div className="menu-content">
                <span className="menu-title">개인정보 수정</span>
                <span className="menu-desc">프로필 정보를 수정하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => setShowNotificationModal(true)}>
              <Settings size={20} />
              <div className="menu-content">
                <span className="menu-title">알림 설정</span>
                <span className="menu-desc">알림을 관리하세요</span>
              </div>
          <ChevronRight size={16} />
        </button>
            <button className="menu-item" onClick={() => setShowPrivacyModal(true)}>
              <Shield size={20} />
              <div className="menu-content">
                <span className="menu-title">개인정보 처리방침</span>
                <span className="menu-desc">개인정보 보호 정책을 확인하세요</span>
              </div>
          <ChevronRight size={16} />
        </button>
            <button className="menu-item logout" onClick={handleLogout}>
              <LogOut size={20} />
              <div className="menu-content">
                <span className="menu-title">로그아웃</span>
                <span className="menu-desc">계정에서 로그아웃하세요</span>
              </div>
            </button>
            <button className="menu-item delete" onClick={handleDeleteAccount}>
              <Trash2 size={20} />
              <div className="menu-content">
                <span className="menu-title">회원 탈퇴</span>
                <span className="menu-desc">계정을 영구적으로 삭제하세요</span>
              </div>
        </button>
          </div>
        </div>
      </div>

      {/* 개인정보 수정 모달 */}
      <ProfileEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onUpdateProfile={updateUser}
        loading={isLoading('profile-save')}
      />

      {/* 개인정보처리방침 모달 */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* 회원탈퇴 모달 */}
      <AccountDeletionModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        user={user}
        onDeleteAccount={handleConfirmDelete}
        loading={isLoading('account-delete')}
      />

      {/* 알림 설정 모달 */}
      <NotificationSettingsModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        user={user}
        onUpdateSettings={updateUser}
        loading={isLoading('notification-save')}
      />

      {/* 결제수단 관리 모달 */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        user={{
          ...user,
          cartTotal: cartSummary?.finalPrice || 0
        }}
        onUpdatePaymentMethods={updateUser}
        loading={isLoading('payment-save')}
      />

      {/* 배송지 관리 모달 */}
      <ShippingAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        user={user}
        onUpdateAddresses={updateUser}
        loading={isLoading('address-save')}
      />

      {/* 프로필 이미지 업로드 모달 */}
      {showImageModal && (
        <div className="profile-image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="profile-image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-content">
                <div className="header-icon">
                  <Camera size={24} />
                </div>
                <div>
                  <h2>프로필 이미지 변경</h2>
                  <p>새로운 프로필 이미지를 업로드하세요</p>
                </div>
              </div>
              <button className="close-button" onClick={() => setShowImageModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="image-upload-section">
                <div className="current-image-section">
                  <h4>현재 이미지</h4>
                  <div className="current-image-container">
                    {profileImage ? (
                      <img src={profileImage} alt="현재 프로필" className="current-profile-img" />
                    ) : (
                      <div className="no-image">
                        <User size={48} />
                        <span>이미지 없음</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="image-preview-section">
                  <h4>새 이미지</h4>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="image-upload" className="upload-btn">
                      <Camera size={24} />
                      <span>이미지 선택</span>
                    </label>
                    {imagePreview && (
                      <div className="preview-container">
                        <img src={imagePreview} alt="미리보기" className="preview-img" />
                      </div>
                    )}
                  </div>
                  <div className="upload-info">
                    <p>• 이미지 파일만 업로드 가능합니다</p>
                    <p>• 최대 파일 크기: 5MB</p>
                    <p>• 권장 크기: 200x200px 이상</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowImageModal(false)}
                disabled={isLoading('image-save')}
              >
                취소
              </button>
              {profileImage && (
                <button 
                  className="btn-danger" 
                  onClick={handleDeleteImage}
                  disabled={isLoading('image-save')}
                >
                  이미지 삭제
                </button>
              )}
              <button 
                className="btn-primary" 
                onClick={handleSaveImage}
                disabled={!imagePreview || isLoading('image-save')}
              >
                {isLoading('image-save') ? (
                  <KirbyLoader text={getLoadingText('image-save')} size="small" />
                ) : (
                  '저장'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyPage;
