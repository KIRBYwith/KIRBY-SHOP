import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0
  });

  // 사용자 관리 상태
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // 상품 관리 상태
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 주문 관리 상태
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 문의 관리 상태
  const [inquiries, setInquiries] = useState([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState('all');

  // 쿠폰 관리 상태
  const [coupons, setCoupons] = useState([]);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilter, setCouponFilter] = useState('all');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: null,
    usage_limit: null,
    user_limit: 1,
    valid_from: '',
    valid_until: ''
  });

  useEffect(() => {
    // 관리자 세션 확인
    const checkAdminSession = () => {
      try {
        const adminSession = JSON.parse(localStorage.getItem('kirby-shop-admin-session') || '{}');
        const isAdminLoggedIn = adminSession.isAdmin === true && 
                               adminSession.username === 'admin' &&
                               adminSession.role === 'admin';
        
        setIsAdmin(isAdminLoggedIn);
        
        if (!isAdminLoggedIn) {
          // 관리자 세션이 없으면 로그인 페이지로 리다이렉트
          window.location.href = '/admin';
          return;
        }
      } catch (error) {
        console.error('Admin session check failed:', error);
        setIsAdmin(false);
        window.location.href = '/admin';
      }
    };

    checkAdminSession();
    if (isAdmin) {
      loadDashboardData();
    }
  }, []);

  const loadDashboardData = () => {
    try {
      // 통계 데이터 로드
      const orders = JSON.parse(localStorage.getItem('kirby-shop-orders') || '[]');
      const products = JSON.parse(localStorage.getItem('kirby-shop-products') || '[]');
      const users = JSON.parse(localStorage.getItem('kirby-shop-users') || '[]');
      const inquiries = JSON.parse(localStorage.getItem('kirby-shop-inquiries') || '[]');
      
      // 더 많은 실제 데이터 생성
      const mockUsers = [
        { id: 1, name: '김커비', email: 'kirby@example.com', role: 'user', createdAt: '2024-01-15', blocked: false },
        { id: 2, name: '이스타', email: 'star@example.com', role: 'user', createdAt: '2024-02-20', blocked: false },
        { id: 3, name: '박드림', email: 'dream@example.com', role: 'seller', createdAt: '2024-03-10', blocked: false },
        { id: 4, name: '최랜드', email: 'land@example.com', role: 'user', createdAt: '2024-04-05', blocked: false },
        { id: 5, name: '정메타', email: 'meta@example.com', role: 'manager', createdAt: '2024-05-12', blocked: false },
        { id: 6, name: '한나이트', email: 'knight@example.com', role: 'user', createdAt: '2024-06-18', blocked: true },
        { id: 7, name: '서스타', email: 'star2@example.com', role: 'user', createdAt: '2024-07-22', blocked: false },
        { id: 8, name: '강커비', email: 'kirby2@example.com', role: 'seller', createdAt: '2024-08-30', blocked: false },
        { id: 9, name: '윤드림', email: 'dream2@example.com', role: 'user', createdAt: '2024-09-15', blocked: false },
        { id: 10, name: '임랜드', email: 'land2@example.com', role: 'user', createdAt: '2024-10-08', blocked: false },
        { id: 11, name: '조메타', email: 'meta2@example.com', role: 'user', createdAt: '2024-11-25', blocked: false },
        { id: 12, name: '백나이트', email: 'knight2@example.com', role: 'user', createdAt: '2024-12-01', blocked: false }
      ];

      const mockProducts = [
        { id: 1, name: '커비 인형 (대형)', price: 25000, category: '인형', stock: 15, views: 1250, sales: 89, status: 'active', image: '/kirby_images/kirby_001.jpg' },
        { id: 2, name: '커비 후드티', price: 35000, category: '의류', stock: 8, views: 980, sales: 67, status: 'active', image: '/kirby_images/kirby_002.jpg' },
        { id: 3, name: '커비 램프', price: 45000, category: '액세서리', stock: 0, views: 2100, sales: 45, status: 'out-of-stock', image: '/kirby_images/kirby_003.jpg' },
        { id: 4, name: '커비 티셔츠', price: 20000, category: '의류', stock: 25, views: 750, sales: 123, status: 'active', image: '/kirby_images/kirby_004.jpg' },
        { id: 5, name: '커비 시계', price: 55000, category: '액세서리', stock: 12, views: 1800, sales: 34, status: 'active', image: '/kirby_images/kirby_005.jpg' },
        { id: 6, name: '커비 키링', price: 8000, category: '액세서리', stock: 50, views: 3200, sales: 256, status: 'active', image: '/kirby_images/kirby_006.jpg' },
        { id: 7, name: '커비 머그컵', price: 15000, category: '생활용품', stock: 30, views: 1100, sales: 78, status: 'active', image: '/kirby_images/kirby_007.jpg' },
        { id: 8, name: '커비 스티커팩', price: 5000, category: '액세서리', stock: 100, views: 4500, sales: 189, status: 'active', image: '/kirby_images/kirby_008.jpg' },
        { id: 9, name: '커비 가방', price: 40000, category: '액세서리', stock: 5, views: 890, sales: 23, status: 'active', image: '/kirby_images/kirby_009.png' },
        { id: 10, name: '커비 퍼즐', price: 18000, category: '게임', stock: 20, views: 650, sales: 45, status: 'active', image: '/kirby_images/kirby_010.jpg' }
      ];

      const mockOrders = [
        { id: 1001, userName: '김커비', totalAmount: 25000, status: 'pending', createdAt: '2024-12-15 14:30', items: [{ name: '커비 인형 (대형)', quantity: 1 }] },
        { id: 1002, userName: '이스타', totalAmount: 35000, status: 'processing', createdAt: '2024-12-15 13:45', items: [{ name: '커비 후드티', quantity: 1 }] },
        { id: 1003, userName: '박드림', totalAmount: 45000, status: 'shipped', createdAt: '2024-12-15 12:20', items: [{ name: '커비 램프', quantity: 1 }] },
        { id: 1004, userName: '최랜드', totalAmount: 20000, status: 'delivered', createdAt: '2024-12-15 11:15', items: [{ name: '커비 티셔츠', quantity: 1 }] },
        { id: 1005, userName: '정메타', totalAmount: 55000, status: 'pending', createdAt: '2024-12-15 10:30', items: [{ name: '커비 시계', quantity: 1 }] },
        { id: 1006, userName: '한나이트', totalAmount: 8000, status: 'cancelled', createdAt: '2024-12-15 09:45', items: [{ name: '커비 키링', quantity: 1 }] },
        { id: 1007, userName: '서스타', totalAmount: 15000, status: 'processing', createdAt: '2024-12-15 08:20', items: [{ name: '커비 머그컵', quantity: 1 }] },
        { id: 1008, userName: '강커비', totalAmount: 5000, status: 'shipped', createdAt: '2024-12-15 07:15', items: [{ name: '커비 스티커팩', quantity: 1 }] },
        { id: 1009, userName: '윤드림', totalAmount: 40000, status: 'delivered', createdAt: '2024-12-14 16:30', items: [{ name: '커비 가방', quantity: 1 }] },
        { id: 1010, userName: '임랜드', totalAmount: 18000, status: 'pending', createdAt: '2024-12-14 15:45', items: [{ name: '커비 퍼즐', quantity: 1 }] },
        { id: 1011, userName: '조메타', totalAmount: 60000, status: 'processing', createdAt: '2024-12-14 14:20', items: [{ name: '커비 인형 (대형)', quantity: 2 }] },
        { id: 1012, userName: '백나이트', totalAmount: 25000, status: 'shipped', createdAt: '2024-12-14 13:15', items: [{ name: '커비 후드티', quantity: 1 }] }
      ];

      const mockInquiries = [
        { id: 2001, title: '배송 문의', content: '언제 배송되나요?', userName: '김커비', category: '배송', status: 'pending', createdAt: '2024-12-15 14:30' },
        { id: 2002, title: '상품 문의', content: '사이즈가 어떻게 되나요?', userName: '이스타', category: '상품', status: 'answered', createdAt: '2024-12-15 13:45' },
        { id: 2003, title: '환불 문의', content: '환불이 가능한가요?', userName: '박드림', category: '환불', status: 'pending', createdAt: '2024-12-15 12:20' },
        { id: 2004, title: '교환 문의', content: '다른 색상으로 교환하고 싶어요', userName: '최랜드', category: '교환', status: 'answered', createdAt: '2024-12-15 11:15' },
        { id: 2005, title: '쿠폰 문의', content: '쿠폰이 적용되지 않아요', userName: '정메타', category: '쿠폰', status: 'pending', createdAt: '2024-12-15 10:30' },
        { id: 2006, title: '회원가입 문의', content: '회원가입이 안되요', userName: '한나이트', category: '계정', status: 'closed', createdAt: '2024-12-15 09:45' },
        { id: 2007, title: '결제 문의', content: '결제가 안되요', userName: '서스타', category: '결제', status: 'pending', createdAt: '2024-12-15 08:20' },
        { id: 2008, title: '상품 문의', content: '재고가 언제 들어오나요?', userName: '강커비', category: '상품', status: 'answered', createdAt: '2024-12-15 07:15' }
      ];

      const mockCoupons = [
        { id: 1, code: 'WELCOME20', name: '신규회원 20% 할인쿠폰', description: '신규회원 가입 축하! 전 상품 20% 할인', discount_type: 'percentage', discount_value: 20, min_order_amount: 10000, max_discount_amount: 50000, usage_limit: 100, usage_count: 45, user_limit: 1, is_active: true, valid_from: '2024-01-01', valid_until: '2025-12-31', created_at: '2024-01-01' },
        { id: 2, code: 'FREESHIP', name: '무료배송 쿠폰', description: '배송비 무료! 언제든지 사용 가능', discount_type: 'fixed_amount', discount_value: 3000, min_order_amount: 20000, max_discount_amount: 3000, usage_limit: 500, usage_count: 123, user_limit: 10, is_active: true, valid_from: '2024-01-01', valid_until: '2025-12-31', created_at: '2024-01-01' },
        { id: 3, code: 'FIXED5000', name: '5천원 할인쿠폰', description: '5만원 이상 구매시 5천원 할인', discount_type: 'fixed_amount', discount_value: 5000, min_order_amount: 50000, max_discount_amount: 5000, usage_limit: 200, usage_count: 67, user_limit: 3, is_active: true, valid_from: '2024-01-01', valid_until: '2024-12-31', created_at: '2024-01-01' },
        { id: 4, code: 'PLUSH30', name: '인형 카테고리 30% 할인', description: '커비 인형 카테고리 상품 30% 할인', discount_type: 'percentage', discount_value: 30, min_order_amount: 15000, max_discount_amount: 30000, usage_limit: 50, usage_count: 23, user_limit: 2, is_active: true, valid_from: '2024-01-01', valid_until: '2024-12-31', created_at: '2024-01-01' },
        { id: 5, code: 'BIRTHDAY50', name: '생일축하 50% 할인', description: '생일축하합니다! 특별한 하루를 위한 할인', discount_type: 'percentage', discount_value: 50, min_order_amount: 30000, max_discount_amount: 100000, usage_limit: 20, usage_count: 8, user_limit: 1, is_active: true, valid_from: '2024-01-01', valid_until: '2024-12-31', created_at: '2024-01-01' },
        { id: 6, code: 'MASTER99', name: '마스터 99% 할인', description: '특별 마스터 쿠폰 - 99% 할인', discount_type: 'percentage', discount_value: 99, min_order_amount: 0, max_discount_amount: 999999, usage_limit: 999999, usage_count: 0, user_limit: 999999, is_active: true, valid_from: '2024-01-01', valid_until: '2099-12-31', created_at: '2024-01-01' },
        { id: 7, code: 'UNLIMITED', name: '무제한 쿠폰', description: '무제한 사용 가능한 특별 쿠폰', discount_type: 'percentage', discount_value: 50, min_order_amount: 0, max_discount_amount: 999999, usage_limit: 999999, usage_count: 0, user_limit: 999999, is_active: true, valid_from: '2024-01-01', valid_until: '2099-12-31', created_at: '2024-01-01' },
        { id: 8, code: 'EXPIRED10', name: '만료된 쿠폰', description: '이미 만료된 테스트 쿠폰', discount_type: 'percentage', discount_value: 10, min_order_amount: 0, max_discount_amount: 10000, usage_limit: 100, usage_count: 0, user_limit: 1, is_active: false, valid_from: '2023-01-01', valid_until: '2023-12-31', created_at: '2023-01-01' }
      ];
      
      const totalRevenue = mockOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const todayOrders = mockOrders.filter(order => 
        new Date(order.createdAt).toDateString() === new Date().toDateString()
      ).length;
      const pendingOrders = mockOrders.filter(order => 
        ['pending', 'processing'].includes(order.status)
      ).length;
      
      setStats({
        totalUsers: mockUsers.length,
        totalOrders: mockOrders.length,
        totalProducts: mockProducts.length,
        totalRevenue: totalRevenue,
        todayOrders: todayOrders,
        pendingOrders: pendingOrders
      });

      setUsers(mockUsers);
      setProducts(mockProducts);
      setOrders(mockOrders);
      setInquiries(mockInquiries);
      setCoupons(mockCoupons);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'users', label: '사용자 관리', icon: '👤' },
    { id: 'products', label: '상품 관리', icon: '📦' },
    { id: 'orders', label: '주문 관리', icon: '🧾' },
    { id: 'coupons', label: '쿠폰 관리', icon: '🎫' },
    { id: 'support', label: '고객지원', icon: '💬' },
    { id: 'analytics', label: '통계 분석', icon: '📈' },
    { id: 'settings', label: '설정', icon: '⚙️' },
    { id: 'security', label: '보안', icon: '🔐' }
  ];

  // 관리자 로그아웃
  const handleAdminLogout = () => {
    if (window.confirm('관리자에서 로그아웃하시겠습니까?')) {
      localStorage.removeItem('kirby-shop-admin-session');
      window.location.href = '/admin';
    }
  };

  const userRoles = [
    { id: 'user', name: '일반 사용자', color: '#4CAF50' },
    { id: 'seller', name: '판매자', color: '#FF9800' },
    { id: 'manager', name: '매니저', color: '#2196F3' },
    { id: 'admin', name: '관리자', color: '#F44336' }
  ];

  const orderStatuses = [
    { id: 'pending', name: '주문 대기', color: '#FFC107' },
    { id: 'processing', name: '처리 중', color: '#2196F3' },
    { id: 'shipped', name: '배송 중', color: '#9C27B0' },
    { id: 'delivered', name: '배송 완료', color: '#4CAF50' },
    { id: 'cancelled', name: '취소됨', color: '#F44336' },
    { id: 'refunded', name: '환불됨', color: '#607D8B' }
  ];

  const inquiryStatuses = [
    { id: 'pending', name: '답변 대기', color: '#FFC107' },
    { id: 'answered', name: '답변 완료', color: '#4CAF50' },
    { id: 'closed', name: '종료', color: '#607D8B' }
  ];

  // 사용자 관리 함수들
  const handleUserRoleChange = (userId, newRole) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('kirby-shop-users', JSON.stringify(updatedUsers));
  };

  const handleUserBlock = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, blocked: !u.blocked } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('kirby-shop-users', JSON.stringify(updatedUsers));
  };

  const handleUserDelete = (userId) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('kirby-shop-users', JSON.stringify(updatedUsers));
    }
  };

  // 상품 관리 함수들
  const handleProductStatusChange = (productId, newStatus) => {
    const updatedProducts = products.map(p => 
      p.id === productId ? { ...p, status: newStatus } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('kirby-shop-products', JSON.stringify(updatedProducts));
  };

  const handleProductDelete = (productId) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem('kirby-shop-products', JSON.stringify(updatedProducts));
    }
  };

  // 주문 관리 함수들
  const handleOrderStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('kirby-shop-orders', JSON.stringify(updatedOrders));
  };

  // 문의 관리 함수들
  const handleInquiryStatusChange = (inquiryId, newStatus) => {
    const updatedInquiries = inquiries.map(i => 
      i.id === inquiryId ? { ...i, status: newStatus } : i
    );
    setInquiries(updatedInquiries);
    localStorage.setItem('kirby-shop-inquiries', JSON.stringify(updatedInquiries));
  };

  // 쿠폰 관리 함수들
  const handleCouponStatusChange = (couponId, newStatus) => {
    const updatedCoupons = coupons.map(c => 
      c.id === couponId ? { ...c, is_active: newStatus === 'active' } : c
    );
    setCoupons(updatedCoupons);
    localStorage.setItem('kirby-shop-coupons', JSON.stringify(updatedCoupons));
  };

  const handleCouponDelete = (couponId) => {
    if (window.confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) {
      const updatedCoupons = coupons.filter(c => c.id !== couponId);
      setCoupons(updatedCoupons);
      localStorage.setItem('kirby-shop-coupons', JSON.stringify(updatedCoupons));
    }
  };

  const handleCreateCoupon = () => {
    setEditingCoupon(null);
    setNewCoupon({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      max_discount_amount: null,
      usage_limit: null,
      user_limit: 1,
      valid_from: '',
      valid_until: ''
    });
    setIsCouponModalOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount,
      usage_limit: coupon.usage_limit,
      user_limit: coupon.user_limit,
      valid_from: coupon.valid_from,
      valid_until: coupon.valid_until
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = () => {
    if (!newCoupon.code || !newCoupon.name) {
      alert('쿠폰 코드와 이름은 필수입니다.');
      return;
    }

    if (editingCoupon) {
      // 수정
      const updatedCoupons = coupons.map(c => 
        c.id === editingCoupon.id ? { ...c, ...newCoupon } : c
      );
      setCoupons(updatedCoupons);
      localStorage.setItem('kirby-shop-coupons', JSON.stringify(updatedCoupons));
    } else {
      // 새로 생성
      const newCouponData = {
        ...newCoupon,
        id: Date.now(),
        usage_count: 0,
        is_active: true,
        created_at: new Date().toISOString().split('T')[0]
      };
      const updatedCoupons = [...coupons, newCouponData];
      setCoupons(updatedCoupons);
      localStorage.setItem('kirby-shop-coupons', JSON.stringify(updatedCoupons));
    }

    setIsCouponModalOpen(false);
    setEditingCoupon(null);
  };

  const renderDashboard = () => (
    <div className="admin-content">
      <div className="dashboard-header">
        <h2>관리자 대시보드</h2>
        <p>커비샵 관리 현황을 한눈에 확인하세요</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>총 회원수</p>
            <span className="stat-change positive">+12 이번 주</span>
            <div className="stat-trend">
              <span className="trend-up">↗️</span>
              <span className="trend-text">+8.5%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.totalProducts.toLocaleString()}</h3>
            <p>등록 상품</p>
            <span className="stat-change positive">+5 이번 주</span>
            <div className="stat-trend">
              <span className="trend-up">↗️</span>
              <span className="trend-text">+12.3%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div className="stat-info">
            <h3>{stats.totalOrders.toLocaleString()}</h3>
            <p>총 주문수</p>
            <span className="stat-change positive">+{stats.todayOrders} 오늘</span>
            <div className="stat-trend">
              <span className="trend-up">↗️</span>
              <span className="trend-text">+25.7%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>{stats.totalRevenue.toLocaleString()}원</h3>
            <p>총 매출</p>
            <span className="stat-change positive">+15% 이번 달</span>
            <div className="stat-trend">
              <span className="trend-up">↗️</span>
              <span className="trend-text">+18.2%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>{stats.pendingOrders.toLocaleString()}</h3>
            <p>대기 주문</p>
            <span className="stat-change warning">처리 필요</span>
            <div className="stat-trend">
              <span className="trend-down">↘️</span>
              <span className="trend-text">-5.2%</span>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <h3>{inquiries.filter(i => i.status === 'pending').length}</h3>
            <p>대기 문의</p>
            <span className="stat-change warning">답변 필요</span>
            <div className="stat-trend">
              <span className="trend-up">↗️</span>
              <span className="trend-text">+3.1%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>최근 주문</h3>
          <div className="recent-orders">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="recent-order-item">
                <div className="order-info">
                  <span className="order-id">#{order.id}</span>
                  <span className="order-user">{order.userName}</span>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status}`}>
                    {orderStatuses.find(s => s.id === order.status)?.name}
                  </span>
                </div>
                <div className="order-amount">{order.totalAmount?.toLocaleString()}원</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>대기 중인 문의</h3>
          <div className="pending-inquiries">
            {inquiries.filter(i => i.status === 'pending').slice(0, 5).map(inquiry => (
              <div key={inquiry.id} className="inquiry-item">
                <div className="inquiry-info">
                  <span className="inquiry-title">{inquiry.title}</span>
                  <span className="inquiry-user">{inquiry.userName}</span>
                </div>
                <div className="inquiry-date">{inquiry.createdAt}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>인기 상품</h3>
          <div className="popular-products">
            {products.slice(0, 5).map(product => (
              <div key={product.id} className="product-item">
                <div className="product-info">
                  <span className="product-name">{product.name}</span>
                  <span className="product-category">{product.category}</span>
                </div>
                <div className="product-stats">
                  <span className="product-views">👁️ {product.views || 0}</span>
                  <span className="product-sales">💰 {product.sales || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>사용자 관리</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="사용자 검색..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체</option>
            <option value="user">일반 사용자</option>
            <option value="seller">판매자</option>
            <option value="manager">매니저</option>
            <option value="admin">관리자</option>
            <option value="blocked">차단된 사용자</option>
          </select>
        </div>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>권한</th>
              <th>가입일</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(user => {
                const matchesSearch = user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                   user.email?.toLowerCase().includes(userSearch.toLowerCase());
                const matchesFilter = userFilter === 'all' || 
                                    (userFilter === 'blocked' ? user.blocked : user.role === userFilter);
                return matchesSearch && matchesFilter;
              })
              .map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      {userRoles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>{user.createdAt}</td>
                  <td>
                    <span className={`status-badge ${user.blocked ? 'blocked' : 'active'}`}>
                      {user.blocked ? '차단됨' : '활성'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleUserBlock(user.id)}
                        className={`btn-small ${user.blocked ? 'unblock' : 'block'}`}
                      >
                        {user.blocked ? '차단 해제' : '차단'}
                      </button>
                      <button
                        onClick={() => handleUserDelete(user.id)}
                        className="btn-small delete"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>상품 관리</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="상품 검색..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="out-of-stock">품절</option>
          </select>
          <button className="btn-primary">새 상품 추가</button>
        </div>
      </div>

      <div className="products-grid">
        {products
          .filter(product => {
            const matchesSearch = product.name?.toLowerCase().includes(productSearch.toLowerCase());
            const matchesFilter = productFilter === 'all' || product.status === productFilter;
            return matchesSearch && matchesFilter;
          })
          .map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">{product.price?.toLocaleString()}원</p>
                <p className="product-category">{product.category}</p>
                <div className="product-stats">
                  <span>재고: {product.stock || 0}</span>
                  <span>조회: {product.views || 0}</span>
                </div>
                <div className="product-actions">
                  <select
                    value={product.status || 'active'}
                    onChange={(e) => handleProductStatusChange(product.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                    <option value="out-of-stock">품절</option>
                  </select>
                  <button
                    onClick={() => handleProductDelete(product.id)}
                    className="btn-small delete"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>주문 관리</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="주문 검색..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체</option>
            {orderStatuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>주문번호</th>
              <th>고객명</th>
              <th>상품</th>
              <th>금액</th>
              <th>상태</th>
              <th>주문일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {orders
              .filter(order => {
                const matchesSearch = order.id?.toString().includes(orderSearch) ||
                                   order.userName?.toLowerCase().includes(orderSearch.toLowerCase());
                const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
                return matchesSearch && matchesFilter;
              })
              .map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.userName}</td>
                  <td>
                    <div className="order-items">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <span key={index} className="order-item">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                      {order.items?.length > 2 && (
                        <span className="more-items">+{order.items.length - 2}개 더</span>
                      )}
                    </div>
                  </td>
                  <td>{order.totalAmount?.toLocaleString()}원</td>
                  <td>
                    <select
                      value={order.status || 'pending'}
                      onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                      className="status-select"
                    >
                      {orderStatuses.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>{order.createdAt}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-small">상세보기</button>
                      <button className="btn-small">송장번호</button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>쿠폰 관리</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="쿠폰 검색..."
            value={couponSearch}
            onChange={(e) => setCouponSearch(e.target.value)}
            className="search-input"
          />
          <select
            value={couponFilter}
            onChange={(e) => setCouponFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
            <option value="expired">만료됨</option>
            <option value="unlimited">무제한</option>
          </select>
          <button onClick={handleCreateCoupon} className="btn-primary">
            새 쿠폰 생성
          </button>
        </div>
      </div>

      <div className="coupons-grid">
        {coupons
          .filter(coupon => {
            const matchesSearch = coupon.code?.toLowerCase().includes(couponSearch.toLowerCase()) ||
                                coupon.name?.toLowerCase().includes(couponSearch.toLowerCase());
            
            let matchesFilter = true;
            if (couponFilter === 'active') matchesFilter = coupon.is_active;
            else if (couponFilter === 'inactive') matchesFilter = !coupon.is_active;
            else if (couponFilter === 'expired') matchesFilter = new Date(coupon.valid_until) < new Date();
            else if (couponFilter === 'unlimited') matchesFilter = coupon.usage_limit >= 999999;
            
            return matchesSearch && matchesFilter;
          })
          .map(coupon => (
            <div key={coupon.id} className="coupon-card">
              <div className="coupon-header">
                <div className="coupon-code">{coupon.code}</div>
                <div className="coupon-status">
                  <span className={`status-badge ${coupon.is_active ? 'active' : 'inactive'}`}>
                    {coupon.is_active ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
              
              <div className="coupon-info">
                <h3 className="coupon-name">{coupon.name}</h3>
                <p className="coupon-description">{coupon.description}</p>
                
                <div className="coupon-details">
                  <div className="detail-row">
                    <span className="detail-label">할인 타입:</span>
                    <span className="detail-value">
                      {coupon.discount_type === 'percentage' ? '퍼센트' : '정액'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">할인 값:</span>
                    <span className="detail-value">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : `${coupon.discount_value.toLocaleString()}원`}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">최소 주문금액:</span>
                    <span className="detail-value">{coupon.min_order_amount.toLocaleString()}원</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">사용 횟수:</span>
                    <span className="detail-value">
                      {coupon.usage_count} / {coupon.usage_limit || '무제한'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">유효기간:</span>
                    <span className="detail-value">
                      {coupon.valid_from} ~ {coupon.valid_until}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="coupon-actions">
                <button
                  onClick={() => handleEditCoupon(coupon)}
                  className="btn-small edit"
                >
                  수정
                </button>
                <select
                  value={coupon.is_active ? 'active' : 'inactive'}
                  onChange={(e) => handleCouponStatusChange(coupon.id, e.target.value)}
                  className="status-select"
                >
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
                <button
                  onClick={() => handleCouponDelete(coupon.id)}
                  className="btn-small delete"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>고객지원 관리</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="문의 검색..."
            value={inquirySearch}
            onChange={(e) => setInquirySearch(e.target.value)}
            className="search-input"
          />
          <select
            value={inquiryFilter}
            onChange={(e) => setInquiryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체</option>
            {inquiryStatuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="inquiries-list">
        {inquiries
          .filter(inquiry => {
            const matchesSearch = inquiry.title?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
                                inquiry.content?.toLowerCase().includes(inquirySearch.toLowerCase());
            const matchesFilter = inquiryFilter === 'all' || inquiry.status === inquiryFilter;
            return matchesSearch && matchesFilter;
          })
          .map(inquiry => (
            <div key={inquiry.id} className="inquiry-card">
              <div className="inquiry-header">
                <div className="inquiry-info">
                  <h3>{inquiry.title}</h3>
                  <p className="inquiry-user">{inquiry.userName} • {inquiry.category}</p>
                </div>
                <div className="inquiry-status">
                  <select
                    value={inquiry.status || 'pending'}
                    onChange={(e) => handleInquiryStatusChange(inquiry.id, e.target.value)}
                    className="status-select"
                  >
                    {inquiryStatuses.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="inquiry-content">
                <p>{inquiry.content}</p>
              </div>
              <div className="inquiry-footer">
                <span className="inquiry-date">{inquiry.createdAt}</span>
                <div className="inquiry-actions">
                  <button className="btn-small">답변하기</button>
                  <button className="btn-small">상세보기</button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>통계 분석</h2>
        <div className="header-actions">
          <select className="filter-select">
            <option value="week">이번 주</option>
            <option value="month">이번 달</option>
            <option value="quarter">이번 분기</option>
            <option value="year">올해</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>매출 통계</h3>
          <div className="chart-placeholder">
            <p>📈 매출 차트</p>
            <div className="chart-data">
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <div className="chart-bar" style={{ height: '80%' }}></div>
              <div className="chart-bar" style={{ height: '45%' }}></div>
              <div className="chart-bar" style={{ height: '90%' }}></div>
              <div className="chart-bar" style={{ height: '70%' }}></div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>사용자 통계</h3>
          <div className="chart-placeholder">
            <p>👥 사용자 차트</p>
            <div className="chart-data">
              <div className="chart-bar" style={{ height: '40%' }}></div>
              <div className="chart-bar" style={{ height: '65%' }}></div>
              <div className="chart-bar" style={{ height: '55%' }}></div>
              <div className="chart-bar" style={{ height: '75%' }}></div>
              <div className="chart-bar" style={{ height: '85%' }}></div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>인기 상품</h3>
          <div className="popular-products-list">
            {products.slice(0, 5).map((product, index) => (
              <div key={product.id} className="popular-product">
                <span className="rank">#{index + 1}</span>
                <span className="name">{product.name}</span>
                <span className="sales">{product.sales || 0}개</span>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>카테고리별 매출</h3>
          <div className="category-stats">
            <div className="category-item">
              <span className="category-name">인형</span>
              <div className="category-bar">
                <div className="bar-fill" style={{ width: '70%' }}></div>
              </div>
              <span className="category-percent">70%</span>
            </div>
            <div className="category-item">
              <span className="category-name">의류</span>
              <div className="category-bar">
                <div className="bar-fill" style={{ width: '50%' }}></div>
              </div>
              <span className="category-percent">50%</span>
            </div>
            <div className="category-item">
              <span className="category-name">액세서리</span>
              <div className="category-bar">
                <div className="bar-fill" style={{ width: '30%' }}></div>
              </div>
              <span className="category-percent">30%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>설정 및 권한</h2>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <h3>사이트 기본 설정</h3>
          <div className="setting-item">
            <label>사이트 이름</label>
            <input type="text" defaultValue="커비샵" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>사이트 설명</label>
            <textarea defaultValue="커비 굿즈 전문 쇼핑몰" className="setting-textarea"></textarea>
          </div>
          <div className="setting-item">
            <label>로고 업로드</label>
            <input type="file" accept="image/*" className="setting-file" />
          </div>
          <button className="btn-primary">저장</button>
        </div>

        <div className="settings-card">
          <h3>관리자 계정 관리</h3>
          <div className="admin-accounts">
            <div className="admin-account">
              <div className="account-info">
                <span className="account-name">admin</span>
                <span className="account-role">관리자</span>
              </div>
              <div className="account-actions">
                <button className="btn-small">수정</button>
                <button className="btn-small">권한 변경</button>
              </div>
            </div>
            <div className="admin-account">
              <div className="account-info">
                <span className="account-name">manager</span>
                <span className="account-role">매니저</span>
              </div>
              <div className="account-actions">
                <button className="btn-small">수정</button>
                <button className="btn-small">권한 변경</button>
              </div>
            </div>
          </div>
          <button className="btn-secondary">새 관리자 추가</button>
        </div>

        <div className="settings-card">
          <h3>알림 설정</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              새 주문 알림
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              문의 알림
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              재고 부족 알림
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" />
              시스템 오류 알림
            </label>
          </div>
          <button className="btn-primary">저장</button>
        </div>

        <div className="settings-card">
          <h3>이메일 설정</h3>
          <div className="setting-item">
            <label>SMTP 서버</label>
            <input type="text" defaultValue="smtp.gmail.com" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>포트</label>
            <input type="number" defaultValue="587" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>이메일 주소</label>
            <input type="email" defaultValue="admin@kirbyshop.com" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>비밀번호</label>
            <input type="password" className="setting-input" />
          </div>
          <button className="btn-primary">테스트</button>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>보안 및 로그</h2>
      </div>

      <div className="security-grid">
        <div className="security-card">
          <h3>관리자 활동 로그</h3>
          <div className="activity-log">
            <div className="log-item">
              <span className="log-time">2024-12-15 14:30</span>
              <span className="log-action">사용자 권한 변경</span>
              <span className="log-user">admin</span>
            </div>
            <div className="log-item">
              <span className="log-time">2024-12-15 13:45</span>
              <span className="log-action">상품 상태 변경</span>
              <span className="log-user">manager</span>
            </div>
            <div className="log-item">
              <span className="log-time">2024-12-15 12:20</span>
              <span className="log-action">주문 상태 변경</span>
              <span className="log-user">admin</span>
            </div>
            <div className="log-item">
              <span className="log-time">2024-12-15 11:15</span>
              <span className="log-action">문의 답변</span>
              <span className="log-user">manager</span>
            </div>
          </div>
        </div>

        <div className="security-card">
          <h3>로그인 이력</h3>
          <div className="login-log">
            <div className="log-item">
              <span className="log-time">2024-12-15 14:30</span>
              <span className="log-action">로그인 성공</span>
              <span className="log-ip">192.168.1.100</span>
            </div>
            <div className="log-item">
              <span className="log-time">2024-12-15 13:45</span>
              <span className="log-action">로그인 실패</span>
              <span className="log-ip">192.168.1.101</span>
            </div>
            <div className="log-item">
              <span className="log-time">2024-12-15 12:20</span>
              <span className="log-action">로그인 성공</span>
              <span className="log-ip">192.168.1.100</span>
            </div>
          </div>
        </div>

        <div className="security-card">
          <h3>보안 설정</h3>
          <div className="security-settings">
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                2단계 인증
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                IP 제한
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" />
                세션 타임아웃
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked />
                로그인 시도 제한
              </label>
            </div>
          </div>
          <button className="btn-primary">저장</button>
        </div>

        <div className="security-card">
          <h3>데이터 백업</h3>
          <div className="backup-actions">
            <button className="btn-primary">전체 백업</button>
            <button className="btn-secondary">사용자 데이터 백업</button>
            <button className="btn-secondary">상품 데이터 백업</button>
            <button className="btn-secondary">주문 데이터 백업</button>
          </div>
          <div className="backup-history">
            <h4>최근 백업</h4>
            <div className="backup-item">
              <span className="backup-date">2024-12-15 00:00</span>
              <span className="backup-size">2.3MB</span>
              <button className="btn-small">복원</button>
            </div>
            <div className="backup-item">
              <span className="backup-date">2024-12-14 00:00</span>
              <span className="backup-size">2.1MB</span>
              <button className="btn-small">복원</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCouponModal = () => (
    <div className="modal-overlay" onClick={() => setIsCouponModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingCoupon ? '쿠폰 수정' : '새 쿠폰 생성'}</h3>
          <button 
            className="modal-close"
            onClick={() => setIsCouponModalOpen(false)}
          >
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          <div className="form-group">
            <label>쿠폰 코드 *</label>
            <input
              type="text"
              value={newCoupon.code}
              onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
              placeholder="예: WELCOME20"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>쿠폰 이름 *</label>
            <input
              type="text"
              value={newCoupon.name}
              onChange={(e) => setNewCoupon({...newCoupon, name: e.target.value})}
              placeholder="예: 신규회원 20% 할인쿠폰"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>설명</label>
            <textarea
              value={newCoupon.description}
              onChange={(e) => setNewCoupon({...newCoupon, description: e.target.value})}
              placeholder="쿠폰에 대한 설명을 입력하세요"
              className="form-textarea"
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>할인 타입</label>
              <select
                value={newCoupon.discount_type}
                onChange={(e) => setNewCoupon({...newCoupon, discount_type: e.target.value})}
                className="form-select"
              >
                <option value="percentage">퍼센트 할인</option>
                <option value="fixed_amount">정액 할인</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>할인 값</label>
              <input
                type="number"
                value={newCoupon.discount_value}
                onChange={(e) => setNewCoupon({...newCoupon, discount_value: parseFloat(e.target.value) || 0})}
                placeholder={newCoupon.discount_type === 'percentage' ? '20' : '5000'}
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>최소 주문금액</label>
              <input
                type="number"
                value={newCoupon.min_order_amount}
                onChange={(e) => setNewCoupon({...newCoupon, min_order_amount: parseInt(e.target.value) || 0})}
                placeholder="10000"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>최대 할인금액</label>
              <input
                type="number"
                value={newCoupon.max_discount_amount || ''}
                onChange={(e) => setNewCoupon({...newCoupon, max_discount_amount: parseInt(e.target.value) || null})}
                placeholder="50000 (선택사항)"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>사용 제한</label>
              <input
                type="number"
                value={newCoupon.usage_limit || ''}
                onChange={(e) => setNewCoupon({...newCoupon, usage_limit: parseInt(e.target.value) || null})}
                placeholder="100 (선택사항)"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>사용자당 제한</label>
              <input
                type="number"
                value={newCoupon.user_limit}
                onChange={(e) => setNewCoupon({...newCoupon, user_limit: parseInt(e.target.value) || 1})}
                placeholder="1"
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>유효 시작일</label>
              <input
                type="date"
                value={newCoupon.valid_from}
                onChange={(e) => setNewCoupon({...newCoupon, valid_from: e.target.value})}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>유효 종료일</label>
              <input
                type="date"
                value={newCoupon.valid_until}
                onChange={(e) => setNewCoupon({...newCoupon, valid_until: e.target.value})}
                className="form-input"
              />
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn-secondary"
            onClick={() => setIsCouponModalOpen(false)}
          >
            취소
          </button>
          <button 
            className="btn-primary"
            onClick={handleSaveCoupon}
          >
            {editingCoupon ? '수정' : '생성'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'products': return renderProducts();
      case 'orders': return renderOrders();
      case 'coupons': return renderCoupons();
      case 'support': return renderSupport();
      case 'analytics': return renderAnalytics();
      case 'settings': return renderSettings();
      case 'security': return renderSecurity();
      default: return renderDashboard();
    }
  };

  if (!isAdmin) {
    return (
      <div className="page-container admin-page">
        <div className="access-denied">
          <div className="access-denied-icon">🔒</div>
          <h2>관리자 인증이 필요합니다</h2>
          <p>관리자 페이지에 접근하려면 로그인이 필요합니다.</p>
          <button onClick={() => window.location.href = '/admin'} className="btn-primary">
            관리자 로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container admin-page">
      <Header />
      <div className="page-content">
        <main className="admin-main">
          <div className="admin-header">
            <div className="header-content">
              <div className="header-info">
                <h1 className="page-title">관리자 페이지</h1>
                <p className="page-subtitle">커비샵 관리 시스템</p>
              </div>
              <div className="header-actions">
                <button onClick={handleAdminLogout} className="logout-button">
                  <span className="logout-icon">🚪</span>
                  관리자 로그아웃
                </button>
              </div>
            </div>
          </div>
          
          <div className="admin-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
          
          <div className="admin-body">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* 쿠폰 생성/수정 모달 */}
      {isCouponModalOpen && renderCouponModal()}
      
      <Footer />
    </div>
  );
};

export default AdminPage;
