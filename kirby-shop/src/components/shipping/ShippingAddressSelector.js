// src/components/shipping/ShippingAddressSelector.js

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, CheckCircle, Home, Building, 
  User, Phone, Edit3, ChevronDown, ChevronUp
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import ShippingAddressModal from './ShippingAddressModal';
import '../../styles/ShippingAddressSelector.css';

const ShippingAddressSelector = ({ 
  user, 
  selectedAddress, 
  onAddressSelect, 
  onNewAddressCreated,
  showManualInput = true 
}) => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [showSavedAddresses, setShowSavedAddresses] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);

  useEffect(() => {
    loadSavedAddresses();
  }, [user]);

  const loadSavedAddresses = () => {
    if (!user?.id) return;
    
    const saved = localStorage.getItem(`shipping-addresses-${user.id}`);
    if (saved) {
      const addressList = JSON.parse(saved);
      setAddresses(addressList);
      
      // 기본 배송지가 있고 아직 주소가 선택되지 않았다면 자동 선택
      const defaultAddress = addressList.find(addr => addr.isDefault);
      if (defaultAddress && !selectedAddress) {
        handleAddressSelect(defaultAddress);
      }
    }
  };

  const handleAddressSelect = (address) => {
    const formattedAddress = {
      name: address.recipientName,
      phone: address.phone,
      address: address.address,
      addressDetail: address.detailAddress,
      zip: address.zipCode,
      deliveryRequest: address.deliveryRequest || '',
      _selectedAddressId: address.id
    };
    
    onAddressSelect(formattedAddress);
    setUseManualInput(false);
    
    toast.success(`${address.nickname} 배송지가 선택되었습니다.`, {
      kirbyStyle: true
    });
  };

  const handleManualInput = () => {
    setUseManualInput(true);
    onAddressSelect({
      name: user?.name || '',
      phone: user?.phone || '',
      address: '',
      addressDetail: '',
      zip: '',
      deliveryRequest: '',
      _selectedAddressId: null
    });
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
    loadSavedAddresses(); // 새로운 주소가 추가되었을 수 있으므로 다시 로드
  };

  const getAddressTypeIcon = (type) => {
    const icons = {
      home: Home,
      office: Building,
      etc: MapPin
    };
    const Icon = icons[type] || MapPin;
    return <Icon size={16} />;
  };

  const getAddressTypeName = (type) => {
    const names = {
      home: '집',
      office: '회사',
      etc: '기타'
    };
    return names[type] || '기타';
  };

  return (
    <div className="shipping-address-selector">
      {/* 저장된 배송지 목록 */}
      {addresses.length > 0 && (
        <div className="saved-addresses-section">
          <div className="section-header" onClick={() => setShowSavedAddresses(!showSavedAddresses)}>
            <h4>
              <MapPin size={18} />
              저장된 배송지 ({addresses.length}개)
            </h4>
            <button className="toggle-button">
              {showSavedAddresses ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {showSavedAddresses && (
            <div className="address-list">
              {addresses.map(address => (
                <div 
                  key={address.id} 
                  className={`address-item ${selectedAddress?._selectedAddressId === address.id ? 'selected' : ''}`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="address-radio">
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddress?._selectedAddressId === address.id}
                      onChange={() => handleAddressSelect(address)}
                    />
                    <div className="radio-custom">
                      {selectedAddress?._selectedAddressId === address.id && <CheckCircle size={14} />}
                    </div>
                  </div>

                  <div className="address-content">
                    <div className="address-header">
                      <div className="address-title">
                        {getAddressTypeIcon(address.addressType)}
                        <span className="address-nickname">{address.nickname}</span>
                        {address.isDefault && (
                          <span className="default-badge">기본</span>
                        )}
                      </div>
                      <span className="address-type">{getAddressTypeName(address.addressType)}</span>
                    </div>

                    <div className="address-details">
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
                          <span>📝 {address.deliveryRequest}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 새 배송지 추가 및 직접 입력 옵션 */}
      <div className="address-options">
        <button 
          className="option-button new-address"
          onClick={() => setShowAddressModal(true)}
        >
          <Plus size={18} />
          새 배송지 추가
        </button>

        {showManualInput && (
          <button 
            className={`option-button manual-input ${useManualInput ? 'selected' : ''}`}
            onClick={handleManualInput}
          >
            <Edit3 size={18} />
            직접 입력
          </button>
        )}
      </div>

      {/* 선택된 주소 요약 */}
      {selectedAddress && !useManualInput && selectedAddress._selectedAddressId && (
        <div className="selected-address-summary">
          <div className="summary-header">
            <CheckCircle size={16} className="check-icon" />
            <span>선택된 배송지</span>
          </div>
          <div className="summary-content">
            <div className="summary-recipient">
              {selectedAddress.name} | {selectedAddress.phone}
            </div>
            <div className="summary-address">
              ({selectedAddress.zip}) {selectedAddress.address} {selectedAddress.addressDetail}
            </div>
            {selectedAddress.deliveryRequest && (
              <div className="summary-request">
                요청사항: {selectedAddress.deliveryRequest}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 배송지 관리 모달 */}
      {showAddressModal && (
        <ShippingAddressModal
          isOpen={showAddressModal}
          onClose={handleAddressModalClose}
          user={user}
          onUpdateAddresses={onNewAddressCreated}
        />
      )}

      {/* 배송 안내 */}
      <div className="shipping-notice">
        <div className="notice-content">
          <h5>🚚 배송 안내</h5>
          <ul>
            <li>오후 2시 이전 주문 시 당일 발송 (영업일 기준)</li>
            <li>제주도/도서산간 지역은 추가 배송료가 발생할 수 있습니다</li>
            <li>배송 완료 후 SMS로 알림을 보내드립니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressSelector;
