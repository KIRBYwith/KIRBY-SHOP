// src/utils/addressStorage.js

/**
 * 배송지 정보 관리를 위한 유틸리티 함수들
 */

export const getStoredAddresses = (userId) => {
  if (!userId) return [];
  
  try {
    const stored = localStorage.getItem(`shipping-addresses-${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('저장된 배송지 로드 실패:', error);
    return [];
  }
};

export const saveAddresses = (userId, addresses) => {
  if (!userId) return false;
  
  try {
    localStorage.setItem(`shipping-addresses-${userId}`, JSON.stringify(addresses));
    return true;
  } catch (error) {
    console.error('배송지 저장 실패:', error);
    return false;
  }
};

export const addAddress = (userId, address) => {
  const addresses = getStoredAddresses(userId);
  const newAddress = {
    ...address,
    id: Date.now(),
    createdAt: new Date().toISOString().split('T')[0]
  };
  
  // 기본 배송지로 설정하는 경우 다른 주소들의 기본 설정 해제
  if (newAddress.isDefault) {
    addresses.forEach(addr => addr.isDefault = false);
  }
  
  addresses.push(newAddress);
  return saveAddresses(userId, addresses) ? newAddress : null;
};

export const updateAddress = (userId, addressId, updates) => {
  const addresses = getStoredAddresses(userId);
  const addressIndex = addresses.findIndex(addr => addr.id === addressId);
  
  if (addressIndex === -1) return false;
  
  // 기본 배송지로 설정하는 경우 다른 주소들의 기본 설정 해제
  if (updates.isDefault) {
    addresses.forEach(addr => addr.isDefault = false);
  }
  
  addresses[addressIndex] = { ...addresses[addressIndex], ...updates };
  return saveAddresses(userId, addresses);
};

export const deleteAddress = (userId, addressId) => {
  const addresses = getStoredAddresses(userId);
  const filteredAddresses = addresses.filter(addr => addr.id !== addressId);
  
  // 삭제된 주소가 기본 배송지였고 다른 주소가 있는 경우 첫 번째 주소를 기본으로 설정
  const deletedAddress = addresses.find(addr => addr.id === addressId);
  if (deletedAddress?.isDefault && filteredAddresses.length > 0) {
    filteredAddresses[0].isDefault = true;
  }
  
  return saveAddresses(userId, filteredAddresses);
};

export const getDefaultAddress = (userId) => {
  const addresses = getStoredAddresses(userId);
  return addresses.find(addr => addr.isDefault) || addresses[0] || null;
};

export const setDefaultAddress = (userId, addressId) => {
  return updateAddress(userId, addressId, { isDefault: true });
};

/**
 * 주소 정보를 주문 형식으로 변환
 */
export const convertToOrderFormat = (address) => {
  if (!address) return null;
  
  return {
    name: address.recipientName,
    phone: address.phone,
    address: address.address,
    addressDetail: address.detailAddress,
    zip: address.zipCode,
    deliveryRequest: address.deliveryRequest || '',
    _selectedAddressId: address.id
  };
};

/**
 * 주문 형식을 배송지 형식으로 변환
 */
export const convertFromOrderFormat = (orderAddress, additionalInfo = {}) => {
  if (!orderAddress) return null;
  
  return {
    recipientName: orderAddress.name,
    phone: orderAddress.phone,
    address: orderAddress.address,
    detailAddress: orderAddress.addressDetail,
    zipCode: orderAddress.zip,
    deliveryRequest: orderAddress.deliveryRequest || '',
    ...additionalInfo
  };
};
