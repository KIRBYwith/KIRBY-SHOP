// src/pages/MyPage.js

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Star, ChevronRight, Gift, LogOut, MessageCircle, 
  Edit3, CreditCard, MapPin, Bell, Shield, Heart, 
  Award, ShoppingBag, Truck, Package, UserCheck, 
  Settings, HelpCircle, Trash2, Camera, Mail, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/MyPage.css';

const MyPage = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    birthDate: user?.birthDate || ''
  });
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [imagePreview, setImagePreview] = useState(null);

  // 로그아웃시 홈으로 리디렉트
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 개인정보 수정 모달 열기
  const handleEditProfile = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      birthDate: user?.birthDate || ''
    });
    setShowEditModal(true);
  };

  // 개인정보 수정 저장
  const handleSaveProfile = () => {
    updateUser(editForm);
    setShowEditModal(false);
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
  const handleSaveImage = () => {
    if (imagePreview) {
      updateUser({ profileImage: imagePreview });
      setProfileImage(imagePreview);
      setShowImageModal(false);
      setImagePreview(null);
    }
  };

  // 프로필 이미지 삭제
  const handleDeleteImage = () => {
    updateUser({ profileImage: null });
    setProfileImage(null);
    setShowImageModal(false);
    setImagePreview(null);
  };

  // 회원 탈퇴
  const handleDeleteAccount = () => {
    if (window.confirm('정말로 회원 탈퇴를 하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      logout();
      navigate('/');
    }
  };

  // 만약 로그인 안되어 있을 때 예외처리
  if (!user) {
    return (
      <>
        <Header />
      <div className="mypage-container">
        <div className="mypage-box">
          <p>로그인이 필요합니다.</p>
          <button className="btn" onClick={() => navigate('/login')}>로그인하러 가기</button>
        </div>
      </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
    <div className="mypage-container">
        {/* 프로필 섹션 */}
      <div className="mypage-profile">
        <div className="profile-main">
            <div className="profile-avatar">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="프로필 이미지" 
                  className="profile-image"
                />
              ) : (
                <User size={48} className="profile-icon" />
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
                <div className="stat-item">
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
        <div className="mypage-section">
          <h3 className="section-title">주문 관리</h3>
          <div className="mypage-menu">
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
        <div className="mypage-section">
          <h3 className="section-title">혜택 및 쿠폰</h3>
          <div className="mypage-menu">
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
        <div className="mypage-section">
          <h3 className="section-title">배송 및 결제</h3>
          <div className="mypage-menu">
            <button className="menu-item" onClick={() => navigate('/address')}>
              <MapPin size={20} />
              <div className="menu-content">
                <span className="menu-title">배송지 관리</span>
                <span className="menu-desc">배송 주소를 관리하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => navigate('/payment')}>
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
        <div className="mypage-section">
          <h3 className="section-title">리뷰 관리</h3>
          <div className="mypage-menu">
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
        <div className="mypage-section">
          <h3 className="section-title">고객지원</h3>
          <div className="mypage-menu">
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
        <div className="mypage-section">
          <h3 className="section-title">설정 및 계정</h3>
      <div className="mypage-menu">
            <button className="menu-item" onClick={handleEditProfile}>
              <UserCheck size={20} />
              <div className="menu-content">
                <span className="menu-title">개인정보 수정</span>
                <span className="menu-desc">프로필 정보를 수정하세요</span>
              </div>
              <ChevronRight size={16} />
            </button>
            <button className="menu-item" onClick={() => navigate('/settings')}>
              <Settings size={20} />
              <div className="menu-content">
                <span className="menu-title">알림 설정</span>
                <span className="menu-desc">알림을 관리하세요</span>
              </div>
          <ChevronRight size={16} />
        </button>
            <button className="menu-item" onClick={() => navigate('/privacy')}>
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
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>개인정보 수정</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>이메일</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  placeholder="이메일을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>전화번호</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="전화번호를 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>주소</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  placeholder="주소를 입력하세요"
                />
              </div>
              <div className="form-group">
                <label>생년월일</label>
                <input
                  type="date"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                취소
              </button>
              <button className="btn-primary" onClick={handleSaveProfile}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 프로필 이미지 업로드 모달 */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>프로필 이미지 변경</h3>
              <button className="close-btn" onClick={() => setShowImageModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="image-upload-section">
                <div className="current-image">
                  <h4>현재 이미지</h4>
                  {profileImage ? (
                    <img src={profileImage} alt="현재 프로필" className="current-profile-img" />
                  ) : (
                    <div className="no-image">
                      <User size={48} />
                      <span>이미지 없음</span>
                    </div>
                  )}
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
                      <img src={imagePreview} alt="미리보기" className="preview-img" />
                    )}
                  </div>
                  <p className="upload-info">
                    • 이미지 파일만 업로드 가능합니다<br/>
                    • 최대 파일 크기: 5MB<br/>
                    • 권장 크기: 200x200px 이상
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowImageModal(false)}>
                취소
              </button>
              {profileImage && (
                <button className="btn-danger" onClick={handleDeleteImage}>
                  이미지 삭제
                </button>
              )}
              <button 
                className="btn-primary" 
                onClick={handleSaveImage}
                disabled={!imagePreview}
              >
                저장
              </button>
            </div>
          </div>
    </div>
      )}

      <Footer />
    </>
  );
};

export default MyPage;
