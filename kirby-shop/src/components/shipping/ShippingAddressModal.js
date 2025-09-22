// src/components/shipping/ShippingAddressModal.js

import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Plus, Edit3, Trash2, Star, 
  Home, Building, User, Phone, Search,
  CheckCircle, AlertTriangle, Navigation
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/ShippingAddressModal.css';

const ShippingAddressModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateAddresses, 
  loading = false 
}) => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [formData, setFormData] = useState({
    nickname: '',
    recipientName: '',
    phone: '',
    zipCode: '',
    address: '',
    detailAddress: '',
    addressType: 'home', // home, office, etc
    isDefault: false,
    deliveryRequest: '',
    inputMode: 'search' // 'direct' or 'search'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadAddresses();
      loadDaumAddressAPI();
    } else {
      document.body.style.overflow = 'unset';
      setShowAddForm(false);
      setEditingAddress(null);
      resetForm();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 다음 주소 검색 API 로드
  const loadDaumAddressAPI = () => {
    if (!window.daum) {
      const script = document.createElement('script');
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.async = true;
      document.head.appendChild(script);
    }
  };

  // 다음 주소 검색 실행
  const handleAddressSearch = () => {
    if (!window.daum) {
      toast.error('다음 주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    setIsSearchingAddress(true);
    
    new window.daum.Postcode({
      oncomplete: function(data) {
        setIsSearchingAddress(false);
        
        // 주소 정보 설정
        setFormData(prev => ({
          ...prev,
          zipCode: data.zonecode,
          address: data.address,
          detailAddress: ''
        }));

        // 에러 제거
        setFormErrors(prev => ({
          ...prev,
          zipCode: '',
          address: ''
        }));

        toast.success('다음 주소 검색으로 주소를 성공적으로 찾았습니다.');
      },
      onresize: function(size) {
        // 팝업 크기 조정
      },
      width: '100%',
      height: '100%'
    }).open();
  };

  const loadAddresses = () => {
    // 실제로는 API에서 배송지 목록을 가져옴
    const saved = localStorage.getItem(`shipping-addresses-${user?.id}`);
    if (saved) {
      setAddresses(JSON.parse(saved));
    } else {
      // 샘플 데이터
      const sampleAddresses = [
        {
          id: 1,
          nickname: '우리집',
          recipientName: '홍길동',
          phone: '010-1234-5678',
          zipCode: '06292',
          address: '서울특별시 강남구 테헤란로 123',
          detailAddress: '커비타워 10층',
          addressType: 'home',
          isDefault: true,
          deliveryRequest: '부재 시 경비실에 맡겨주세요',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          nickname: '회사',
          recipientName: '홍길동',
          phone: '010-1234-5678',
          zipCode: '04799',
          address: '서울특별시 성동구 왕십리로 123',
          detailAddress: '오피스빌딩 5층',
          addressType: 'office',
          isDefault: false,
          deliveryRequest: '평일 9-18시만 배송 가능',
          createdAt: '2024-02-20'
        }
      ];
      setAddresses(sampleAddresses);
    }
  };

  const resetForm = () => {
    setFormData({
      nickname: '',
      recipientName: user?.name || '',
      phone: user?.phone || '',
      zipCode: '',
      address: '',
      detailAddress: '',
      addressType: 'home',
      isDefault: false,
      deliveryRequest: '',
      inputMode: 'search'
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // 전화번호 포맷팅
    let processedValue = value;
    if (name === 'phone') {
      processedValue = value.replace(/[^\d]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));

    // 에러 제거
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };


  const validateForm = () => {
    const errors = {};

    if (!formData.nickname.trim()) {
      errors.nickname = '배송지 별칭을 입력해주세요.';
    }

    if (!formData.recipientName.trim()) {
      errors.recipientName = '받는 분 이름을 입력해주세요.';
    }

    if (!formData.phone) {
      errors.phone = '연락처를 입력해주세요.';
    } else if (!/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      errors.phone = '올바른 전화번호를 입력해주세요.';
    }

    if (!formData.zipCode) {
      errors.zipCode = '우편번호를 검색해주세요.';
    }

    if (!formData.address.trim()) {
      errors.address = '주소를 검색해주세요.';
    }

    if (!formData.detailAddress.trim()) {
      errors.detailAddress = '상세주소를 입력해주세요.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.warning('입력 정보를 확인해주세요.');
      return;
    }

    try {
      const newAddress = {
        id: editingAddress ? editingAddress.id : Date.now(),
        ...formData,
        createdAt: editingAddress ? editingAddress.createdAt : new Date().toISOString().split('T')[0]
      };

      let updatedAddresses;
      if (editingAddress) {
        updatedAddresses = addresses.map(addr => 
          addr.id === editingAddress.id ? newAddress : addr
        );
        toast.success('배송지가 수정되었습니다.');
      } else {
        updatedAddresses = [...addresses, newAddress];
        toast.success('배송지가 추가되었습니다.', { kirbyStyle: true });
      }

      // 기본 배송지 설정
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === newAddress.id
        }));
      }

      setAddresses(updatedAddresses);
      localStorage.setItem(`shipping-addresses-${user?.id}`, JSON.stringify(updatedAddresses));
      
      setShowAddForm(false);
      setEditingAddress(null);
      resetForm();

    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({ ...address });
    setShowAddForm(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('이 배송지를 삭제하시겠습니까?')) {
      try {
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        
        // 기본 배송지가 삭제된 경우 첫 번째 배송지를 기본으로 설정
        if (addresses.find(a => a.id === addressId)?.isDefault && updatedAddresses.length > 0) {
          updatedAddresses[0].isDefault = true;
        }

        setAddresses(updatedAddresses);
        localStorage.setItem(`shipping-addresses-${user?.id}`, JSON.stringify(updatedAddresses));
        
        toast.success('배송지가 삭제되었습니다.');
      } catch (error) {
        toast.error('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));

      setAddresses(updatedAddresses);
      localStorage.setItem(`shipping-addresses-${user?.id}`, JSON.stringify(updatedAddresses));
      
      toast.success('기본 배송지가 변경되었습니다.');
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다.');
    }
  };

  const getAddressTypeIcon = (type) => {
    const icons = {
      home: Home,
      office: Building,
      etc: MapPin
    };
    return icons[type] || MapPin;
  };

  const getAddressTypeName = (type) => {
    const names = {
      home: '집',
      office: '회사',
      etc: '기타'
    };
    return names[type] || '기타';
  };


  if (!isOpen) return null;

  return (
    <div className="shipping-address-modal-overlay" onClick={onClose}>
      <div className="shipping-address-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-content">
            <MapPin className="header-icon" size={24} />
            <div>
              <h2>배송지 관리</h2>
              <p>자주 사용하는 배송지를 등록하고 관리하세요</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="modal-content">
          {!showAddForm ? (
            <>
              {/* 배송지 목록 */}
              <div className="address-list">
                <div className="list-header">
                  <h3>등록된 배송지</h3>
                  <div className="header-buttons">
                    <button 
                      className="direct-input-button"
                      onClick={() => {
                        setShowAddForm(true);
                        setFormData(prev => ({ ...prev, inputMode: 'direct' }));
                      }}
                    >
                      <Edit3 size={16} />
                      직접입력
                    </button>
                    <button 
                      className="add-button"
                      onClick={() => {
                        setShowAddForm(true);
                        setFormData(prev => ({ ...prev, inputMode: 'search' }));
                      }}
                    >
                      <Plus size={16} />
                      새 배송지 추가
                    </button>
                  </div>
                </div>

                {addresses.length === 0 ? (
                  <div className="empty-state">
                    <MapPin size={48} />
                    <h4>등록된 배송지가 없습니다</h4>
                    <p>배송지를 추가하면 더 빠르고 편리하게 주문할 수 있어요</p>
                    <button 
                      className="add-first-button"
                      onClick={() => setShowAddForm(true)}
                    >
                      첫 배송지 추가하기
                    </button>
                  </div>
                ) : (
                  <div className="address-grid">
                    {addresses.map(address => {
                      const TypeIcon = getAddressTypeIcon(address.addressType);
                      return (
                        <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                          {address.isDefault && (
                            <div className="default-badge">
                              <Star size={12} />
                              기본
                            </div>
                          )}

                          <div className="address-header">
                            <div className="address-type">
                              <TypeIcon className="type-icon" size={20} />
                              <div>
                                <h4>{address.nickname}</h4>
                                <p className="address-type-name">{getAddressTypeName(address.addressType)}</p>
                              </div>
                            </div>
                            
                            <div className="address-actions">
                              <button 
                                className="action-btn edit"
                                onClick={() => handleEdit(address)}
                                title="수정"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                className="action-btn delete"
                                onClick={() => handleDelete(address.id)}
                                title="삭제"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <div className="address-info">
                            <div className="recipient-info">
                              <User size={14} />
                              <span>{address.recipientName}</span>
                              <Phone size={14} />
                              <span>{address.phone}</span>
                            </div>
                            
                            <div className="address-text">
                              <p className="main-address">
                                ({address.zipCode}) {address.address}
                              </p>
                              <p className="detail-address">
                                {address.detailAddress}
                              </p>
                            </div>

                            {address.deliveryRequest && (
                              <div className="delivery-request">
                                <span className="request-label">요청사항:</span>
                                <span>{address.deliveryRequest}</span>
                              </div>
                            )}
                          </div>

                          {!address.isDefault && (
                            <button 
                              className="set-default-btn"
                              onClick={() => handleSetDefault(address.id)}
                            >
                              기본 배송지로 설정
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 배송 안내 */}
              <div className="delivery-info">
                <Navigation className="info-icon" size={20} />
                <div>
                  <h4>🚚 배송 안내</h4>
                  <ul>
                    <li>오후 2시 이전 주문 시 당일 발송 (영업일 기준)</li>
                    <li>제주도/도서산간 지역은 추가 배송료가 발생할 수 있습니다</li>
                    <li>배송 완료 후 SMS로 알림을 보내드립니다</li>
                    <li>부재중 배송 시 택배함 또는 경비실에 보관됩니다</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            /* 배송지 추가/수정 폼 */
            <div className="address-form">
              <div className="form-header">
                <div className="form-title-section">
                  <h3>{editingAddress ? '배송지 수정' : '새 배송지 추가'}</h3>
                  <div className="input-mode-indicator">
                    {formData.inputMode === 'direct' ? (
                      <span className="mode-badge direct">직접입력 모드</span>
                    ) : (
                      <span className="mode-badge search">주소검색 모드</span>
                    )}
                  </div>
                </div>
                <button 
                  className="back-button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAddress(null);
                    resetForm();
                  }}
                >
                  목록으로
                </button>
              </div>

              <form onSubmit={handleSubmit} className="add-form">
                {/* 배송지 별칭 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="nickname">배송지 별칭 *</label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="예: 우리집, 회사, 친구집"
                      className={formErrors.nickname ? 'error' : ''}
                    />
                    {formErrors.nickname && (
                      <span className="error-message">{formErrors.nickname}</span>
                    )}
                  </div>
                </div>

                {/* 배송지 타입 */}
                <div className="form-row">
                  <div className="input-group">
                    <label>배송지 타입</label>
                    <div className="type-selection">
                      <label className={`type-option ${formData.addressType === 'home' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="addressType"
                          value="home"
                          checked={formData.addressType === 'home'}
                          onChange={handleInputChange}
                        />
                        <div className="option-content">
                          <Home size={18} />
                          <span>집</span>
                        </div>
                      </label>
                      
                      <label className={`type-option ${formData.addressType === 'office' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="addressType"
                          value="office"
                          checked={formData.addressType === 'office'}
                          onChange={handleInputChange}
                        />
                        <div className="option-content">
                          <Building size={18} />
                          <span>회사</span>
                        </div>
                      </label>
                      
                      <label className={`type-option ${formData.addressType === 'etc' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="addressType"
                          value="etc"
                          checked={formData.addressType === 'etc'}
                          onChange={handleInputChange}
                        />
                        <div className="option-content">
                          <MapPin size={18} />
                          <span>기타</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 받는 분 정보 */}
                <div className="form-row">
                  <div className="input-group half">
                    <label htmlFor="recipientName">받는 분 이름 *</label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      placeholder="받는 분 이름"
                      className={formErrors.recipientName ? 'error' : ''}
                    />
                    {formErrors.recipientName && (
                      <span className="error-message">{formErrors.recipientName}</span>
                    )}
                  </div>
                  
                  <div className="input-group half">
                    <label htmlFor="phone">연락처 *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="010-1234-5678"
                      className={formErrors.phone ? 'error' : ''}
                      maxLength="13"
                    />
                    {formErrors.phone && (
                      <span className="error-message">{formErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* 주소 입력 - 직접입력 모드 */}
                {formData.inputMode === 'direct' ? (
                  <div className="form-row">
                    <div className="input-group">
                      <label>우편번호 *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="우편번호를 직접 입력하세요"
                        className={formErrors.zipCode ? 'error' : ''}
                      />
                      {formErrors.zipCode && (
                        <span className="error-message">{formErrors.zipCode}</span>
                      )}
                    </div>
                  </div>
                ) : (
                  /* 주소 검색 - 주소검색 모드 */
                  <div className="form-row">
                    <div className="input-group">
                      <label>주소 검색 *</label>
                      <div className="address-search">
                        <div className="search-row">
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            placeholder="우편번호"
                            readOnly
                            className={formErrors.zipCode ? 'error' : ''}
                          />
                          <button
                            type="button"
                            className="search-button"
                            onClick={handleAddressSearch}
                            disabled={isSearchingAddress}
                          >
                            {isSearchingAddress ? (
                              '검색중...'
                            ) : (
                              <>
                                <Search size={16} />
                                다음 주소검색
                              </>
                            )}
                          </button>
                        </div>
                        {formErrors.zipCode && (
                          <span className="error-message">{formErrors.zipCode}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 주소 입력 */}
                <div className="form-row">
                  <div className="input-group">
                    <label>주소 *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder={formData.inputMode === 'direct' ? "주소를 직접 입력하세요" : "주소를 검색해주세요"}
                      readOnly={formData.inputMode === 'search'}
                      className={formErrors.address ? 'error' : ''}
                    />
                    {formErrors.address && (
                      <span className="error-message">{formErrors.address}</span>
                    )}
                  </div>
                </div>

                {/* 상세주소 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="detailAddress">상세주소 *</label>
                    <input
                      type="text"
                      id="detailAddress"
                      name="detailAddress"
                      value={formData.detailAddress}
                      onChange={handleInputChange}
                      placeholder="상세주소를 입력해주세요 (예: 101동 203호)"
                      className={formErrors.detailAddress ? 'error' : ''}
                    />
                    {formErrors.detailAddress && (
                      <span className="error-message">{formErrors.detailAddress}</span>
                    )}
                  </div>
                </div>

                {/* 배송 요청사항 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="deliveryRequest">배송 요청사항</label>
                    <select
                      id="deliveryRequest"
                      name="deliveryRequest"
                      value={formData.deliveryRequest}
                      onChange={handleInputChange}
                    >
                      <option value="">배송 요청사항을 선택해주세요</option>
                      <option value="부재 시 경비실에 맡겨주세요">부재 시 경비실에 맡겨주세요</option>
                      <option value="부재 시 택배함에 넣어주세요">부재 시 택배함에 넣어주세요</option>
                      <option value="부재 시 문 앞에 놓아주세요">부재 시 문 앞에 놓아주세요</option>
                      <option value="배송 전 미리 연락주세요">배송 전 미리 연락주세요</option>
                      <option value="직접 받겠습니다">직접 받겠습니다</option>
                    </select>
                  </div>
                </div>

                {/* 기본 배송지 설정 */}
                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                    />
                    <span className="checkbox-custom">
                      {formData.isDefault && <CheckCircle size={16} />}
                    </span>
                    기본 배송지로 설정
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingAddress(null);
                      resetForm();
                    }}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? '처리중...' : (editingAddress ? '수정하기' : '추가하기')}
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

export default ShippingAddressModal;
