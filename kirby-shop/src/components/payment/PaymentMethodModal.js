// src/components/payment/PaymentMethodModal.js

import React, { useState, useEffect } from 'react';
import { 
  X, CreditCard, Plus, Edit3, Trash2, 
  Shield, Star, CheckCircle, Eye, EyeOff,
  Zap, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import PaymentModal from './PaymentModal';
import '../../styles/PaymentMethodModal.css';

const PaymentMethodModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUpdatePaymentMethods, 
  loading = false 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [showCardNumber, setShowCardNumber] = useState({});
  
  const [formData, setFormData] = useState({
    type: 'card', // card, account
    cardNumber: '',
    expiryDate: '',
    cardholderName: '',
    cardType: '', // visa, mastercard, amex, etc.
    nickname: '',
    isDefault: false,
    // 계좌 정보
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });

  const [formErrors, setFormErrors] = useState({});
  
  // 결제 모달 상태
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [paymentType, setPaymentType] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      loadPaymentMethods();
    } else {
      document.body.style.overflow = 'unset';
      setShowAddForm(false);
      setEditingMethod(null);
      resetForm();
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 결제 완료 감지
  useEffect(() => {
    const handlePaymentMessage = (event) => {
      if (event.data.type === 'TOSS_PAYMENT_SUCCESS') {
        toast.success('토스페이먼츠 결제가 완료되었습니다!');
        handleTossPaymentSuccess(event.data.data);
        setShowPaymentModal(false);
      } else if (event.data.type === 'TOSS_PAYMENT_CANCEL') {
        toast.info('토스페이먼츠 결제가 취소되었습니다.');
        handleTossPaymentError(new Error('결제 취소'));
        setShowPaymentModal(false);
      } else if (event.data.type === 'KAKAO_PAYMENT_SUCCESS') {
        toast.success('카카오페이 결제가 완료되었습니다!');
        handleKakaoPaySuccess(event.data.data);
        setShowPaymentModal(false);
      } else if (event.data.type === 'KAKAO_PAYMENT_CANCEL') {
        toast.info('카카오페이 결제가 취소되었습니다.');
        handleKakaoPayError(new Error('결제 취소'));
        setShowPaymentModal(false);
      }
    };

    window.addEventListener('message', handlePaymentMessage);
    
    return () => {
      window.removeEventListener('message', handlePaymentMessage);
    };
  }, []);


  // 주문 내역 저장 함수
  const saveOrderToHistory = (paymentData) => {
    try {
      const ORDERS_LIST_KEY = 'kirby-shop-orders';
      const saved = localStorage.getItem(ORDERS_LIST_KEY);
      const orders = saved ? JSON.parse(saved) : [];
      
      const newOrder = {
        orderId: paymentData.orderId || `ORDER-${Date.now()}`,
        status: 'confirmed',
        paymentStatus: 'completed',
        paymentMethod: paymentData.method || 'card',
        totalAmount: paymentData.amount || 0,
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 1,
            name: '커비 상품',
            price: paymentData.amount || 0,
            quantity: 1,
            image: '/kirby_images/kirby_001.jpg'
          }
        ],
        receiver: {
          name: user?.name || '고객',
          phone: user?.phone || '010-0000-0000',
          address: '서울시 강남구',
          addressDetail: '커비빌딩 5층'
        },
        payment: {
          method: paymentData.method || 'card',
          amount: paymentData.amount || 0,
          transactionId: paymentData.paymentKey || paymentData.tid
        }
      };
      
      orders.unshift(newOrder);
      localStorage.setItem(ORDERS_LIST_KEY, JSON.stringify(orders));
      
      console.log('주문 내역 저장 완료:', newOrder);
      toast.success('주문이 완료되어 주문 내역에 추가되었습니다!');
    } catch (error) {
      console.error('주문 내역 저장 실패:', error);
    }
  };

  const loadPaymentMethods = () => {
    // 실제로는 API에서 결제수단 목록을 가져옴
    const saved = localStorage.getItem(`payment-methods-${user?.id}`);
    if (saved) {
      setPaymentMethods(JSON.parse(saved));
    } else {
      // 샘플 데이터
      const sampleMethods = [
        {
          id: 1,
          type: 'card',
          cardNumber: '4532-1234-5678-9012',
          maskedNumber: '4532-****-****-9012',
          expiryDate: '12/25',
          cardholderName: '홍길동',
          cardType: 'visa',
          nickname: '주 결제카드',
          isDefault: true,
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          type: 'card',
          cardNumber: '5555-4444-3333-1111',
          maskedNumber: '5555-****-****-1111',
          expiryDate: '06/26',
          cardholderName: '홍길동',
          cardType: 'mastercard',
          nickname: '비상용 카드',
          isDefault: false,
          createdAt: '2024-02-20'
        }
      ];
      setPaymentMethods(sampleMethods);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'card',
      cardNumber: '',
      expiryDate: '',
      cardholderName: '',
      cardType: '',
      nickname: '',
      isDefault: false,
      bankName: '',
      accountNumber: '',
      accountHolder: ''
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    // 카드번호 포맷팅
    if (name === 'cardNumber') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-').slice(0, 19);
      // 카드 타입 자동 감지
      const cardType = detectCardType(value.replace(/\D/g, ''));
      setFormData(prev => ({ ...prev, cardType }));
    }
    
    // 유효기간 포맷팅
    if (name === 'expiryDate') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').slice(0, 5);
    }

    // 계좌번호 포맷팅
    if (name === 'accountNumber') {
      processedValue = value.replace(/\D/g, '');
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

  const detectCardType = (number) => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
      diners: /^3[0689]/,
      jcb: /^35/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return type;
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};

    if (formData.type === 'card') {
      if (!formData.cardNumber) {
        errors.cardNumber = '카드번호를 입력해주세요.';
      } else if (formData.cardNumber.replace(/\D/g, '').length < 15) {
        errors.cardNumber = '올바른 카드번호를 입력해주세요.';
      }

      if (!formData.expiryDate) {
        errors.expiryDate = '유효기간을 입력해주세요.';
      } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        errors.expiryDate = 'MM/YY 형식으로 입력해주세요.';
      }

      if (!formData.cardholderName.trim()) {
        errors.cardholderName = '카드 소유자명을 입력해주세요.';
      }
    } else {
      if (!formData.bankName.trim()) {
        errors.bankName = '은행명을 선택해주세요.';
      }

      if (!formData.accountNumber) {
        errors.accountNumber = '계좌번호를 입력해주세요.';
      }

      if (!formData.accountHolder.trim()) {
        errors.accountHolder = '예금주명을 입력해주세요.';
      }
    }

    if (!formData.nickname.trim()) {
      errors.nickname = '별칭을 입력해주세요.';
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
      const newMethod = {
        id: editingMethod ? editingMethod.id : Date.now(),
        ...formData,
        maskedNumber: formData.type === 'card' 
          ? formData.cardNumber.replace(/(\d{4})-(\d{4})-(\d{4})-(\d{4})/, '$1-****-****-$4')
          : `${formData.bankName} ****${formData.accountNumber.slice(-4)}`,
        createdAt: editingMethod ? editingMethod.createdAt : new Date().toISOString().split('T')[0]
      };

      let updatedMethods;
      if (editingMethod) {
        updatedMethods = paymentMethods.map(method => 
          method.id === editingMethod.id ? newMethod : method
        );
        toast.success('결제수단이 수정되었습니다.');
      } else {
        updatedMethods = [...paymentMethods, newMethod];
        toast.success('결제수단이 추가되었습니다.', { kirbyStyle: true });
      }

      // 기본 결제수단 설정
      if (formData.isDefault) {
        updatedMethods = updatedMethods.map(method => ({
          ...method,
          isDefault: method.id === newMethod.id
        }));
      }

      setPaymentMethods(updatedMethods);
      localStorage.setItem(`payment-methods-${user?.id}`, JSON.stringify(updatedMethods));
      
      setShowAddForm(false);
      setEditingMethod(null);
      resetForm();

    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({ ...method });
    setShowAddForm(true);
  };

  const handleDelete = async (methodId) => {
    if (window.confirm('이 결제수단을 삭제하시겠습니까?')) {
      try {
        const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
        
        // 기본 결제수단이 삭제된 경우 첫 번째 결제수단을 기본으로 설정
        if (paymentMethods.find(m => m.id === methodId)?.isDefault && updatedMethods.length > 0) {
          updatedMethods[0].isDefault = true;
        }

        setPaymentMethods(updatedMethods);
        localStorage.setItem(`payment-methods-${user?.id}`, JSON.stringify(updatedMethods));
        
        toast.success('결제수단이 삭제되었습니다.');
      } catch (error) {
        toast.error('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }));

      setPaymentMethods(updatedMethods);
      localStorage.setItem(`payment-methods-${user?.id}`, JSON.stringify(updatedMethods));
      
      toast.success('기본 결제수단이 변경되었습니다.');
    } catch (error) {
      toast.error('처리 중 오류가 발생했습니다.');
    }
  };

  const toggleCardNumberVisibility = (methodId) => {
    setShowCardNumber(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }));
  };

  const getCardIcon = (cardType) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      diners: '💳',
      jcb: '💳'
    };
    return icons[cardType] || '💳';
  };

  const getBankList = () => [
    'KB국민은행', '신한은행', '우리은행', '하나은행', 'NH농협은행',
    '기업은행', '부산은행', '대구은행', '경남은행', '광주은행',
    '전북은행', '제주은행', '수협은행', '새마을금고', '신협',
    '우체국', 'SC제일은행', '씨티은행', 'HSBC은행', '도이치은행'
  ];

  // 토스페이먼츠 결제 시작
  const handleTossPayment = async (amount = 1000) => {
    console.log('토스페이먼츠 결제 버튼 클릭:', amount);
    
    // 실제 주문 금액이 있으면 사용, 없으면 기본값
    const actualAmount = user?.cartTotal || amount;
    
    const paymentData = {
      orderId: `TOSS_${Date.now()}`,
      orderName: `커비 상품 결제 (${actualAmount.toLocaleString()}원)`,
      totalAmount: actualAmount,
      customerName: user?.name || '고객',
      customerEmail: user?.email || 'customer@example.com'
    };
    
    console.log('토스페이먼츠 결제 데이터:', paymentData);
    
    try {
      console.log('토스페이먼츠 API 호출 시작:', actualAmount);
      
      // 토스페이먼츠 결제 준비 API 호출
      const response = await fetch('http://localhost:8000/api/payments/toss/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer test-token`
        },
        body: JSON.stringify({
          amount: actualAmount,
          orderId: paymentData.orderId,
          orderName: paymentData.orderName,
          customerName: paymentData.customerName,
          customerEmail: paymentData.customerEmail,
          successUrl: `${window.location.origin}/payment/toss/success`,
          failUrl: `${window.location.origin}/payment/toss/fail`
        })
      });

      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(`토스페이먼츠 결제 준비 실패: ${errorMessage}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError);
        const responseText = await response.text();
        console.error('응답 텍스트:', responseText);
        throw new Error(`서버 응답을 파싱할 수 없습니다: ${responseText.substring(0, 100)}...`);
      }
      
      // 토스페이먼츠 결제 모달 열기 (PaymentModal 사용)
      toast.success('토스페이먼츠 결제창을 엽니다.');
      
      setPaymentData({
        payment_id: result.paymentKey,
        payment_url: result.checkoutUrl,
        amount: actualAmount,
        order_id: paymentData.orderId
      });
      setPaymentType('toss');
      setShowPaymentModal(true);

    } catch (error) {
      console.error('토스페이먼츠 결제 오류:', error);
      
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      // 네트워크 오류인지 확인
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '네트워크 연결을 확인해주세요. 백엔드 서버가 실행 중인지 확인하세요.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      toast.error(`토스페이먼츠 결제 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

  // 토스페이먼츠 결제 성공 처리
  const handleTossPaymentSuccess = (result) => {
    // 토스페이먼츠 결제 성공
    toast.success('토스페이먼츠 결제가 완료되었습니다!');
    
    // 주문 내역에 저장
    saveOrderToHistory(result);
    
    // 결제 성공 후 주문 히스토리로 이동
    setTimeout(() => {
      navigate('/order-history');
      onClose(); // 모달 닫기
    }, 2000);
    
    // 결제 성공 후 추가 처리
    if (onUpdatePaymentMethods) {
      onUpdatePaymentMethods();
    }
  };

  // 토스페이먼츠 결제 실패 처리
  const handleTossPaymentError = (error) => {
    // 토스페이먼츠 결제 실패
    toast.error('토스페이먼츠 결제에 실패했습니다. 다시 시도해주세요.');
  };

  // 카카오페이 결제 시작
  const handleKakaoPay = async (amount = 1000) => {
    console.log('카카오페이 결제 버튼 클릭:', amount);
    
    // 실제 주문 금액이 있으면 사용, 없으면 기본값
    const actualAmount = user?.cartTotal || amount;
    
    const paymentData = {
      orderId: `KAKAO_${Date.now()}`,
      orderName: `커비 상품 결제 (${actualAmount.toLocaleString()}원)`,
      totalAmount: actualAmount,
      customerId: user?.id || 'user_001',
      customerName: user?.name || '고객',
      customerEmail: user?.email || 'customer@example.com'
    };
    
    console.log('카카오페이 결제 데이터:', paymentData);
    
    try {
      console.log('카카오페이 API 호출 시작:', actualAmount);
      
      // 카카오페이 결제 준비 API 호출
      const requestData = {
        cid: 'TC0ONETIME',
        partner_order_id: paymentData.orderId,
        partner_user_id: paymentData.customerId,
        item_name: paymentData.orderName,
        quantity: 1,
        total_amount: actualAmount,
        tax_free_amount: 0,
        approval_url: `${window.location.origin}/payment/kakao/success`,
        cancel_url: `${window.location.origin}/payment/kakao/cancel`,
        fail_url: `${window.location.origin}/payment/kakao/fail`
      };
      
      console.log('카카오페이 API 요청 데이터:', requestData);
      
      const response = await fetch('http://localhost:8000/api/payments/kakao/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer test-token`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `HTTP ${response.status}`;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(`카카오페이 결제 준비 실패: ${errorMessage}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('카카오페이 API 응답:', result);
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError);
        const responseText = await response.text();
        console.error('응답 텍스트:', responseText);
        throw new Error(`서버 응답을 파싱할 수 없습니다: ${responseText.substring(0, 100)}...`);
      }
      
      // 카카오페이 결제 모달 열기 (PaymentModal 사용)
      if (result.next_redirect_pc_url) {
        console.log('카카오페이 결제 모달 표시:', result);
        toast.success('카카오페이 결제창을 엽니다.');
        
        setPaymentData({
          payment_id: result.tid,
          payment_url: result.next_redirect_pc_url,
          amount: actualAmount,
          order_id: paymentData.orderId
        });
        setPaymentType('kakao');
        setShowPaymentModal(true);
      } else {
        console.error('카카오페이 결제 URL 없음:', result);
        throw new Error('결제 URL을 받지 못했습니다.');
      }

    } catch (error) {
      console.error('카카오페이 결제 오류:', error);
      
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      // 네트워크 오류인지 확인
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '네트워크 연결을 확인해주세요. 백엔드 서버가 실행 중인지 확인하세요.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      } else {
        errorMessage = String(error);
      }
      
      toast.error(`카카오페이 결제 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

  // 카카오페이 결제 성공 처리
  const handleKakaoPaySuccess = (result) => {
    // 카카오페이 결제 성공
    toast.success('카카오페이 결제가 완료되었습니다!');
    
    // 주문 내역에 저장
    saveOrderToHistory(result);
    
    // 결제 성공 후 주문 히스토리로 이동
    setTimeout(() => {
      navigate('/order-history');
      onClose(); // 모달 닫기
    }, 2000);
    
    // 결제 성공 후 추가 처리
    if (onUpdatePaymentMethods) {
      onUpdatePaymentMethods();
    }
  };

  // 카카오페이 결제 실패 처리
  const handleKakaoPayError = (error) => {
    // 카카오페이 결제 실패
    toast.error('카카오페이 결제에 실패했습니다. 다시 시도해주세요.');
  };

  if (!isOpen) return null;

  return (
    <div className="payment-method-modal-overlay" onClick={onClose}>
      <div className="payment-method-modal" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="modal-header">
          <div className="header-content">
            <CreditCard className="header-icon" size={24} />
            <div>
              <h2>결제수단 관리</h2>
              <p>안전하고 편리한 결제를 위해 결제수단을 관리하세요</p>
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
              {/* 결제수단 목록 */}
              <div className="payment-methods-list">
                <div className="list-header">
                  <h3>등록된 결제수단</h3>
                  <button 
                    className="add-button"
                    onClick={() => setShowAddForm(true)}
                  >
                    <Plus size={16} />
                    새 결제수단 추가
                  </button>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="empty-state">
                    <CreditCard size={48} />
                    <h4>등록된 결제수단이 없습니다</h4>
                    <p>결제수단을 추가하면 더 빠르고 편리하게 주문할 수 있어요</p>
                    <button 
                      className="add-first-button"
                      onClick={() => setShowAddForm(true)}
                    >
                      첫 결제수단 추가하기
                    </button>
                  </div>
                ) : (
                  <div className="methods-grid">
                    {paymentMethods.map(method => (
                      <div key={method.id} className={`method-card ${method.isDefault ? 'default' : ''}`}>
                        {method.isDefault && (
                          <div className="default-badge">
                            <Star size={12} />
                            기본
                          </div>
                        )}

                        <div className="method-header">
                          <div className="method-type">
                            <span className="card-icon">{getCardIcon(method.cardType)}</span>
                            <div>
                              <h4>{method.nickname}</h4>
                              <p className="method-info">
                                {method.type === 'card' 
                                  ? `${method.cardType.toUpperCase()} • ${method.expiryDate}`
                                  : `${method.bankName} • ${method.accountHolder}`
                                }
                              </p>
                            </div>
                          </div>
                          
                          <div className="method-actions">
                            <button 
                              className="action-btn visibility"
                              onClick={() => toggleCardNumberVisibility(method.id)}
                              title="번호 보기/숨기기"
                            >
                              {showCardNumber[method.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button 
                              className="action-btn edit"
                              onClick={() => handleEdit(method)}
                              title="수정"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="action-btn delete"
                              onClick={() => handleDelete(method.id)}
                              title="삭제"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="method-number">
                          {showCardNumber[method.id] 
                            ? (method.type === 'card' ? method.cardNumber : `${method.bankName} ${method.accountNumber}`)
                            : method.maskedNumber
                          }
                        </div>

                        {method.type === 'card' && (
                          <div className="method-details">
                            소유자: {method.cardholderName} • 등록일: {method.createdAt}
                          </div>
                        )}

                        {!method.isDefault && (
                          <button 
                            className="set-default-btn"
                            onClick={() => handleSetDefault(method.id)}
                          >
                            기본 설정
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 보안 안내 */}
              <div className="security-notice">
                <Shield className="security-icon" size={20} />
                <div>
                  <h4>🔒 안전한 결제정보 보관</h4>
                  <ul>
                    <li>모든 결제정보는 PCI DSS 인증을 받은 안전한 서버에 암호화되어 저장됩니다</li>
                    <li>카드번호는 토큰화되어 실제 번호는 저장되지 않습니다</li>
                    <li>결제 시에만 복호화되며, 직원도 전체 번호를 볼 수 없습니다</li>
                  </ul>
                </div>
              </div>

              {/* 토스페이먼츠 테스트 결제 */}
              <div className="toss-payment-section">
                <div className="section-header">
                  <Zap className="section-icon" size={20} />
                  <h4>토스페이먼츠 테스트 결제</h4>
                </div>
                <p>토스페이먼츠 API를 사용한 테스트 결제를 진행할 수 있습니다.</p>
                
                {/* 실제 주문 금액 표시 */}
                {user?.cartTotal && (
                  <div className="actual-order-amount">
                    <strong>현재 주문 금액: {user.cartTotal.toLocaleString()}원</strong>
                  </div>
                )}
                
                <div className="test-payment-buttons">
                  <button 
                    className="test-payment-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('토스페이먼츠 1,000원 버튼 클릭');
                      handleTossPayment(1000);
                    }}
                  >
                    <Zap size={16} />
                    1,000원 테스트 결제
                  </button>
                  <button 
                    className="test-payment-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('토스페이먼츠 5,000원 버튼 클릭');
                      handleTossPayment(5000);
                    }}
                  >
                    <Zap size={16} />
                    5,000원 테스트 결제
                  </button>
                  <button 
                    className="test-payment-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('토스페이먼츠 10,000원 버튼 클릭');
                      handleTossPayment(10000);
                    }}
                  >
                    <Zap size={16} />
                    10,000원 테스트 결제
                  </button>
                  {user?.cartTotal && (
                    <button 
                      className="test-payment-btn actual-amount-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('토스페이먼츠 실제 주문 금액 버튼 클릭:', user.cartTotal);
                        handleTossPayment(user.cartTotal);
                      }}
                    >
                      <Zap size={16} />
                      실제 주문 금액 결제 ({user.cartTotal.toLocaleString()}원)
                    </button>
                  )}
                </div>
              </div>

              {/* 카카오페이 테스트 결제 */}
              <div className="kakao-payment-section">
                <div className="section-header">
                  <Smartphone className="section-icon kakao-icon" size={20} />
                  <h4>카카오페이 테스트 결제</h4>
                </div>
                <p>카카오페이 API를 사용한 테스트 결제를 진행할 수 있습니다.</p>
                
                {/* 실제 주문 금액 표시 */}
                {user?.cartTotal && (
                  <div className="actual-order-amount">
                    <strong>현재 주문 금액: {user.cartTotal.toLocaleString()}원</strong>
                  </div>
                )}
                
                <div className="test-payment-buttons">
                  <button 
                    className="test-payment-btn kakao-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('카카오페이 1,000원 버튼 클릭');
                      handleKakaoPay(1000);
                    }}
                  >
                    <Smartphone size={16} />
                    1,000원 카카오페이 결제
                  </button>
                  <button 
                    className="test-payment-btn kakao-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('카카오페이 5,000원 버튼 클릭');
                      handleKakaoPay(5000);
                    }}
                  >
                    <Smartphone size={16} />
                    5,000원 카카오페이 결제
                  </button>
                  <button 
                    className="test-payment-btn kakao-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('카카오페이 10,000원 버튼 클릭');
                      handleKakaoPay(10000);
                    }}
                  >
                    <Smartphone size={16} />
                    10,000원 카카오페이 결제
                  </button>
                  {user?.cartTotal && (
                    <button 
                      className="test-payment-btn kakao-btn actual-amount-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('카카오페이 실제 주문 금액 버튼 클릭:', user.cartTotal);
                        handleKakaoPay(user.cartTotal);
                      }}
                    >
                      <Smartphone size={16} />
                      실제 주문 금액 결제 ({user.cartTotal.toLocaleString()}원)
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* 결제수단 추가/수정 폼 */
            <div className="payment-form">
              <div className="form-header">
                <h3>{editingMethod ? '결제수단 수정' : '새 결제수단 추가'}</h3>
                <button 
                  className="back-button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMethod(null);
                    resetForm();
                  }}
                >
                  목록으로
                </button>
              </div>

              <form onSubmit={handleSubmit} className="add-form">
                {/* 결제수단 타입 선택 */}
                <div className="type-selection">
                  <label className={`type-option ${formData.type === 'card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value="card"
                      checked={formData.type === 'card'}
                      onChange={handleInputChange}
                    />
                    <div className="option-content">
                      <CreditCard size={20} />
                      <span>신용/체크카드</span>
                    </div>
                  </label>
                  
                  <label className={`type-option ${formData.type === 'account' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="type"
                      value="account"
                      checked={formData.type === 'account'}
                      onChange={handleInputChange}
                    />
                    <div className="option-content">
                      <span>🏦</span>
                      <span>계좌이체</span>
                    </div>
                  </label>
                </div>

                {/* 카드 정보 입력 */}
                {formData.type === 'card' && (
                  <>
                    <div className="form-row">
                      <div className="input-group">
                        <label htmlFor="cardNumber">카드번호 *</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234-5678-9012-3456"
                          className={formErrors.cardNumber ? 'error' : ''}
                          maxLength="19"
                        />
                        {formErrors.cardNumber && (
                          <span className="error-message">{formErrors.cardNumber}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-group half">
                        <label htmlFor="expiryDate">유효기간 *</label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className={formErrors.expiryDate ? 'error' : ''}
                          maxLength="5"
                        />
                        {formErrors.expiryDate && (
                          <span className="error-message">{formErrors.expiryDate}</span>
                        )}
                      </div>
                      
                      <div className="input-group half">
                        <label htmlFor="cardholderName">카드 소유자명 *</label>
                        <input
                          type="text"
                          id="cardholderName"
                          name="cardholderName"
                          value={formData.cardholderName}
                          onChange={handleInputChange}
                          placeholder="홍길동"
                          className={formErrors.cardholderName ? 'error' : ''}
                        />
                        {formErrors.cardholderName && (
                          <span className="error-message">{formErrors.cardholderName}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* 계좌 정보 입력 */}
                {formData.type === 'account' && (
                  <>
                    <div className="form-row">
                      <div className="input-group">
                        <label htmlFor="bankName">은행명 *</label>
                        <select
                          id="bankName"
                          name="bankName"
                          value={formData.bankName}
                          onChange={handleInputChange}
                          className={formErrors.bankName ? 'error' : ''}
                        >
                          <option value="">은행을 선택하세요</option>
                          {getBankList().map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                        </select>
                        {formErrors.bankName && (
                          <span className="error-message">{formErrors.bankName}</span>
                        )}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="input-group half">
                        <label htmlFor="accountNumber">계좌번호 *</label>
                        <input
                          type="text"
                          id="accountNumber"
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleInputChange}
                          placeholder="123456789012"
                          className={formErrors.accountNumber ? 'error' : ''}
                        />
                        {formErrors.accountNumber && (
                          <span className="error-message">{formErrors.accountNumber}</span>
                        )}
                      </div>
                      
                      <div className="input-group half">
                        <label htmlFor="accountHolder">예금주명 *</label>
                        <input
                          type="text"
                          id="accountHolder"
                          name="accountHolder"
                          value={formData.accountHolder}
                          onChange={handleInputChange}
                          placeholder="홍길동"
                          className={formErrors.accountHolder ? 'error' : ''}
                        />
                        {formErrors.accountHolder && (
                          <span className="error-message">{formErrors.accountHolder}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* 공통 정보 */}
                <div className="form-row">
                  <div className="input-group">
                    <label htmlFor="nickname">별칭 *</label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleInputChange}
                      placeholder="예: 주 결제카드, 비상용 카드"
                      className={formErrors.nickname ? 'error' : ''}
                    />
                    {formErrors.nickname && (
                      <span className="error-message">{formErrors.nickname}</span>
                    )}
                  </div>
                </div>

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
                    기본 결제수단으로 설정
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingMethod(null);
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
                    {loading ? '처리중...' : (editingMethod ? '수정하기' : '추가하기')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* 결제 모달 */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h3>
                {paymentType === 'toss' ? '토스페이먼츠 결제' : '카카오페이 결제'}
              </h3>
              <button 
                className="close-btn"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="payment-modal-content">
              {paymentData && (
                <div className="payment-info">
                  <div className="payment-summary">
                    <h4>결제 정보</h4>
                    <div className="info-row">
                      <span>주문번호:</span>
                      <span>{paymentData.orderId || paymentData.partner_order_id}</span>
                    </div>
                    <div className="info-row">
                      <span>상품명:</span>
                      <span>{paymentData.orderName || paymentData.item_name}</span>
                    </div>
                    <div className="info-row">
                      <span>결제금액:</span>
                      <span>{paymentData.amount || paymentData.total_amount}원</span>
                    </div>
                  </div>
                  
                  <div className="payment-actions">
                    <button 
                      className="payment-btn toss-btn"
                      onClick={() => {
                        const url = paymentType === 'toss' 
                          ? paymentData.checkoutUrl 
                          : paymentData.next_redirect_pc_url;
                        window.open(url, '_blank', 'width=800,height=700');
                      }}
                    >
                      {paymentType === 'toss' ? '토스페이먼츠로 결제하기' : '카카오페이로 결제하기'}
                    </button>
                    
                    <button 
                      className="payment-btn cancel-btn"
                      onClick={() => setShowPaymentModal(false)}
                    >
                      취소
                    </button>
                  </div>
                  
                  <div className="payment-note">
                    <p>
                      결제 버튼을 클릭하면 새 창에서 결제창이 열립니다.
                      결제 완료 후 이 창을 닫아주세요.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PaymentModal 추가 - Order 페이지와 동일한 결제 모달 */}
      {showPaymentModal && paymentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPaymentData(null);
            setPaymentType(null);
          }}
          orderData={{
            orderId: paymentData.order_id || paymentData.payment_id,
            totalAmount: paymentData.amount,
            items: [{ name: '커비 상품', price: paymentData.amount, quantity: 1 }],
            userInfo: {
              name: user?.name || '고객',
              email: user?.email || 'customer@example.com',
              id: user?.id || 'user_001'
            }
          }}
          selectedMethod={paymentType}
          onPaymentSuccess={(result) => {
            console.log('결제 성공:', result);
            toast.success('결제가 완료되었습니다!');
            setShowPaymentModal(false);
            setPaymentData(null);
            setPaymentType(null);
            // 주문 내역 페이지로 이동
            setTimeout(() => {
              navigate('/order-history');
            }, 1000);
          }}
          onPaymentError={(error) => {
            console.error('결제 오류:', error);
            toast.error(`결제 중 오류가 발생했습니다: ${error}`);
            setShowPaymentModal(false);
            setPaymentData(null);
            setPaymentType(null);
          }}
        />
      )}

    </div>
  );
};

export default PaymentMethodModal;
