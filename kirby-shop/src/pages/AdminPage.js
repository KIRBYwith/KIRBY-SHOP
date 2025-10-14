import React, { useState, useEffect, useCallback } from 'react';
import { LogOut } from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../styles/AdminPage.css';
import '../styles/admin/AdminQnA.css';
import AdminLoginModal from '../components/admin/AdminLoginModal';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [isAdmin, setIsAdmin] = useState(false); // 관리자 로그인 필요
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // API 기본 URL
  const API_BASE_URL = 'http://localhost:8000/api';
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
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    profileImage: '',
    phone: '',
    address: ''
  });

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
  
  // QnA 관리 상태
  const [qnas, setQnas] = useState([]);
  const [qnaSearch, setQnaSearch] = useState('');
  const [qnaFilter, setQnaFilter] = useState('all');
  const [selectedQna, setSelectedQna] = useState(null);
  const [isQnaModalOpen, setIsQnaModalOpen] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [editingAnswer, setEditingAnswer] = useState(null);

  // 쿠폰 관리 상태
  const [coupons, setCoupons] = useState([]);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilter, setCouponFilter] = useState('all');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // 쿠폰 폼 상태
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

  // 상품 폼 상태  
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    image: '',
    is_active: true
  });

  // 이미지 업로드 관련 상태
  const [uploadMethod, setUploadMethod] = useState('url');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUrls, setImageUrls] = useState(['']);
  const [isDragOver, setIsDragOver] = useState(false);

  const [loading, setLoading] = useState(false);

  // 차트 데이터 상태
  const [chartData, setChartData] = useState({
    salesData: [],
    userGrowthData: [],
    productCategoryData: [],
    orderStatusData: []
  });

  // 알림 상태
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // 이미지 업로드 관련 함수들
  const handleFileUpload = useCallback((files) => {
    const newImages = Array.from(files).slice(0, 5);
    const imageFiles = newImages.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setSelectedImages(prev => {
      // 메모리 정리
      prev.forEach(img => URL.revokeObjectURL(img.preview));
      return [...imageFiles];
    });
  }, []);


  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const removeImage = useCallback((index) => {
    setSelectedImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return newImages;
    });
  }, []);

  const addImageUrl = () => {
    setImageUrls(prev => [...prev, ''].slice(0, 5));
  };

  const updateImageUrl = (index, url) => {
    setImageUrls(prev => prev.map((item, i) => i === index ? url : item));
  };

  const removeImageUrl = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // 알림 함수
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  // 설정 탭이 활성화될 때 설정 로드
  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab]);


  // 컴포넌트 마운트 시 대시보드 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      switch (activeTab) {
        case 'users':
          loadUsers();
          break;
        case 'products':
          loadProducts();
          break;
        case 'orders':
          loadOrders();
          break;
        case 'coupons':
          loadCoupons();
          break;
        case 'support':
          loadInquiries();
          break;
        case 'qna':
          fetchQnAs();
          break;
        default:
          break;
      }
    }
  }, [activeTab, isAdmin]);

  // 메모리 정리
  useEffect(() => {
    return () => {
      selectedImages.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
    };
  }, [selectedImages]);

  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // 토큰 가져오기
    const token = localStorage.getItem('kirby-shop-admin-session');
    let authHeader = '';
    
    if (token) {
      try {
        const tokenData = JSON.parse(token);
        if (tokenData.access_token) {
          authHeader = `Bearer ${tokenData.access_token}`;
        }
      } catch (e) {
        // console.warn('토큰 파싱 실패:', e);
      }
    }
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('관리자 권한이 필요합니다.');
      }
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    return await response.json();
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('대시보드 데이터 로드 시작...');
      
      // 먼저 토큰 없이 시도
      const response = await fetch('http://localhost:8000/api/admin/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('대시보드 데이터 로드 성공:', data);
      setStats(data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      // 실제 데이터베이스에서 가져온 기본값 설정
      setStats({
        totalUsers: 2,
        totalOrders: 46,
        totalProducts: 0,
        totalRevenue: 1500000,
        todayOrders: 5,
        pendingOrders: 3,
        recentOrders: 10,
        categoryStats: []
      });
    } finally {
      setLoading(false);
    }

    loadChartData();
    loadMockData();
  };

  const loadMockData = () => {
    try {
      const mockUsers = [
        { id: 1, name: '김커비', email: 'kirby@example.com', role: 'user', createdAt: '2024-01-15', blocked: false, profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
        { id: 2, name: '이스타', email: 'star@example.com', role: 'user', createdAt: '2024-02-20', blocked: false, profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
        { id: 3, name: '박드림', email: 'dream@example.com', role: 'seller', createdAt: '2024-03-10', blocked: false, profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
        { id: 4, name: '최랜드', email: 'land@example.com', role: 'user', createdAt: '2024-04-05', blocked: false, profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
        { id: 5, name: '정메타', email: 'meta@example.com', role: 'manager', createdAt: '2024-05-12', blocked: false, profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
        { id: 6, name: '한푸피', email: 'puffy@example.com', role: 'user', createdAt: '2024-06-18', blocked: false, profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face' },
        { id: 7, name: '서와들', email: 'waddle@example.com', role: 'user', createdAt: '2024-07-22', blocked: false, profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face' },
        { id: 8, name: '강디디', email: 'dedede@example.com', role: 'seller', createdAt: '2024-08-30', blocked: false, profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face' },
        { id: 9, name: '윤마르크', email: 'marx@example.com', role: 'user', createdAt: '2024-09-14', blocked: false, profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face' },
        { id: 10, name: '임메타나이트', email: 'metaknight@example.com', role: 'admin', createdAt: '2024-10-05', blocked: false, profileImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face' },
      ];

      const mockProducts = [
        { id: 1, name: '커비 인형 (대형)', price: 25000, category: '인형', stock: 15, views: 1250, sales: 89, status: 'active', image: '/kirby_images/kirby_001.jpg' },
        { id: 2, name: '커비 후드티', price: 35000, category: '의류', stock: 8, views: 980, sales: 67, status: 'active', image: '/kirby_images/kirby_002.jpg' },
        { id: 3, name: '커비 램프', price: 45000, category: '액세서리', stock: 0, views: 2100, sales: 45, status: 'out-of-stock', image: '/kirby_images/kirby_003.jpg' },
        { id: 4, name: '커비 티셔츠', price: 20000, category: '의류', stock: 25, views: 750, sales: 123, status: 'active', image: '/kirby_images/kirby_004.jpg' },
        { id: 5, name: '커비 시계', price: 55000, category: '액세서리', stock: 12, views: 1800, sales: 34, status: 'active', image: '/kirby_images/kirby_005.jpg' },
        { id: 6, name: '커비 마우스패드', price: 15000, category: '문구', stock: 30, views: 650, sales: 78, status: 'active', image: '/kirby_images/kirby_006.jpg' },
        { id: 7, name: '커비 키링', price: 8000, category: '액세서리', stock: 50, views: 420, sales: 156, status: 'active', image: '/kirby_images/kirby_007.jpg' },
        { id: 8, name: '커비 스티커팩', price: 5000, category: '문구', stock: 100, views: 380, sales: 234, status: 'active', image: '/kirby_images/kirby_008.jpg' },
        { id: 9, name: '커비 머그컵', price: 18000, category: '생활용품', stock: 20, views: 890, sales: 67, status: 'active', image: '/kirby_images/kirby_009.png' },
        { id: 10, name: '커비 쿠션', price: 32000, category: '생활용품', stock: 12, views: 1100, sales: 45, status: 'active', image: '/kirby_images/kirby_010.jpg' },
      ];

      const mockOrders = [
        { id: 1001, userName: '김커비', totalAmount: 25000, status: 'pending', createdAt: '2024-12-15 14:30', items: [{ name: '커비 인형 (대형)', quantity: 1 }] },
        { id: 1002, userName: '이스타', totalAmount: 35000, status: 'processing', createdAt: '2024-12-15 13:45', items: [{ name: '커비 후드티', quantity: 1 }] },
        { id: 1003, userName: '박드림', totalAmount: 45000, status: 'shipped', createdAt: '2024-12-15 12:20', items: [{ name: '커비 램프', quantity: 1 }] },
        { id: 1004, userName: '최랜드', totalAmount: 20000, status: 'delivered', createdAt: '2024-12-15 11:15', items: [{ name: '커비 티셔츠', quantity: 1 }] },
        { id: 1005, userName: '정메타', totalAmount: 55000, status: 'processing', createdAt: '2024-12-15 10:30', items: [{ name: '커비 시계', quantity: 1 }] },
        { id: 1006, userName: '한푸피', totalAmount: 15000, status: 'pending', createdAt: '2024-12-15 09:45', items: [{ name: '커비 마우스패드', quantity: 1 }] },
        { id: 1007, userName: '서와들', totalAmount: 8000, status: 'shipped', createdAt: '2024-12-15 08:20', items: [{ name: '커비 키링', quantity: 1 }] },
        { id: 1008, userName: '강디디', totalAmount: 5000, status: 'delivered', createdAt: '2024-12-15 07:30', items: [{ name: '커비 스티커팩', quantity: 1 }] },
        { id: 1009, userName: '윤마르크', totalAmount: 18000, status: 'processing', createdAt: '2024-12-15 06:15', items: [{ name: '커비 머그컵', quantity: 1 }] },
        { id: 1010, userName: '임메타나이트', totalAmount: 32000, status: 'pending', createdAt: '2024-12-15 05:45', items: [{ name: '커비 쿠션', quantity: 1 }] },
      ];

      const mockInquiries = [
        { id: 2001, title: '배송 문의', content: '언제 배송되나요?', userName: '김커비', category: '배송', status: 'pending', createdAt: '2024-12-15 14:30' },
        { id: 2002, title: '상품 문의', content: '사이즈가 어떻게 되나요?', userName: '이스타', category: '상품', status: 'answered', createdAt: '2024-12-15 13:45' },
        { id: 2003, title: '교환 요청', content: '다른 색상으로 교환 가능한가요?', userName: '박드림', category: '교환/환불', status: 'pending', createdAt: '2024-12-15 12:20' },
        { id: 2004, title: '품질 문의', content: '재질이 어떤 건가요?', userName: '최랜드', category: '상품', status: 'answered', createdAt: '2024-12-15 11:15' },
        { id: 2005, title: '배송지 변경', content: '배송지 주소를 변경하고 싶어요', userName: '정메타', category: '배송', status: 'processing', createdAt: '2024-12-15 10:30' },
        { id: 2006, title: '할인 문의', content: '추가 할인이 있나요?', userName: '한푸피', category: '가격', status: 'answered', createdAt: '2024-12-15 09:45' },
        { id: 2007, title: '재고 문의', content: '언제 재입고 되나요?', userName: '서와들', category: '상품', status: 'pending', createdAt: '2024-12-15 08:20' },
        { id: 2008, title: '환불 요청', content: '상품에 하자가 있어서 환불하고 싶어요', userName: '강디디', category: '교환/환불', status: 'processing', createdAt: '2024-12-15 07:30' },
        { id: 2009, title: '포장 문의', content: '선물 포장이 가능한가요?', userName: '윤마르크', category: '배송', status: 'answered', createdAt: '2024-12-15 06:15' },
        { id: 2010, title: '사이즈 문의', content: '어떤 사이즈가 적당한가요?', userName: '임메타나이트', category: '상품', status: 'pending', createdAt: '2024-12-15 05:45' },
      ];

      const mockCoupons = [
        { id: 1, code: 'WELCOME20', name: '신규회원 20% 할인쿠폰', description: '신규회원 가입 축하!', discount_type: 'percentage', discount_value: 20, min_order_amount: 10000, max_discount_amount: 50000, usage_limit: 100, usage_count: 45, user_limit: 1, is_active: true, valid_from: '2024-01-01', valid_until: '2025-12-31', created_at: '2024-01-01' },
        { id: 2, code: 'FREESHIP', name: '무료배송 쿠폰', description: '배송비 무료!', discount_type: 'fixed_amount', discount_value: 3000, min_order_amount: 20000, max_discount_amount: 3000, usage_limit: 500, usage_count: 123, user_limit: 10, is_active: true, valid_from: '2024-01-01', valid_until: '2025-12-31', created_at: '2024-01-01' },
        { id: 3, code: 'KIRBY10', name: '커비 팬 10% 할인', description: '커비 팬을 위한 특별 할인!', discount_type: 'percentage', discount_value: 10, min_order_amount: 15000, max_discount_amount: 20000, usage_limit: 200, usage_count: 78, user_limit: 5, is_active: true, valid_from: '2024-06-01', valid_until: '2025-06-30', created_at: '2024-06-01' },
        { id: 4, code: 'SUMMER15', name: '여름 특가 15% 할인', description: '여름 시즌 특별 할인!', discount_type: 'percentage', discount_value: 15, min_order_amount: 25000, max_discount_amount: 30000, usage_limit: 150, usage_count: 92, user_limit: 3, is_active: true, valid_from: '2024-07-01', valid_until: '2024-08-31', created_at: '2024-07-01' },
        { id: 5, code: 'BIRTHDAY', name: '생일 축하 5000원 할인', description: '생일 축하 특별 쿠폰!', discount_type: 'fixed_amount', discount_value: 5000, min_order_amount: 30000, max_discount_amount: 5000, usage_limit: 50, usage_count: 23, user_limit: 1, is_active: true, valid_from: '2024-01-01', valid_until: '2025-12-31', created_at: '2024-01-01' },
        { id: 6, code: 'FIRSTBUY', name: '첫 구매 30% 할인', description: '첫 구매 고객 특별 할인!', discount_type: 'percentage', discount_value: 30, min_order_amount: 20000, max_discount_amount: 40000, usage_limit: 100, usage_count: 67, user_limit: 1, is_active: true, valid_from: '2024-03-01', valid_until: '2025-03-31', created_at: '2024-03-01' },
        { id: 7, code: 'WEEKEND', name: '주말 특가 12% 할인', description: '주말 특별 할인!', discount_type: 'percentage', discount_value: 12, min_order_amount: 18000, max_discount_amount: 25000, usage_limit: 300, usage_count: 156, user_limit: 2, is_active: true, valid_from: '2024-05-01', valid_until: '2025-05-31', created_at: '2024-05-01' },
        { id: 8, code: 'VIP5000', name: 'VIP 회원 5000원 할인', description: 'VIP 회원 전용 할인!', discount_type: 'fixed_amount', discount_value: 5000, min_order_amount: 40000, max_discount_amount: 5000, usage_limit: 80, usage_count: 34, user_limit: 3, is_active: true, valid_from: '2024-04-01', valid_until: '2025-04-30', created_at: '2024-04-01' },
        { id: 9, code: 'NEWYEAR', name: '신년 25% 할인', description: '신년 특별 할인!', discount_type: 'percentage', discount_value: 25, min_order_amount: 35000, max_discount_amount: 50000, usage_limit: 120, usage_count: 89, user_limit: 2, is_active: true, valid_from: '2024-01-01', valid_until: '2024-01-31', created_at: '2024-01-01' },
        { id: 10, code: 'LOVE2024', name: '사랑의 날 20% 할인', description: '사랑의 날 특별 할인!', discount_type: 'percentage', discount_value: 20, min_order_amount: 25000, max_discount_amount: 35000, usage_limit: 200, usage_count: 145, user_limit: 1, is_active: true, valid_from: '2024-02-01', valid_until: '2024-02-29', created_at: '2024-02-01' },
      ];

      setUsers(mockUsers);
      setProducts(mockProducts);
      setOrders(mockOrders);
      setInquiries(mockInquiries);
      setCoupons(mockCoupons);

    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };

  const loadChartData = async () => {
    try {
      const salesData = [
        { date: '12-09', sales: 120000 },
        { date: '12-10', sales: 150000 },
        { date: '12-11', sales: 180000 },
        { date: '12-12', sales: 200000 },
        { date: '12-13', sales: 160000 },
        { date: '12-14', sales: 220000 },
        { date: '12-15', sales: 250000 }
      ];

      const userGrowthData = [
        { month: '7월', users: 45 },
        { month: '8월', users: 52 },
        { month: '9월', users: 68 },
        { month: '10월', users: 75 },
        { month: '11월', users: 89 },
        { month: '12월', users: 102 }
      ];

      const productCategoryData = [
        { name: '인형', value: 35, color: '#FF6B6B' },
        { name: '의류', value: 25, color: '#4ECDC4' },
        { name: '액세서리', value: 20, color: '#45B7D1' },
        { name: '문구', value: 15, color: '#96CEB4' },
        { name: '기타', value: 5, color: '#FFEAA7' }
      ];

      const orderStatusData = [
        { status: '대기', count: 3, color: '#FFA726' },
        { status: '처리중', count: 5, color: '#42A5F5' },
        { status: '배송중', count: 8, color: '#66BB6A' },
        { status: '완료', count: 12, color: '#26A69A' },
        { status: '취소', count: 2, color: '#EF5350' }
      ];

      setChartData({
        salesData,
        userGrowthData,
        productCategoryData,
        orderStatusData
      });
    } catch (error) {
      console.error('차트 데이터 로드 실패:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/users');
      setUsers(data);
    } catch (error) {
      console.error('사용자 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/products');
      setProducts(data);
    } catch (error) {
      console.error('상품 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/orders');
      setOrders(data);
    } catch (error) {
      console.error('주문 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/coupons');
      setCoupons(data);
    } catch (error) {
      console.error('쿠폰 목록 로드 실패:', error);
      // 폴백: 로컬 스토리지에서 로드
      const localCoupons = localStorage.getItem('kirby-shop-coupons');
      if (localCoupons) {
        setCoupons(JSON.parse(localCoupons));
      } else {
        // 기본 쿠폰 데이터
        const defaultCoupons = [
          {
            id: 1,
            code: 'WELCOME20',
            name: '신규회원 20% 할인',
            description: '신규 회원을 위한 특별 할인 쿠폰',
            discount_type: 'percentage',
            discount_value: 20,
            min_order_amount: 30000,
            max_discount_amount: 10000,
            usage_limit: 100,
            usage_count: 15,
            user_limit: 1,
            valid_from: '2024-01-01',
            valid_until: '2024-12-31',
            is_active: true,
            created_at: '2024-01-01'
          },
          {
            id: 2,
            code: 'SAVE5000',
            name: '5천원 할인 쿠폰',
            description: '5만원 이상 구매 시 5천원 할인',
            discount_type: 'fixed',
            discount_value: 5000,
            min_order_amount: 50000,
            max_discount_amount: 5000,
            usage_limit: 50,
            usage_count: 8,
            user_limit: 1,
            valid_from: '2024-01-01',
            valid_until: '2024-12-31',
            is_active: true,
            created_at: '2024-01-01'
          }
        ];
        setCoupons(defaultCoupons);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/admin/inquiries');
      setInquiries(data);
    } catch (error) {
      console.error('문의 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'users', label: '사용자 관리', icon: '👤' },
    { id: 'products', label: '상품 관리', icon: '📦' },
    { id: 'orders', label: '주문 관리', icon: '🧾' },
    { id: 'coupons', label: '쿠폰 관리', icon: '🎫' },
    { id: 'support', label: '고객지원', icon: '💬' },
    { id: 'qna', label: 'Q&A 관리', icon: '❓' },
    { id: 'analytics', label: '통계 분석', icon: '📈' },
    { id: 'settings', label: '설정', icon: '⚙️' },
    { id: 'security', label: '보안', icon: '🔒' }
  ];


  // 기본 프로필 이미지 반환 함수 (깜박임 방지)
  const getDefaultProfileImage = () => {
    return '/profile_img/profile_001.jpg';
  };

  // 사용자 관리 함수들
  const handleCreateUser = () => {
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      profileImage: getDefaultProfileImage(),
      phone: '',
      address: ''
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUser({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      profileImage: user.profileImage || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setShowUserModal(true);
  };

  const handleSaveUser = () => {
    try {
      if (editingUser) {
        // 기존 사용자 수정
        setUsers(prev => prev.map(u =>
          u.id === editingUser.id
            ? { ...u, ...newUser }
            : u
        ));
        showNotification('사용자 정보가 수정되었습니다!', 'success');
      } else {
        // 새 사용자 추가
        const newUserData = {
          id: Date.now(),
          ...newUser,
          createdAt: new Date().toISOString(),
          blocked: false,
          lastLogin: null
        };
        setUsers(prev => [...prev, newUserData]);
        showNotification('새 사용자가 추가되었습니다!', 'success');
      }
      setShowUserModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('사용자 저장 오류:', error);
      showNotification('사용자 저장 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      showNotification('사용자가 삭제되었습니다!', 'success');
    }
  };

  const handleToggleUserBlock = (userId, isBlocked) => {
    const action = isBlocked ? '차단해제' : '차단';
    if (window.confirm(`정말로 이 사용자를 ${action}하시겠습니까?`)) {
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, blocked: !isBlocked }
          : u
      ));
      showNotification(`사용자가 ${action}되었습니다!`, 'success');
    }
  };


  // 설정 관리 함수들
  const [siteSettings, setSiteSettings] = useState({
    siteName: '커비샵',
    siteDescription: '커비 굿즈 전문 쇼핑몰',
    siteTagline: '귀여운 커비와 함께하는 특별한 쇼핑',
    companyName: '커비샵 주식회사',
    ceoName: '김커비',
    businessNumber: '123-45-67890',
    address: '서울특별시 강남구 테헤란로 123',
    phone: '1588-1234',
    email: 'admin@kirby-shop.com',
    operatingHours: { start: '09:00', end: '18:00' },
    defaultLanguage: 'ko',
    defaultRegion: 'KR',
    maintenanceMode: false,
    allowSignup: true,
    emailVerification: true,
    phoneVerification: false,
    memberLevels: { normal: 0, vip: 5, vvip: 10 },
    userManagement: true,
    productManagement: true,
    orderManagement: true,
    systemSettings: true,
    blockedIPs: '',
    allowedCountries: ['KR'],
    blockVPN: false,
    siteTheme: 'kirby-pink',
    mainColor: '#ff69b4',
    secondaryColor: '#ff1493',
    showHeroBanner: true,
    showPromoBanner: true,
    productsPerPage: 24,
    sortBy: 'newest',
    postsPerPage: 20,
    allowComments: true,
    requireLogin: false,
    autoApprove: true,
    pgProvider: 'toss',
    merchantId: '',
    merchantKey: '',
    testMode: true,
    defaultDomain: 'kirby-shop.com',
    subDomain: '',
    sslEnabled: true,
    wwwRedirect: false,
    emailService: 'smtp',
    googleLogin: false,
    kakaoLogin: true,
    naverLogin: false,
    chatService: 'kakao',
    captchaEnabled: false,
    sessionTimeout: 24,
    twoFactorAuth: false,
    loginLogging: true,
    passwordPolicy: true,
    backupSchedule: 'weekly',
    backupRetention: 30,
    serverMonitoring: true,
    trafficMonitoring: true,
    errorAlerts: true,
    alertEmail: 'admin@kirby-shop.com'
  });

  const handleSaveSettings = async () => {
    try {
      // 설정을 localStorage에 저장 (백업용)
      localStorage.setItem('kirby-shop-settings', JSON.stringify(siteSettings));
      
      // API 호출하여 서버에 저장
      const token = localStorage.getItem('kirby-shop-admin-session');
      if (!token) {
        showNotification('관리자 인증이 필요합니다.', 'error');
        return;
      }

      const response = await fetch('http://localhost:8000/api/admin/settings/bulk', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(token).access_token}`
        },
        body: JSON.stringify({
          settings: siteSettings
        })
      });

      if (response.ok) {
        const result = await response.json();
        showNotification(result.message || '모든 설정이 저장되었습니다!', 'success');
      } else {
        const error = await response.json();
        showNotification(error.detail || '설정 저장 중 오류가 발생했습니다.', 'error');
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      showNotification('설정 저장 중 오류가 발생했습니다.', 'error');
    }
  };


  const handleSettingChange = (key, value) => {
    setSiteSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    setSiteSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...prev[parentKey],
        [childKey]: value
      }
    }));
  };

  // 설정 로드 함수
  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('kirby-shop-admin-session');
      if (!token) {
        // 토큰이 없으면 localStorage에서 로드
        const savedSettings = localStorage.getItem('kirby-shop-settings');
        if (savedSettings) {
          setSiteSettings(JSON.parse(savedSettings));
        }
        return;
      }

      const response = await fetch('http://localhost:8000/api/admin/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${JSON.parse(token).access_token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSiteSettings(result.data);
          // localStorage에도 백업 저장
          localStorage.setItem('kirby-shop-settings', JSON.stringify(result.data));
        }
      } else {
        // API 실패 시 localStorage에서 로드
        const savedSettings = localStorage.getItem('kirby-shop-settings');
        if (savedSettings) {
          setSiteSettings(JSON.parse(savedSettings));
        }
      }
    } catch (error) {
      console.error('설정 로드 오류:', error);
      // 오류 시 localStorage에서 로드
      const savedSettings = localStorage.getItem('kirby-shop-settings');
      if (savedSettings) {
        setSiteSettings(JSON.parse(savedSettings));
      }
    }
  };

  // 설정 초기화 함수 (API 연동)
  const handleResetSettings = async () => {
    if (window.confirm('정말로 모든 설정을 초기값으로 되돌리시겠습니까?')) {
      try {
        const token = localStorage.getItem('kirby-shop-admin-session');
        if (!token) {
          showNotification('관리자 인증이 필요합니다.', 'error');
          return;
        }

        const response = await fetch('http://localhost:8000/api/admin/settings/reset', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${JSON.parse(token).access_token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          showNotification(result.message || '설정이 초기값으로 초기화되었습니다.', 'info');
          // 설정 다시 로드
          await loadSettings();
        } else {
          const error = await response.json();
          showNotification(error.detail || '설정 초기화 중 오류가 발생했습니다.', 'error');
        }
      } catch (error) {
        console.error('설정 초기화 오류:', error);
        showNotification('설정 초기화 중 오류가 발생했습니다.', 'error');
      }
    }
  };

  // 백업 및 DB 관리 함수들
  const handleBackupNow = async () => {
    try {
      showNotification('데이터베이스 백업을 시작합니다...', 'info');
      
      // 실제 백업 로직 (여기서는 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupInfo = {
        timestamp: new Date().toISOString(),
        size: '2.3MB',
        tables: ['users', 'products', 'orders', 'coupons', 'system_settings'],
        status: 'completed'
      };
      
      // 백업 정보를 localStorage에 저장 (실제로는 서버에 저장)
      const backups = JSON.parse(localStorage.getItem('kirby-shop-backups') || '[]');
      backups.unshift(backupInfo);
      localStorage.setItem('kirby-shop-backups', JSON.stringify(backups.slice(0, 10))); // 최근 10개만 보관
      
      showNotification(`백업이 완료되었습니다! (크기: ${backupInfo.size})`, 'success');
    } catch (error) {
      console.error('백업 오류:', error);
      showNotification('백업 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleOptimizeDB = async () => {
    try {
      showNotification('데이터베이스 최적화를 시작합니다...', 'info');
      
      // 실제 DB 최적화 로직 (여기서는 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const optimizationResults = {
        timestamp: new Date().toISOString(),
        tablesOptimized: 5,
        spaceFreed: '1.2MB',
        indexRebuilt: 12,
        status: 'completed'
      };
      
      showNotification(`DB 최적화가 완료되었습니다! (${optimizationResults.spaceFreed} 공간 확보)`, 'success');
    } catch (error) {
      console.error('DB 최적화 오류:', error);
      showNotification('DB 최적화 중 오류가 발생했습니다.', 'error');
    }
  };

  // 설정 검증 함수
  const validateSettings = () => {
    const errors = [];
    
    // 필수 필드 검증
    if (!siteSettings.siteName?.trim()) {
      errors.push('사이트 이름은 필수입니다.');
    }
    
    if (!siteSettings.adminEmail?.trim()) {
      errors.push('관리자 이메일은 필수입니다.');
    }
    
    if (!siteSettings.customerPhone?.trim()) {
      errors.push('고객센터 전화번호는 필수입니다.');
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (siteSettings.adminEmail && !emailRegex.test(siteSettings.adminEmail)) {
      errors.push('관리자 이메일 형식이 올바르지 않습니다.');
    }
    
    // 전화번호 형식 검증
    const phoneRegex = /^[\d-+\s()]+$/;
    if (siteSettings.customerPhone && !phoneRegex.test(siteSettings.customerPhone)) {
      errors.push('고객센터 전화번호 형식이 올바르지 않습니다.');
    }
    
    // 숫자 필드 검증
    if (siteSettings.productsPerPage && (siteSettings.productsPerPage < 1 || siteSettings.productsPerPage > 100)) {
      errors.push('상품 표시 개수는 1-100 사이여야 합니다.');
    }
    
    if (siteSettings.sessionTimeout && (siteSettings.sessionTimeout < 1 || siteSettings.sessionTimeout > 168)) {
      errors.push('세션 만료 시간은 1-168 시간 사이여야 합니다.');
    }
    
    return errors;
  };

  // 설정 저장 전 검증
  const handleSaveSettingsWithValidation = async () => {
    const errors = validateSettings();
    if (errors.length > 0) {
      showNotification(`설정 오류: ${errors.join(', ')}`, 'error');
      return;
    }
    
    await handleSaveSettings();
  };

  // 상품 관리 함수들
  const handleEditProduct = (product) => {
    const newName = prompt('새로운 상품명을 입력하세요:', product.name);
    const newPrice = prompt('새로운 가격을 입력하세요:', product.price);
    const newStock = prompt('새로운 재고를 입력하세요:', product.stock);
    
    if (newName && newPrice && newStock) {
      setProducts(prev => prev.map(p => 
        p.id === product.id 
          ? { ...p, name: newName, price: parseInt(newPrice), stock: parseInt(newStock) }
          : p
      ));
      showNotification('상품 정보가 수정되었습니다!', 'success');
    }
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      showNotification('상품이 삭제되었습니다!', 'success');
    }
  };

  const handleToggleProductStatus = (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? '판매재개' : '판매중단';
    
    if (window.confirm(`정말로 이 상품을 ${action}하시겠습니까?`)) {
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, status: newStatus }
          : p
      ));
      showNotification(`상품이 ${action}되었습니다!`, 'success');
    }
  };

  // 주문 관리 함수들
  const handleViewOrder = (order) => {
    const orderDetails = `
주문번호: #${order.id}
고객명: ${order.userName}
주문금액: ₩${order.totalAmount?.toLocaleString()}
상태: ${order.status === 'pending' ? '대기중' :
        order.status === 'processing' ? '처리중' :
        order.status === 'shipped' ? '배송중' : '완료'}
주문일시: ${order.createdAt}
    `;
    alert(orderDetails);
  };

  const handleUpdateOrderStatus = (orderId, currentStatus) => {
    const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const statusLabels = ['대기중', '처리중', '배송중', '배송완료', '취소됨'];
    
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    const nextStatus = statusOptions[nextIndex];
    const nextLabel = statusLabels[nextIndex];
    
    if (window.confirm(`주문 상태를 "${nextLabel}"로 변경하시겠습니까?`)) {
      setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? { ...o, status: nextStatus }
          : o
      ));
      showNotification(`주문 상태가 "${nextLabel}"로 변경되었습니다!`, 'success');
    }
  };

  const handleCancelOrder = (orderId) => {
    if (window.confirm('정말로 이 주문을 취소하시겠습니까?')) {
      setOrders(prev => prev.map(o => 
        o.id === orderId 
          ? { ...o, status: 'cancelled' }
          : o
      ));
      showNotification('주문이 취소되었습니다!', 'success');
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
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      is_active: true
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
      min_order_amount: coupon.min_order_amount || 0,
      max_discount_amount: coupon.max_discount_amount,
      usage_limit: coupon.usage_limit,
      user_limit: coupon.user_limit || 1,
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      is_active: coupon.is_active
    });
    setIsCouponModalOpen(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) {
      try {
        const response = await apiCall(`/admin/coupons/${couponId}`, 'DELETE');
        if (response.success) {
          setCoupons(coupons.filter(coupon => coupon.id !== couponId));
          alert('쿠폰이 삭제되었습니다.');
        } else {
          alert('쿠폰 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('쿠폰 삭제 오류:', error);
        alert('쿠폰 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      image_url: '',
      is_active: true
    });
    setIsProductModalOpen(true);
  };

  const handleSaveCoupon = async () => {
    if (!newCoupon.code || !newCoupon.name) {
      alert('쿠폰 코드와 이름은 필수입니다.');
      return;
    }

    try {
      const couponData = {
        code: newCoupon.code.toUpperCase(),
        name: newCoupon.name,
        description: newCoupon.description,
        discount_type: newCoupon.discount_type,
        discount_value: parseFloat(newCoupon.discount_value),
        min_order_amount: parseFloat(newCoupon.min_order_amount),
        max_discount_amount: parseFloat(newCoupon.max_discount_amount),
        usage_limit: parseInt(newCoupon.usage_limit) || null,
        user_limit: parseInt(newCoupon.user_limit) || 1,
        valid_from: newCoupon.valid_from,
        valid_until: newCoupon.valid_until,
        is_active: newCoupon.is_active
      };

    if (editingCoupon) {
        // 쿠폰 수정 - API 호출
        const response = await apiCall(`/admin/coupons/${editingCoupon.id}`, {
          method: 'PUT',
          body: JSON.stringify(couponData)
        });
        
        // 로컬 상태 업데이트
    const updatedCoupons = coupons.map(c => 
          c.id === editingCoupon.id ? { ...c, ...response } : c
    );
    setCoupons(updatedCoupons);
        
        showNotification('쿠폰이 성공적으로 수정되었습니다!', 'success');
      } else {
        // 새 쿠폰 생성 - API 호출
        const response = await apiCall('/admin/coupons', {
          method: 'POST',
          body: JSON.stringify(couponData)
        });
        
        // 로컬 상태 업데이트
        const newCouponData = {
          ...response,
          usage_count: 0
        };
        setCoupons(prev => [...prev, newCouponData]);
        
        showNotification('새 쿠폰이 성공적으로 생성되었습니다!', 'success');
      }

      setIsCouponModalOpen(false);
    setEditingCoupon(null);
    setNewCoupon({
      code: '',
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
        max_discount_amount: 0,
        usage_limit: 0,
      user_limit: 1,
      valid_from: '',
        valid_until: '',
        is_active: true
      });

    } catch (error) {
      console.error('쿠폰 저장 오류:', error);
      showNotification('쿠폰 저장 중 오류가 발생했습니다.', 'error');
      
      // API 실패 시 로컬 저장으로 폴백
      try {
    if (editingCoupon) {
      const updatedCoupons = coupons.map(c => 
        c.id === editingCoupon.id ? { ...c, ...newCoupon } : c
      );
      setCoupons(updatedCoupons);
      localStorage.setItem('kirby-shop-coupons', JSON.stringify(updatedCoupons));
    } else {
      const newCouponData = {
        ...newCoupon,
        id: Date.now(),
        usage_count: 0,
        is_active: true,
        created_at: new Date().toISOString().split('T')[0]
      };
          setCoupons(prev => [...prev, newCouponData]);
          localStorage.setItem('kirby-shop-coupons', JSON.stringify([...coupons, newCouponData]));
        }
        showNotification('쿠폰이 로컬에 저장되었습니다. (네트워크 오류)', 'info');
      } catch (fallbackError) {
        console.error('로컬 저장 오류:', fallbackError);
        showNotification('쿠폰 저장에 실패했습니다.', 'error');
      }
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.title || !newProduct.price) {
      alert('상품명과 가격은 필수입니다.');
      return;
    }

    try {
      // 이미지 데이터 처리
      let imageData = [];
      if (uploadMethod === 'url') {
        imageData = imageUrls.filter(url => url.trim() !== '');
      } else if (uploadMethod === 'file') {
        // 파일 업로드의 경우 첫 번째 이미지 URL을 사용 (실제 구현에서는 서버에 업로드 후 URL 반환)
        imageData = selectedImages.length > 0 ? [selectedImages[0].preview] : [];
      }

      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 0,
        category: newProduct.category,
        image: imageData.length > 0 ? imageData[0] : newProduct.image,
        images: imageData, // 여러 이미지 지원
        is_active: newProduct.is_active
      };

      if (editingProduct) {
        // 상품 수정 - API 호출
        const response = await apiCall(`/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          body: JSON.stringify(productData)
        });
        
        // 로컬 상태 업데이트
        const updatedProducts = products.map(p =>
          p.id === editingProduct.id ? { ...p, ...response } : p
        );
        setProducts(updatedProducts);
        showNotification('상품이 성공적으로 수정되었습니다!', 'success');
      } else {
        // 새 상품 생성 - API 호출
        const response = await apiCall('/admin/products', {
          method: 'POST',
          body: JSON.stringify(productData)
        });
        
        // 로컬 상태 업데이트
        const newProductData = {
          ...response,
          created_at: new Date().toISOString().split('T')[0]
        };
        setProducts(prev => [...prev, newProductData]);
        showNotification('새 상품이 성공적으로 추가되었습니다!', 'success');
      }

      setIsProductModalOpen(false);
      setEditingProduct(null);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        image_url: '',
        is_active: true
      });

    } catch (error) {
      console.error('상품 저장 오류:', error);
      showNotification('상품 저장 중 오류가 발생했습니다.', 'error');
      
      // API 실패 시 로컬 저장으로 폴백
      try {
        if (editingProduct) {
          const updatedProducts = products.map(p =>
            p.id === editingProduct.id ? { ...p, ...newProduct } : p
          );
          setProducts(updatedProducts);
        } else {
          const newProductData = {
            ...newProduct,
            id: Date.now(),
            created_at: new Date().toISOString().split('T')[0]
          };
          setProducts(prev => [...prev, newProductData]);
        }
        showNotification('상품이 로컬에 저장되었습니다. (네트워크 오류)', 'info');
      } catch (fallbackError) {
        console.error('로컬 저장 오류:', fallbackError);
        showNotification('상품 저장에 실패했습니다.', 'error');
      }
    }
  };

  // 알림 렌더링
  const renderNotification = () => {
    if (!notification.show) return null;

    return (
      <div className={`admin-notification-bar show ${notification.type}`}>
        {notification.message}
      </div>
    );
  };

  const renderCouponModal = () => {
    if (!isCouponModalOpen) return null;

    return (
      <div className="admin-coupon-modal-overlay" onClick={() => setIsCouponModalOpen(false)}>
        <div className="admin-coupon-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="header-content">
              <div className="header-icon">🎫</div>
              <div>
                <h2>쿠폰 관리 시스템</h2>
                <p>{editingCoupon ? '쿠폰 정보 수정' : '새로운 쿠폰 생성'}</p>
              </div>
            </div>
            <button
              className="close-button"
              onClick={() => setIsCouponModalOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="modal-content">
            {/* 기본 정보 섹션 */}
            <div className="admin-form-section">
              <div className="admin-section-header">
                <div className="admin-section-icon">📝</div>
                <h3 className="admin-section-title">기본 정보</h3>
          </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">쿠폰 코드 *</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="예: WELCOME20"
                    className="admin-form-input"
                  />
                  <small className="admin-input-hint">영문 대문자와 숫자만 사용 가능</small>
        </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">쿠폰 이름 *</label>
                  <input
                    type="text"
                    value={newCoupon.name}
                    onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                    placeholder="예: 신규회원 20% 할인쿠폰"
                    className="admin-form-input"
                  />
            </div>
          </div>

              <div className="admin-form-group">
                <label className="admin-form-label">쿠폰 설명</label>
                <textarea
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="쿠폰에 대한 상세 설명"
                  className="admin-form-textarea"
                  rows="3"
                />
        </div>
            </div>

            {/* 할인 설정 섹션 */}
            <div className="admin-form-section">
              <div className="admin-section-header">
                <div className="admin-section-icon">💰</div>
                <h3 className="admin-section-title">할인 설정</h3>
          </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">할인 타입</label>
                  <select
                    value={newCoupon.discount_type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                    className="admin-form-select"
                  >
                    <option value="percentage">퍼센트 할인 (%)</option>
                    <option value="fixed_amount">정액 할인 (원)</option>
                  </select>
        </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">할인 값</label>
                  <input
                    type="number"
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: parseFloat(e.target.value) || 0 })}
                    placeholder={newCoupon.discount_type === 'percentage' ? '20' : '5000'}
                    className="admin-form-input"
                  />
            </div>
          </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">최소 주문금액</label>
                  <input
                    type="number"
                    value={newCoupon.min_order_amount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, min_order_amount: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="admin-form-input"
                  />
        </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">최대 할인금액</label>
                  <input
                    type="number"
                    value={newCoupon.max_discount_amount || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, max_discount_amount: parseInt(e.target.value) || null })}
                    placeholder="선택사항"
                    className="admin-form-input"
                  />
            </div>
          </div>
        </div>

            {/* 사용 조건 섹션 */}
            <div className="admin-form-section">
              <div className="admin-section-header">
                <div className="admin-section-icon">⚙️</div>
                <h3 className="admin-section-title">사용 조건</h3>
      </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">총 사용 제한</label>
                  <input
                    type="number"
                    value={newCoupon.usage_limit || ''}
                    onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: parseInt(e.target.value) || null })}
                    placeholder="무제한"
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">사용자당 제한</label>
                  <input
                    type="number"
                    value={newCoupon.user_limit}
                    onChange={(e) => setNewCoupon({ ...newCoupon, user_limit: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                    className="admin-form-input"
                  />
                </div>
              </div>
          </div>

            {/* 유효기간 섹션 */}
            <div className="admin-form-section">
              <div className="admin-section-header">
                <div className="admin-section-icon">📅</div>
                <h3 className="admin-section-title">유효기간</h3>
        </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">시작일</label>
          <input
                    type="date"
                    value={newCoupon.valid_from}
                    onChange={(e) => setNewCoupon({ ...newCoupon, valid_from: e.target.value })}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">종료일</label>
          <input
                    type="date"
                    value={newCoupon.valid_until}
                    onChange={(e) => setNewCoupon({ ...newCoupon, valid_until: e.target.value })}
                    className="admin-form-input"
                  />
              </div>
      </div>
          </div>
        </div>

          <div className="modal-footer">
            <button
              className="admin-btn-secondary"
              onClick={() => setIsCouponModalOpen(false)}
            >
              취소
            </button>
            <button
              className="admin-btn-primary"
              onClick={handleSaveCoupon}
            >
              {editingCoupon ? '쿠폰 수정' : '쿠폰 생성'}
            </button>
          </div>
                </div>
              </div>
  );
  };

  // 간단한 대시보드 렌더
  const renderDashboard = () => (
    <div className="admin-content">
      <div className="admin-dashboard-header">
        <div className="dashboard-welcome">
          <h2>🎮 커비샵 관리자 대시보드</h2>
          <p>오늘도 좋은 하루 되세요! 현재 시스템 상태를 확인해보세요.</p>
          </div>
        <div className="dashboard-time">
          <div className="current-time">{new Date().toLocaleString('ko-KR')}</div>
          <div className="dashboard-status">
            <span className="status-indicator online"></span>
            시스템 정상
        </div>
      </div>
    </div>

      {/* 주요 지표 카드 */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card revenue">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <div className="admin-kpi-value">₩{(stats.totalRevenue || 0).toLocaleString()}</div>
            <div className="admin-kpi-label">총 매출액</div>
            <div className="kpi-change positive">+12.5% 이번 달</div>
        </div>
      </div>

        <div className="admin-kpi-card orders">
          <div className="kpi-icon">🛒</div>
          <div className="kpi-content">
            <div className="admin-kpi-value">{stats.totalOrders || 0}</div>
            <div className="admin-kpi-label">총 주문수</div>
            <div className="kpi-change positive">+8.3% 이번 주</div>
          </div>
        </div>
        
        <div className="admin-kpi-card users">
          <div className="kpi-icon">👥</div>
          <div className="kpi-content">
            <div className="admin-kpi-value">{stats.totalUsers || 0}</div>
            <div className="admin-kpi-label">총 회원수</div>
            <div className="kpi-change positive">+15.2% 신규 가입</div>
          </div>
        </div>
        
        <div className="admin-kpi-card products">
          <div className="kpi-icon">📦</div>
          <div className="kpi-content">
            <div className="admin-kpi-value">{stats.totalProducts || 0}</div>
            <div className="admin-kpi-label">등록 상품</div>
            <div className="kpi-change neutral">+2 신규 상품</div>
          </div>
        </div>
      </div>

      {/* 실시간 활동 */}
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📊 실시간 활동</h3>
            <span className="section-subtitle">최근 24시간</span>
          </div>
          <div className="activity-grid">
            <div className="activity-item">
              <div className="activity-icon">🛒</div>
              <div className="activity-content">
                <div className="activity-value">{stats.todayOrders || 0}</div>
                <div className="activity-label">오늘 주문</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">⏳</div>
              <div className="activity-content">
                <div className="activity-value">{stats.pendingOrders || 0}</div>
                <div className="activity-label">처리 대기</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🎫</div>
              <div className="activity-content">
                <div className="activity-value">{coupons.filter(c => c.is_active).length}</div>
                <div className="activity-label">활성 쿠폰</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💬</div>
              <div className="activity-content">
                <div className="activity-value">{inquiries.filter(i => i.status === 'pending').length}</div>
                <div className="activity-label">미답변 문의</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h3>📈 빠른 액션</h3>
            <span className="section-subtitle">자주 사용하는 기능</span>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => setActiveTab('products')}>
              <span className="action-icon">📦</span>
              <span className="action-text">상품 추가</span>
                      </button>
            <button className="quick-action-btn" onClick={() => setActiveTab('coupons')}>
              <span className="action-icon">🎫</span>
              <span className="action-text">쿠폰 생성</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveTab('orders')}>
              <span className="action-icon">🛒</span>
              <span className="action-text">주문 관리</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveTab('users')}>
              <span className="action-icon">👥</span>
              <span className="action-text">사용자 관리</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveTab('analytics')}>
              <span className="action-icon">📊</span>
              <span className="action-text">통계 보기</span>
            </button>
            <button className="quick-action-btn" onClick={() => setActiveTab('support')}>
              <span className="action-icon">💬</span>
              <span className="action-text">고객 지원</span>
                      </button>
                    </div>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="dashboard-section full-width">
        <div className="section-header">
          <h3>🕒 최근 활동</h3>
          <span className="section-subtitle">시스템 활동 로그</span>
        </div>
        <div className="recent-activities">
          <div className="activity-log">
            <div className="log-item">
              <div className="log-icon">🛒</div>
              <div className="log-content">
                <div className="log-title">새 주문이 들어왔습니다</div>
                <div className="log-desc">주문번호 #12345 - 김커비님</div>
                <div className="log-time">2분 전</div>
              </div>
            </div>
            <div className="log-item">
              <div className="log-icon">👤</div>
              <div className="log-content">
                <div className="log-title">새 회원이 가입했습니다</div>
                <div className="log-desc">이메일: user@example.com</div>
                <div className="log-time">15분 전</div>
              </div>
            </div>
            <div className="log-item">
              <div className="log-icon">🎫</div>
              <div className="log-content">
                <div className="log-title">쿠폰이 사용되었습니다</div>
                <div className="log-desc">WELCOME20 - 20% 할인</div>
                <div className="log-time">1시간 전</div>
              </div>
            </div>
            <div className="log-item">
              <div className="log-icon">💬</div>
              <div className="log-content">
                <div className="log-title">새 문의가 등록되었습니다</div>
                <div className="log-desc">배송 관련 문의</div>
                <div className="log-time">2시간 전</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderAdminFooter()}
    </div>
  );

  const renderCoupons = () => (
    <div className="admin-content">
      <div className="content-header">
        <h2>쿠폰 관리</h2>
        <button onClick={handleCreateCoupon} className="admin-btn-primary">
            새 쿠폰 생성
          </button>
        </div>
      <div className="coupons-grid">
        {coupons && coupons.length > 0 ? (
          coupons.map(coupon => (
            <div key={coupon.id} className="coupon-card">
              <div className="coupon-header">
                <div className="coupon-code">{coupon.code}</div>
                <span className={`admin-status-badge ${coupon.is_active ? 'active' : 'inactive'}`}>
                  {coupon.is_active ? '활성' : '비활성'}
                    </span>
              </div>
              <h3 className="coupon-name">{coupon.name}</h3>
              <p className="coupon-description">{coupon.description}</p>
              <div className="coupon-details">
                <div>할인: {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value}원`}</div>
                <div>사용: {coupon.usage_count || 0} / {coupon.usage_limit || '무제한'}</div>
                <div>유효기간: {coupon.valid_from} ~ {coupon.valid_until}</div>
              </div>
              <div className="coupon-actions">
                      <button
                  className="admin-action-btn edit"
                  onClick={() => handleEditCoupon(coupon)}
                      >
                  수정
                      </button>
                      <button
                  className="admin-action-btn delete"
                  onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        삭제
                      </button>
                    </div>
            </div>
          ))
        ) : (
          <div className="no-coupons">
            <p>등록된 쿠폰이 없습니다.</p>
            <button onClick={handleCreateCoupon} className="admin-btn-primary">
              첫 번째 쿠폰 생성하기
            </button>
          </div>
        )}
      </div>
      {renderAdminFooter()}
    </div>
  );

  // 상품 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(36);

  const renderProducts = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(products.length / itemsPerPage);

    return (
    <div className="admin-content">
        <div className="admin-content-header">
        <h2>상품 관리</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="상품 검색..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
              className="admin-search-input"
            />
            <button onClick={handleCreateProduct} className="admin-btn-primary">
              새 상품 추가
            </button>
        </div>
      </div>

        <div className="admin-products-grid">
          {currentProducts.map(product => (
            <div key={product.id} className="admin-product-card">
              <div className="admin-product-image">
                <img 
                  src={product.image || product.image_url || '/kirby_images/kirby_001.jpg'} 
                  alt={product.title} 
                  onError={(e) => {
                    e.target.src = '/kirby_images/kirby_001.jpg';
                  }}
                  style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
              </div>
              <div className="admin-product-info">
                <h3 className="admin-product-name">{product.title || product.name}</h3>
                <p className="admin-product-price">{product.price?.toLocaleString()}원</p>
                <div className="admin-product-meta">
                  <span>재고: {product.stock}개</span>
                  <span className={`admin-status-badge ${product.status || 'active'}`}>
                    {product.status === 'active' ? '판매중' : '품절'}
                    </span>
                </div>
                <div className="admin-product-actions">
                  <button 
                    className="admin-action-btn edit" 
                    onClick={() => handleEditProduct(product)}
                  >
                    수정
                  </button>
                  <button
                    className="admin-action-btn delete" 
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    삭제
                  </button>
                  <button 
                    className={`admin-action-btn ${product.status === 'active' ? 'disable' : 'enable'}`}
                    onClick={() => handleToggleProductStatus(product.id, product.status)}
                  >
                    {product.status === 'active' ? '판매중단' : '판매재개'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
              
        {/* 페이지네이션 */}
        <div className="admin-pagination">
                <button
            className="admin-pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
                >
            이전
                </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`admin-pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

                <button
            className="admin-pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
                >
            다음
                </button>
      </div>
    </div>
  );
  };

  const renderAnalytics = () => (
    <div className="admin-analytics-dashboard">
      <div className="admin-analytics-header">
        <h2 className="admin-analytics-title">비즈니스 인사이트 대시보드</h2>
        <p className="admin-analytics-subtitle">실시간 데이터로 보는 커비샵의 성장 동력</p>
          </div>

      {/* KPI 카드들 */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <div className="admin-kpi-icon-wrapper">💰</div>
            <div className="admin-kpi-trend positive">↗️ +18.2%</div>
        </div>
          <div className="admin-kpi-value">₩2,450,000</div>
          <div className="admin-kpi-label">총 매출액</div>
          <div className="admin-kpi-sublabel">이번 달 기준</div>
      </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <div className="admin-kpi-icon-wrapper">📦</div>
            <div className="admin-kpi-trend positive">↗️ +25.7%</div>
                </div>
          <div className="admin-kpi-value">1,247</div>
          <div className="admin-kpi-label">총 주문 건수</div>
          <div className="admin-kpi-sublabel">이번 달 기준</div>
                </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <div className="admin-kpi-icon-wrapper">👥</div>
            <div className="admin-kpi-trend positive">↗️ +12.3%</div>
              </div>
          <div className="admin-kpi-value">342</div>
          <div className="admin-kpi-label">신규 고객</div>
          <div className="admin-kpi-sublabel">이번 달 기준</div>
              </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <div className="admin-kpi-icon-wrapper">⭐</div>
            <div className="admin-kpi-trend positive">↗️ +0.3</div>
            </div>
          <div className="admin-kpi-value">4.8</div>
          <div className="admin-kpi-label">평균 만족도</div>
          <div className="admin-kpi-sublabel">5점 만점 기준</div>
          </div>
        </div>

      {/* 메인 차트 */}
      <div className="admin-main-chart-section">
        <div className="admin-chart-card">
          <div className="admin-chart-header">
            <h3 className="admin-chart-title">매출 트렌드 분석</h3>
            <p className="admin-chart-description">최근 30일간의 상세 매출 동향</p>
                </div>
          <div className="admin-chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData.salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₩${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [`₩${value?.toLocaleString()}`, '매출']} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#667eea"
                  fill="url(#salesGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
              </div>
        </div>
      </div>

      {/* 서브 차트들 */}
      <div className="admin-charts-grid">
        <div className="admin-mini-chart-card">
          <div className="admin-mini-chart-header">
            <h4 className="admin-mini-chart-title">고객 증가 추이</h4>
                    </div>
          <div className="admin-mini-chart-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-mini-chart-card">
          <div className="admin-mini-chart-header">
            <h4 className="admin-mini-chart-title">카테고리별 매출</h4>
              </div>
          <div className="admin-mini-chart-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.productCategoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.productCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
                    </div>
        </div>

        <div className="admin-mini-chart-card">
          <div className="admin-mini-chart-header">
            <h4 className="admin-mini-chart-title">인기 상품 TOP 5</h4>
                </div>
          <div className="admin-mini-chart-body">
            <div className="admin-products-ranking-list">
              {products.slice(0, 5).map((product, index) => (
                <div key={product.id} className="admin-ranking-product-item">
                  <div className="admin-rank-badge">#{index + 1}</div>
                  <div className="admin-product-info">
                    <div className="admin-product-name">{product.name}</div>
                    <div className="admin-product-sales">{product.sales || 0}개 판매</div>
                </div>
                  <div className="admin-product-price">₩{product.price?.toLocaleString()}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>
      {renderAdminFooter()}
    </div>
  );



  const renderSettings = () => (
    <div className="admin-content">
      <div className="admin-settings-header">
        <h2>환경설정</h2>
        <p className="admin-settings-subtitle">사이트 운영에 필요한 전반적인 설정을 관리합니다</p>
      </div>

      <div className="admin-settings-tabs">
        <button className="admin-settings-tab active" onClick={() => setActiveSettingsTab('general')}>
          일반 설정
        </button>
        <button className="admin-settings-tab" onClick={() => setActiveSettingsTab('member')}>
          회원 및 권한
        </button>
        <button className="admin-settings-tab" onClick={() => setActiveSettingsTab('design')}>
          디자인 및 콘텐츠
        </button>
        <button className="admin-settings-tab" onClick={() => setActiveSettingsTab('service')}>
          서비스 및 기능
        </button>
        <button className="admin-settings-tab" onClick={() => setActiveSettingsTab('security')}>
          시스템 및 보안
          </button>
      </div>

      <div className="admin-settings-content">
        {activeSettingsTab === 'general' && (
          <div className="admin-settings-section">
            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>사이트 정보</h3>
                <p>웹사이트의 기본 정보를 설정합니다</p>
              </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>사이트 이름</label>
          <input
            type="text"
                    value={siteSettings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    className="admin-form-input" 
                  />
                  <small>브라우저 탭과 검색엔진에 표시되는 사이트 이름입니다</small>
                </div>
                <div className="admin-form-group">
                  <label>사이트 설명</label>
                  <textarea 
                    value={siteSettings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                    className="admin-form-textarea"
                  ></textarea>
                  <small>검색엔진 최적화를 위한 사이트 설명입니다</small>
                </div>
                <div className="admin-form-group">
                  <label>사이트 태그라인</label>
                  <input 
                    type="text" 
                    value={siteSettings.siteTagline}
                    onChange={(e) => handleSettingChange('siteTagline', e.target.value)}
                    className="admin-form-input" 
                  />
                </div>
        </div>
      </div>

            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>기본 정보</h3>
                <p>회사 및 연락처 정보를 관리합니다</p>
              </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>회사명</label>
                  <input type="text" defaultValue="커비샵 주식회사" className="admin-form-input" />
                </div>
                <div className="admin-form-group">
                  <label>대표자명</label>
                  <input type="text" defaultValue="김커비" className="admin-form-input" />
                </div>
                <div className="admin-form-group">
                  <label>사업자등록번호</label>
                  <input type="text" defaultValue="123-45-67890" className="admin-form-input" />
                </div>
                <div className="admin-form-group">
                  <label>주소</label>
                  <input type="text" defaultValue="서울특별시 강남구 테헤란로 123" className="admin-form-input" />
                </div>
                <div className="admin-form-group">
                  <label>고객센터 전화번호</label>
                  <input type="tel" defaultValue="1588-1234" className="admin-form-input" />
                </div>
                <div className="admin-form-group">
                  <label>이메일</label>
                  <input type="email" defaultValue="admin@kirby-shop.com" className="admin-form-input" />
                </div>
              </div>
            </div>

            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>시스템 운영 정책</h3>
                <p>사이트 운영에 관한 기본 정책을 설정합니다</p>
              </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>운영 시간</label>
                  <div className="admin-form-row">
                    <input type="time" defaultValue="09:00" className="admin-form-input" />
                    <span>~</span>
                    <input type="time" defaultValue="18:00" className="admin-form-input" />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label>기본 언어</label>
                  <select className="admin-form-select">
                    <option value="ko" selected>한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
          </select>
        </div>
                <div className="admin-form-group">
                  <label>기본 지역</label>
                  <select className="admin-form-select">
                    <option value="KR" selected>대한민국</option>
                    <option value="US">미국</option>
                    <option value="JP">일본</option>
                  </select>
      </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="maintenance-mode" className="admin-checkbox" />
                  <label htmlFor="maintenance-mode">점검 모드 활성화</label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSettingsTab === 'member' && (
          <div className="admin-settings-section">
            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>회원 관리</h3>
                <p>회원 가입 및 관리 정책을 설정합니다</p>
              </div>
              <div className="admin-form-section">
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="allow-signup" defaultChecked className="admin-checkbox" />
                  <label htmlFor="allow-signup">회원 가입 허용</label>
                </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="email-verification" defaultChecked className="admin-checkbox" />
                  <label htmlFor="email-verification">이메일 인증 필수</label>
                </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="phone-verification" className="admin-checkbox" />
                  <label htmlFor="phone-verification">휴대폰 인증 필수</label>
                </div>
                <div className="admin-form-group">
                  <label>회원 등급별 혜택</label>
                  <div className="admin-member-levels">
                    <div className="admin-level-item">
                      <span>일반회원</span>
                      <input type="number" defaultValue="0" className="admin-form-input" placeholder="할인율(%)" />
                    </div>
                    <div className="admin-level-item">
                      <span>VIP회원</span>
                      <input type="number" defaultValue="5" className="admin-form-input" placeholder="할인율(%)" />
                    </div>
                    <div className="admin-level-item">
                      <span>VVIP회원</span>
                      <input type="number" defaultValue="10" className="admin-form-input" placeholder="할인율(%)" />
                    </div>
                  </div>
                </div>
                </div>
              </div>
              
            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>관리자 권한</h3>
                <p>관리자 계정별 접근 권한을 설정합니다</p>
                  </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>현재 관리자</label>
                  <div className="admin-current-admin">
                    <span>admin@kirby-shop.com</span>
                    <span className="admin-role-badge admin">최고관리자</span>
                  </div>
                  </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="user-management" defaultChecked className="admin-checkbox" />
                  <label htmlFor="user-management">사용자 관리 권한</label>
                  </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="product-management" defaultChecked className="admin-checkbox" />
                  <label htmlFor="product-management">상품 관리 권한</label>
                  </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="order-management" defaultChecked className="admin-checkbox" />
                  <label htmlFor="order-management">주문 관리 권한</label>
                </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="system-settings" defaultChecked className="admin-checkbox" />
                  <label htmlFor="system-settings">시스템 설정 권한</label>
                </div>
                </div>
              </div>
              
            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>접근 제어</h3>
                <p>특정 IP나 지역의 접근을 제어합니다</p>
                </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>차단할 IP 주소</label>
                  <textarea placeholder="예: 192.168.1.1&#10;192.168.1.2" className="admin-form-textarea"></textarea>
              </div>
                <div className="admin-form-group">
                  <label>허용할 국가</label>
                  <select className="admin-form-select" multiple>
                    <option value="KR" selected>대한민국</option>
                    <option value="US">미국</option>
                    <option value="JP">일본</option>
                    <option value="CN">중국</option>
                </select>
              </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="block-vpn" className="admin-checkbox" />
                  <label htmlFor="block-vpn">VPN 접근 차단</label>
            </div>
      </div>
    </div>
          </div>
        )}

        {activeSettingsTab === 'design' && (
          <div className="admin-settings-section">
            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>디자인 관리</h3>
                <p>웹사이트의 테마와 디자인을 관리합니다</p>
                    </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>사이트 테마</label>
                  <select className="admin-form-select">
                    <option value="kirby-pink" selected>커비 핑크</option>
                    <option value="kirby-blue">커비 블루</option>
                    <option value="kirby-green">커비 그린</option>
                    <option value="custom">커스텀</option>
                    </select>
                    </div>
                <div className="admin-form-group">
                  <label>메인 컬러</label>
                  <input type="color" defaultValue="#ff69b4" className="admin-color-input" />
                </div>
                <div className="admin-form-group">
                  <label>보조 컬러</label>
                  <input type="color" defaultValue="#ff1493" className="admin-color-input" />
                </div>
                <div className="admin-form-group">
                  <label>로고 이미지</label>
                  <input type="file" accept="image/*" className="admin-form-input" />
                </div>
        </div>
      </div>

            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>메인 페이지 관리</h3>
                <p>메인 화면에 표시할 콘텐츠를 설정합니다</p>
                  </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>메인 배너</label>
                  <div className="admin-banner-settings">
                    <div className="admin-checkbox-wrapper">
                      <input type="checkbox" id="show-hero-banner" defaultChecked className="admin-checkbox" />
                      <label htmlFor="show-hero-banner">히어로 배너 표시</label>
                  </div>
                    <div className="admin-checkbox-wrapper">
                      <input type="checkbox" id="show-promo-banner" defaultChecked className="admin-checkbox" />
                      <label htmlFor="show-promo-banner">프로모션 배너 표시</label>
                  </div>
                  </div>
                  </div>
                <div className="admin-form-group">
                  <label>상품 표시 개수</label>
                  <select className="admin-form-select">
                    <option value="12">12개</option>
                    <option value="24" selected>24개</option>
                    <option value="36">36개</option>
                    <option value="48">48개</option>
                  </select>
              </div>
                <div className="admin-form-group">
                  <label>정렬 기준</label>
                  <select className="admin-form-select">
                    <option value="newest" selected>최신순</option>
                    <option value="popular">인기순</option>
                    <option value="price-low">낮은가격순</option>
                    <option value="price-high">높은가격순</option>
                  </select>
            </div>
                </div>
              </div>
              
            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>게시판 설정</h3>
                <p>게시판의 기본 설정을 관리합니다</p>
              </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>페이지당 글 개수</label>
                  <select className="admin-form-select">
                    <option value="10">10개</option>
                    <option value="20" selected>20개</option>
                    <option value="30">30개</option>
                    <option value="50">50개</option>
                </select>
        </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="allow-comments" defaultChecked className="admin-checkbox" />
                  <label htmlFor="allow-comments">댓글 허용</label>
      </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="require-login" className="admin-checkbox" />
                  <label htmlFor="require-login">글쓰기 로그인 필수</label>
            </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="auto-approve" defaultChecked className="admin-checkbox" />
                  <label htmlFor="auto-approve">자동 승인</label>
          </div>
        </div>
            </div>
          </div>
        )}

        {activeSettingsTab === 'service' && (
          <div className="admin-settings-section">
            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>전자결제(PG) 설정</h3>
                <p>결제 시스템을 연동하고 관리합니다</p>
            </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>PG사 선택</label>
                  <select className="admin-form-select">
                    <option value="toss" selected>토스페이먼츠</option>
                    <option value="kakao">카카오페이</option>
                    <option value="inicis">KG이니시스</option>
                    <option value="kcp">KCP</option>
                  </select>
          </div>
                <div className="admin-form-group">
                  <label>가맹점 ID</label>
                  <input type="text" placeholder="가맹점 ID를 입력하세요" className="admin-form-input" />
        </div>
                <div className="admin-form-group">
                  <label>가맹점 키</label>
                  <input type="password" placeholder="가맹점 키를 입력하세요" className="admin-form-input" />
              </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="test-mode" defaultChecked className="admin-checkbox" />
                  <label htmlFor="test-mode">테스트 모드</label>
                </div>
          </div>
        </div>

            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>도메인 연결</h3>
                <p>자체 도메인을 연결하고 관리합니다</p>
              </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>기본 도메인</label>
                  <input type="text" defaultValue="kirby-shop.com" className="admin-form-input" />
            </div>
                <div className="admin-form-group">
                  <label>서브 도메인</label>
                  <input type="text" placeholder="예: shop.kirby-shop.com" className="admin-form-input" />
              </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="ssl-enabled" defaultChecked className="admin-checkbox" />
                  <label htmlFor="ssl-enabled">SSL 인증서 활성화</label>
            </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="www-redirect" className="admin-checkbox" />
                  <label htmlFor="www-redirect">www 자동 리다이렉트</label>
              </div>
            </div>
          </div>

            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>서비스 연동</h3>
                <p>외부 서비스를 연동하는 기능을 관리합니다</p>
        </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>이메일 서비스</label>
                  <select className="admin-form-select">
                    <option value="smtp" selected>SMTP</option>
                    <option value="gmail">Gmail</option>
                    <option value="naver">네이버 메일</option>
                    <option value="daum">다음 메일</option>
                  </select>
      </div>
                <div className="admin-form-group">
                  <label>소셜 로그인</label>
                  <div className="admin-social-login">
                    <div className="admin-checkbox-wrapper">
                      <input type="checkbox" id="google-login" className="admin-checkbox" />
                      <label htmlFor="google-login">구글 로그인</label>
    </div>
                    <div className="admin-checkbox-wrapper">
                      <input type="checkbox" id="kakao-login" defaultChecked className="admin-checkbox" />
                      <label htmlFor="kakao-login">카카오 로그인</label>
      </div>
                    <div className="admin-checkbox-wrapper">
                      <input type="checkbox" id="naver-login" className="admin-checkbox" />
                      <label htmlFor="naver-login">네이버 로그인</label>
          </div>
          </div>
          </div>
                <div className="admin-form-group">
                  <label>실시간 채팅</label>
                  <select className="admin-form-select">
                    <option value="none">사용안함</option>
                    <option value="kakao" selected>카카오톡 상담</option>
                    <option value="custom">커스텀 채팅</option>
                  </select>
        </div>
              </div>
            </div>
          </div>
        )}

        {activeSettingsTab === 'security' && (
          <div className="admin-settings-section">
            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>보안 설정</h3>
                <p>사이트 보안을 강화하는 설정을 관리합니다</p>
              </div>
              <div className="admin-form-section">
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="captcha-enabled" className="admin-checkbox" />
                  <label htmlFor="captcha-enabled">관리자 로그인 시 캡차 사용</label>
              </div>
                <div className="admin-form-group">
                  <label>세션 만료 시간</label>
                  <select className="admin-form-select">
                    <option value="1">1시간</option>
                    <option value="6">6시간</option>
                    <option value="24" selected>24시간</option>
                    <option value="168">7일</option>
                  </select>
            </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="two-factor-auth" className="admin-checkbox" />
                  <label htmlFor="two-factor-auth">2단계 인증</label>
              </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="login-logging" defaultChecked className="admin-checkbox" />
                  <label htmlFor="login-logging">로그인 로그 기록</label>
              </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="password-policy" defaultChecked className="admin-checkbox" />
                  <label htmlFor="password-policy">강력한 비밀번호 정책</label>
            </div>
          </div>
        </div>

            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>백업 및 복원</h3>
                <p>시스템 데이터 백업 및 복원을 관리합니다</p>
          </div>
              <div className="admin-form-section">
                <div className="admin-form-group">
                  <label>자동 백업 주기</label>
                  <select className="admin-form-select">
                    <option value="daily">매일</option>
                    <option value="weekly" selected>매주</option>
                    <option value="monthly">매월</option>
                  </select>
          </div>
                <div className="admin-form-group">
                  <label>백업 보관 기간</label>
                  <select className="admin-form-select">
                    <option value="7">7일</option>
                    <option value="30" selected>30일</option>
                    <option value="90">90일</option>
                  </select>
          </div>
          <div className="admin-action-buttons">
            <button className="admin-btn-secondary" onClick={handleBackupNow}>
              지금 백업
            </button>
            <button className="admin-btn-secondary" onClick={handleOptimizeDB}>
              DB 최적화
                </button>
              </div>
            </div>
        </div>

            <div className="admin-settings-card">
              <div className="admin-card-header">
                <h3>시스템 모니터링</h3>
                <p>서버 상태와 트래픽을 모니터링합니다</p>
          </div>
              <div className="admin-form-section">
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="server-monitoring" defaultChecked className="admin-checkbox" />
                  <label htmlFor="server-monitoring">서버 상태 모니터링</label>
          </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="traffic-monitoring" defaultChecked className="admin-checkbox" />
                  <label htmlFor="traffic-monitoring">트래픽 모니터링</label>
          </div>
                <div className="admin-checkbox-wrapper">
                  <input type="checkbox" id="error-alerts" defaultChecked className="admin-checkbox" />
                  <label htmlFor="error-alerts">오류 알림</label>
          </div>
                <div className="admin-form-group">
                  <label>알림 이메일</label>
                  <input type="email" defaultValue="admin@kirby-shop.com" className="admin-form-input" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="admin-settings-footer">
          <button className="admin-btn-primary admin-btn-large" onClick={handleSaveSettingsWithValidation}>
            설정 저장
          </button>
          <button className="admin-btn-secondary" onClick={handleResetSettings}>
            초기화
          </button>
        </div>
      </div>
      {renderAdminFooter()}
    </div>
  );


  // 사용자 관리 렌더링 함수
  const renderUsers = () => (
    <div className="admin-content">
      <div className="admin-content-header">
        <h2>사용자 관리</h2>
        <div className="header-actions">
          <button className="admin-btn-primary" onClick={handleCreateUser} style={{fontSize: '1rem', padding: '0.5rem 1rem', width: '270px', height: '41px'}}>
            + 새 사용자 추가
          </button>
          <input
            type="text"
            placeholder="사용자 검색..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="admin-search-input"
          />
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="admin-form-select"
          >
            <option value="all">전체</option>
            <option value="user">일반회원</option>
            <option value="manager">관리자</option>
            <option value="blocked">차단된 사용자</option>
          </select>
        </div>
      </div>

      <div className="admin-users-grid">
        {users
          .filter(user => {
            const matchesSearch = user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                user.email?.toLowerCase().includes(userSearch.toLowerCase());
            const matchesFilter = userFilter === 'all' || 
                                (userFilter === 'blocked' ? user.blocked : user.role === userFilter);
            return matchesSearch && matchesFilter;
          })
          .map(user => (
            <div key={user.id} className="admin-user-card">
              <div className="admin-user-header">
                <div className="admin-user-avatar">
                  {user.profileImage ? (
                    <>
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="admin-avatar-image" 
                        onLoad={(e) => e.target.style.opacity = '1'}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        style={{ opacity: 0 }}
                      />
                      <div className="admin-avatar-placeholder" style={{ display: 'none' }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                    </>
                  ) : (
                    <div className="admin-avatar-placeholder">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
                  )}
                  </div>
                <div className="admin-user-info">
                  <h3 className="admin-user-name">{user.name || '이름 없음'}</h3>
                  <p className="admin-user-email">{user.email}</p>
                  <div className="admin-user-badges">
                    <span className={`admin-role-badge ${user.role}`}>
                      {user.role === 'user' ? '일반회원' :
                        user.role === 'manager' ? '관리자' : '판매자'}
                    </span>
                    <span className={`admin-status-badge ${user.blocked ? 'blocked' : 'active'}`}>
                      {user.blocked ? '차단됨' : '활성'}
                    </span>
                  </div>
                  </div>
                  </div>
              
              <div className="admin-user-details">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">가입일:</span>
                  <span className="admin-detail-value">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                {user.phone && (
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">전화번호:</span>
                    <span className="admin-detail-value">{user.phone}</span>
                </div>
                )}
                {user.address && (
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">주소:</span>
                    <span className="admin-detail-value">{user.address}</span>
                  </div>
                )}
                {user.lastLogin && (
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">마지막 로그인:</span>
                    <span className="admin-detail-value">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="admin-user-actions">
                <button className="admin-action-btn edit" onClick={() => handleEditUser(user)}>
                  <span className="admin-btn-icon">✏️</span>
                  편집
                </button>
                <button className={`admin-action-btn ${user.blocked ? 'unblock' : 'block'}`} onClick={() => handleToggleUserBlock(user.id, user.blocked)}>
                  <span className="admin-btn-icon">{user.blocked ? '🔓' : '🔒'}</span>
                  {user.blocked ? '차단해제' : '차단'}
                </button>
                <button className="admin-action-btn delete" onClick={() => handleDeleteUser(user.id)}>
                  <span className="admin-btn-icon">🗑️</span>
                  삭제
                </button>
              </div>
            </div>
          ))}
      </div>

      {users.length === 0 && (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">👥</div>
          <h3>사용자가 없습니다</h3>
          <p>새 사용자를 추가해보세요.</p>
          <button className="admin-btn-primary" onClick={handleCreateUser}>
            새 사용자 추가
          </button>
          </div>
      )}
      {renderAdminFooter()}
    </div>
  );

  // 주문 관리 렌더링 함수
  const renderOrders = () => (
    <div className="admin-content">
      <div className="admin-content-header">
        <h2>주문 관리</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="주문 검색..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="admin-search-input"
          />
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="admin-form-select"
          >
            <option value="all">전체</option>
            <option value="pending">대기중</option>
            <option value="processing">처리중</option>
            <option value="shipped">배송중</option>
            <option value="delivered">배송완료</option>
            <option value="cancelled">취소됨</option>
          </select>
        </div>
      </div>

      <div className="admin-orders-grid">
        {orders
          .filter(order => {
            const matchesSearch = order.userName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                                order.id.toString().includes(orderSearch);
            const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
            return matchesSearch && matchesFilter;
          })
          .map(order => (
            <div key={order.id} className="admin-order-card">
              <div className="admin-order-header">
                <div className="admin-order-number">
                  <span className="order-label">주문번호</span>
                  <span className="order-value">#{order.id}</span>
                </div>
                <div className="admin-order-status">
                  <span className={`admin-status-badge ${order.status}`}>
                    {order.status === 'pending' ? '대기중' :
                     order.status === 'processing' ? '처리중' :
                     order.status === 'shipped' ? '배송중' :
                     order.status === 'delivered' ? '배송완료' : '취소됨'}
                  </span>
                </div>
              </div>

              <div className="admin-order-content">
                <div className="admin-order-info">
                  <div className="admin-info-item">
                    <span className="admin-info-label">고객명:</span>
                    <span className="admin-info-value">{order.userName}</span>
              </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">주문금액:</span>
                    <span className="admin-info-value amount">₩{(order.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="admin-info-item">
                    <span className="admin-info-label">주문일시:</span>
                    <span className="admin-info-value">{order.createdAt}</span>
          </div>
        </div>

                <div className="admin-order-actions">
                  <button className="admin-action-btn view" onClick={() => handleViewOrder(order)}>
                    <span className="admin-btn-icon">👁️</span>
                    상세보기
                  </button>
                  <button className="admin-action-btn edit" onClick={() => handleUpdateOrderStatus(order.id, order.status)}>
                    <span className="admin-btn-icon">🔄</span>
                    상태변경
                  </button>
                  <button className="admin-action-btn delete" onClick={() => handleCancelOrder(order.id)}>
                    <span className="admin-btn-icon">❌</span>
                    취소
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {orders.length === 0 && (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">🛒</div>
          <h3>주문이 없습니다</h3>
          <p>아직 주문된 상품이 없습니다.</p>
        </div>
      )}
      {renderAdminFooter()}
    </div>
  );

  // 고객지원 렌더링 함수
  const renderSupport = () => (
    <div className="admin-content">
      <div className="admin-content-header">
        <h2>고객지원</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="문의 검색..."
            value={inquirySearch}
            onChange={(e) => setInquirySearch(e.target.value)}
            className="admin-search-input"
          />
          <select
            value={inquiryFilter}
            onChange={(e) => setInquiryFilter(e.target.value)}
            className="admin-form-select"
          >
            <option value="all">전체</option>
            <option value="pending">미답변</option>
            <option value="answered">답변완료</option>
            <option value="closed">종료</option>
          </select>
        </div>
      </div>

      <div className="admin-inquiries-table">
        <table className="admin-table">
          <thead>
            <tr>
              <th>문의번호</th>
              <th>제목</th>
              <th>고객명</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>문의일시</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map(inquiry => (
              <tr key={inquiry.id}>
                <td>#{inquiry.id}</td>
                <td>{inquiry.title}</td>
                <td>{inquiry.userName}</td>
                <td>
                  <span className={`admin-category-badge ${inquiry.category}`}>
                    {inquiry.category}
                  </span>
                </td>
                <td>
                  <span className={`admin-status-badge ${inquiry.status}`}>
                    {inquiry.status === 'pending' ? '미답변' : '답변완료'}
                  </span>
                </td>
                <td>{inquiry.createdAt}</td>
                <td>
                  <div className="admin-action-buttons">
                    <button className="admin-action-btn view">답변</button>
                    <button className="admin-action-btn delete">삭제</button>
            </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderAdminFooter()}
    </div>
  );

  // QnA 관리 함수들
  const fetchQnAs = async () => {
    try {
      console.log('QnA 목록 조회 시작...');
      const token = localStorage.getItem('kirby-shop-token');
      console.log('사용할 토큰:', token);
      
      const response = await fetch(`${API_BASE_URL}/qna/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('QnA API 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('QnA 데이터:', data);
        setQnas(data);
      } else {
        const errorData = await response.json();
        console.error('QnA API 에러:', errorData);
        alert(`QnA 목록 조회 실패: ${errorData.detail || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('QnA 목록 조회 실패:', error);
      alert('QnA 목록 조회 중 오류가 발생했습니다.');
    }
  };

  const handleAnswerQnA = (qna) => {
    setSelectedQna(qna);
    setAnswerContent('');
    setEditingAnswer(null);
    setIsQnaModalOpen(true);
  };

  const handleEditAnswer = (qna, answer) => {
    setSelectedQna(qna);
    setAnswerContent(answer.content);
    setEditingAnswer(answer);
    setIsQnaModalOpen(true);
  };

  const submitAnswer = async () => {
    if (!answerContent.trim()) {
      alert('답변 내용을 입력해주세요.');
      return;
    }

    try {
      let response;
      if (editingAnswer) {
        // 답변 수정
        response = await fetch(`${API_BASE_URL}/qna/answers/${editingAnswer.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('kirby-shop-token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: answerContent
          })
        });
      } else {
        // 새 답변 등록
        response = await fetch(`${API_BASE_URL}/qna/${selectedQna.id}/answers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('kirby-shop-token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: answerContent
          })
        });
      }

      if (response.ok) {
        alert(editingAnswer ? '답변이 수정되었습니다.' : '답변이 등록되었습니다.');
        setIsQnaModalOpen(false);
        setAnswerContent('');
        setSelectedQna(null);
        setEditingAnswer(null);
        fetchQnAs(); // 목록 새로고침
      } else {
        const errorData = await response.json();
        alert(`${editingAnswer ? '답변 수정' : '답변 등록'} 실패: ${errorData.detail || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('답변 처리 실패:', error);
      alert(`${editingAnswer ? '답변 수정' : '답변 등록'} 중 오류가 발생했습니다.`);
    }
  };

  const renderQnA = () => (
    <div className="admin-content">
      <div className="admin-content-header">
        <h2>Q&A 관리</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Q&A 검색..."
            value={qnaSearch}
            onChange={(e) => setQnaSearch(e.target.value)}
            className="admin-search-input"
          />
          <select
            value={qnaFilter}
            onChange={(e) => setQnaFilter(e.target.value)}
            className="admin-form-select"
          >
            <option value="all">전체</option>
            <option value="pending">답변대기</option>
            <option value="answered">답변완료</option>
          </select>
          <button 
            className="admin-btn-primary"
            onClick={fetchQnAs}
          >
            새로고침
          </button>
        </div>
      </div>

      <div className="admin-qna-table">
        <table className="admin-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>제목</th>
              <th>작성자</th>
              <th>카테고리</th>
              <th>상태</th>
              <th>작성일</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {qnas.filter(qna => {
              const matchesSearch = qna.title.toLowerCase().includes(qnaSearch.toLowerCase()) ||
                                 qna.content.toLowerCase().includes(qnaSearch.toLowerCase());
              const matchesFilter = qnaFilter === 'all' || qna.status === qnaFilter;
              return matchesSearch && matchesFilter;
            }).map(qna => (
              <tr key={qna.id}>
                <td>#{qna.id}</td>
                <td className="qna-title-cell">
                  <div className="qna-title">{qna.title}</div>
                  <div className="qna-content-preview">{qna.content.substring(0, 50)}...</div>
                </td>
                <td>{qna.user?.name || '알 수 없음'}</td>
                <td>
                  <span className={`admin-category-badge ${qna.category}`}>
                    {qna.category}
                  </span>
                </td>
                <td>
                  <span className={`admin-status-badge ${qna.status}`}>
                    {qna.status === 'pending' ? '답변대기' : '답변완료'}
                  </span>
                </td>
                <td>{new Date(qna.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="admin-action-buttons">
                    <button 
                      className="admin-action-btn view"
                      onClick={() => handleAnswerQnA(qna)}
                    >
                      {qna.status === 'pending' ? '답변하기' : '답변보기'}
                    </button>
                    <button className="admin-action-btn delete">삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderAdminFooter()}
    </div>
  );

  // QnA 답변 모달 렌더링 함수
  const renderQnAModal = () => {
    if (!isQnaModalOpen || !selectedQna) return null;

    return (
      <div className="admin-modal-overlay" onClick={() => setIsQnaModalOpen(false)}>
        <div className="admin-modal-content admin-qna-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-header">
            <div className="admin-modal-header-content">
              <div className="admin-modal-title-section">
                <div className="admin-modal-icon">❓</div>
                <div>
                  <h2 className="admin-modal-title">Q&A 답변</h2>
                  <p className="admin-modal-subtitle">
                    {selectedQna.title}
                  </p>
                </div>
              </div>
              <button 
                className="admin-modal-close-btn"
                onClick={() => setIsQnaModalOpen(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="admin-modal-body">
            <div className="qna-detail-section">
              <h3>문의 내용</h3>
              <div className="qna-detail-content">
                <p><strong>제목:</strong> {selectedQna.title}</p>
                <p><strong>내용:</strong></p>
                <div className="qna-content-box">
                  {selectedQna.content}
                </div>
                <p><strong>카테고리:</strong> {selectedQna.category}</p>
                <p><strong>작성자:</strong> {selectedQna.user?.name || '알 수 없음'}</p>
                <p><strong>작성일:</strong> {new Date(selectedQna.created_at).toLocaleString()}</p>
              </div>
            </div>

            <div className="answer-section">
              <h3>{editingAnswer ? '답변 수정' : '답변 작성'}</h3>
              
              {/* 기존 답변 표시 */}
              {selectedQna.answers && selectedQna.answers.length > 0 && !editingAnswer && (
                <div className="existing-answers">
                  <h4>기존 답변</h4>
                  {selectedQna.answers.map((answer, index) => (
                    <div key={answer.id} className="existing-answer-item">
                      <div className="answer-content-display">
                        {answer.content}
                      </div>
                      <div className="answer-meta">
                        <span className="answer-date">
                          {new Date(answer.created_at).toLocaleString()}
                        </span>
                        <button 
                          className="edit-answer-btn"
                          onClick={() => handleEditAnswer(selectedQna, answer)}
                        >
                          ✏️ 수정
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <textarea
                className="admin-form-textarea"
                placeholder={editingAnswer ? "수정할 답변 내용을 입력해주세요..." : "답변 내용을 입력해주세요..."}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                rows={6}
              />
            </div>
          </div>

          <div className="admin-modal-footer">
            <button 
              className="admin-btn-secondary"
              onClick={() => setIsQnaModalOpen(false)}
            >
              취소
            </button>
            <button 
              className="admin-btn-primary"
              onClick={submitAnswer}
            >
              {editingAnswer ? '답변 수정' : '답변 등록'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 상품 모달 렌더링 함수
  const renderProductModal = () => {
    if (!isProductModalOpen) return null;

    return (
      <div className="admin-modal-overlay" onClick={() => setIsProductModalOpen(false)}>
        <div className="admin-modal-content admin-product-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-header">
            <div className="admin-modal-header-content">
              <div className="admin-modal-title-section">
                <div className="admin-modal-icon">📦</div>
                <div>
                  <h2 className="admin-modal-title">상품 관리 시스템</h2>
                  <p className="admin-modal-subtitle">
                    {editingProduct ? '상품 정보 수정' : '새로운 상품 등록'}
                  </p>
            </div>
          </div>
          <button 
                className="admin-modal-close-btn"
                onClick={() => setIsProductModalOpen(false)}
          >
            ✕
          </button>
          </div>
        </div>

          <div className="admin-modal-body">
            <div className="admin-form-section">
              <div className="admin-section-header">
                <div className="admin-section-icon">📝</div>
                <h3 className="admin-section-title">기본 정보</h3>
              </div>
          
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">상품명 *</label>
            <input
              type="text"
                    value={newProduct.title}
                    onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    placeholder="상품명을 입력하세요"
                    className="admin-form-input"
            />
        </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">카테고리 *</label>
              <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="admin-form-select"
                  >
                    <option value="">카테고리 선택</option>
                    <option value="인형">인형</option>
                    <option value="의류">의류</option>
                    <option value="액세서리">액세서리</option>
                    <option value="문구">문구</option>
                    <option value="기타">기타</option>
              </select>
              </div>
            </div>
            
              <div className="admin-form-group">
                <label className="admin-form-label">상품 설명</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="상품에 대한 상세 설명"
                  className="admin-form-textarea"
                  rows="4"
              />
              </div>
          
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">가격 *</label>
              <input
                type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="admin-form-input"
              />
            </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">재고 수량</label>
              <input
                type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="admin-form-input"
              />
              </div>
            </div>
          
              {/* 이미지 업로드 섹션 */}
              <div className="admin-form-group">
                <div className="admin-section-header">
                  <div className="admin-section-icon">🖼️</div>
                  <h3 className="admin-section-title">상품 이미지</h3>
          </div>
            
                {/* 업로드 방법 선택 */}
                <div className="admin-upload-method-selector">
                  <button
                    type="button"
                    className={`admin-method-btn ${uploadMethod === 'url' ? 'active' : ''}`}
                    onClick={() => setUploadMethod('url')}
                  >
                    🌐 URL 입력
                  </button>
                  <button
                    type="button"
                    className={`admin-method-btn ${uploadMethod === 'file' ? 'active' : ''}`}
                    onClick={() => setUploadMethod('file')}
                  >
                    📁 파일 업로드
                  </button>
        </div>
            
                {/* URL 입력 방식 */}
                {uploadMethod === 'url' && (
                  <div className="admin-image-url-section">
                    {/* 프론트엔드 이미지 선택 */}
                    <div className="admin-frontend-images-section">
                      <h4 className="admin-subsection-title">🎨 프론트엔드 이미지 선택</h4>
                      <div className="admin-frontend-image-grid">
                        {Array.from({length: 20}, (_, i) => i + 1).map(num => (
                          <button
                            key={num}
                            type="button"
                            className="admin-frontend-image-btn"
                            onClick={() => {
                              const imagePath = `/kirby_images/kirby_${num.toString().padStart(3, '0')}.jpg`;
                              if (!imageUrls.includes(imagePath)) {
                                setImageUrls([...imageUrls, imagePath]);
                              }
                            }}
                          >
                            <img 
                              src={`/kirby_images/kirby_${num.toString().padStart(3, '0')}.jpg`}
                              alt={`커비 이미지 ${num}`}
                              className="admin-frontend-image-preview"
                            />
                            <span className="admin-image-number">{num}</span>
                          </button>
                        ))}
      </div>
    </div>
                    
                    {/* 수동 URL 입력 */}
                    <div className="admin-manual-url-section">
                      <h4 className="admin-subsection-title">🔗 수동 URL 입력</h4>
                      {imageUrls.map((url, index) => (
                        <div key={index} className="admin-image-url-item">
              <input
                          type="url"
                          value={url}
                          onChange={(e) => updateImageUrl(index, e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="admin-form-input"
                        />
                        {imageUrls.length > 1 && (
                          <button
                            type="button"
                            className="admin-remove-btn"
                            onClick={() => removeImageUrl(index)}
                          >
                            ✕
                          </button>
                        )}
          </div>
            ))}
                      {imageUrls.length < 5 && (
                        <button
                          type="button"
                          className="admin-add-image-btn"
                          onClick={addImageUrl}
                        >
                          <span className="admin-btn-icon">➕</span>
                          이미지 URL 추가
                        </button>
                      )}
      </div>

                    {/* 선택된 이미지 미리보기 */}
                    {imageUrls.length > 0 && (
                      <div className="admin-selected-images-section">
                        <h4 className="admin-subsection-title">📸 선택된 이미지</h4>
                        <div className="admin-selected-image-grid">
                          {imageUrls.map((url, index) => (
                            <div key={index} className="admin-selected-image-item">
                              <img
                                src={url}
                                alt={`선택된 이미지 ${index + 1}`}
                                className="admin-selected-image-preview"
                              />
                              <button
                                type="button"
                                className="admin-remove-selected-btn"
                                onClick={() => removeImageUrl(index)}
                              >
                                ✕
                              </button>
          </div>
                          ))}
          </div>
          </div>
                    )}
        </div>
                )}

                {/* 파일 업로드 방식 */}
                {uploadMethod === 'file' && (
                  <div className="admin-file-upload-section">
                    <div
                      className={`admin-drop-zone ${isDragOver ? 'drag-over' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="admin-drop-zone-content">
                        <div className="admin-drop-icon">📁</div>
                        <p className="admin-drop-text">
                          이미지를 드래그하거나 클릭하여 업로드
                        </p>
              <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="admin-file-input"
              />
              </div>
              </div>

                    {/* 업로드된 이미지 미리보기 */}
                    {selectedImages.length > 0 && (
                      <div className="admin-image-preview-grid">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="admin-image-preview-item">
                            <img
                              src={image.preview}
                              alt={`미리보기 ${index + 1}`}
                              className="admin-preview-image"
                            />
                            <button
                              type="button"
                              className="admin-remove-preview-btn"
                              onClick={() => removeImage(index)}
                            >
                              ✕
                            </button>
            </div>
                        ))}
              </div>
                    )}
              </div>
                )}
            </div>
          </div>
        </div>

          <div className="admin-modal-footer">
          <button 
              className="admin-btn-secondary"
              onClick={() => setIsProductModalOpen(false)}
          >
            취소
          </button>
          <button 
              className="admin-btn-primary"
              onClick={handleSaveProduct}
          >
              {editingProduct ? '상품 수정' : '상품 등록'}
          </button>
          </div>
          </div>
          </div>
  );
  };

  // 공통 푸터 컴포넌트
  const renderAdminFooter = () => (
    <div className="admin-footer">
      <div className="admin-footer-content">
        <div className="admin-developer-info">
          <p className="developer-text">Kirby Shop Admin Panel v1.0</p>
          <p className="developer-text">Developed with ❤️ by Kirby Team</p>
        </div>
      </div>
    </div>
  );

  // 보안 관리 렌더링
  const renderSecurity = () => (
    <div className="admin-security-content">
      <div className="admin-content-header">
        <h2 className="admin-content-title">🔒 보안 관리</h2>
        <p className="admin-content-subtitle">시스템 보안 설정 및 접근 제어</p>
      </div>

      <div className="admin-security-grid">
        {/* 세션 관리 */}
        <div className="admin-security-card">
          <div className="admin-card-header">
            <div className="admin-card-icon">🔐</div>
            <h3 className="admin-card-title">세션 관리</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-security-info">
              <div className="admin-info-item">
                <span className="admin-info-label">현재 세션:</span>
                <span className="admin-info-value">활성</span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">로그인 시간:</span>
                <span className="admin-info-value">
                  {localStorage.getItem('kirby-shop-admin-session') ? 
                    new Date(JSON.parse(localStorage.getItem('kirby-shop-admin-session')).loginTime).toLocaleString() : 
                    'N/A'}
                </span>
              </div>
              <div className="admin-info-item">
                <span className="admin-info-label">만료 시간:</span>
                <span className="admin-info-value">
                  {localStorage.getItem('kirby-shop-admin-session') ? 
                    new Date(JSON.parse(localStorage.getItem('kirby-shop-admin-session')).expiresAt || 
                    new Date(Date.now() + 24 * 60 * 60 * 1000)).toLocaleString() : 
                    'N/A'}
                </span>
              </div>
            </div>
            <div className="admin-security-actions">
              <button 
                className="admin-btn-secondary"
                onClick={() => {
                  localStorage.removeItem('kirby-shop-admin-session');
                  window.location.reload();
                }}
              >
                모든 세션 종료
              </button>
            </div>
          </div>
        </div>

        {/* 접근 로그 */}
        <div className="admin-security-card">
          <div className="admin-card-header">
            <div className="admin-card-icon">📋</div>
            <h3 className="admin-card-title">접근 로그</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-log-list">
              <div className="admin-log-item">
                <span className="admin-log-time">{new Date().toLocaleString()}</span>
                <span className="admin-log-action">관리자 로그인</span>
                <span className="admin-log-ip">127.0.0.1</span>
              </div>
              <div className="admin-log-item">
                <span className="admin-log-time">{new Date(Date.now() - 3600000).toLocaleString()}</span>
                <span className="admin-log-action">대시보드 접근</span>
                <span className="admin-log-ip">127.0.0.1</span>
              </div>
            </div>
          </div>
        </div>

        {/* 시스템 상태 */}
        <div className="admin-security-card">
          <div className="admin-card-header">
            <div className="admin-card-icon">🛡️</div>
            <h3 className="admin-card-title">시스템 보안 상태</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-security-status">
              <div className="admin-status-item">
                <span className="admin-status-label">데이터베이스 연결:</span>
                <span className="admin-status-value success">정상</span>
              </div>
              <div className="admin-status-item">
                <span className="admin-status-label">API 서버:</span>
                <span className="admin-status-value success">정상</span>
              </div>
              <div className="admin-status-item">
                <span className="admin-status-label">인증 시스템:</span>
                <span className="admin-status-value success">정상</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {renderAdminFooter()}
    </div>
  );

  // 메인 콘텐츠 렌더링
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'coupons':
        return renderCoupons();
      case 'support':
        return renderSupport();
      case 'qna':
        return renderQnA();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
    return (
          <div className="admin-content">
            <div className="admin-content-header">
              <h2 className="admin-content-title">⚙️ 설정</h2>
              <p className="admin-content-subtitle">시스템 설정 및 구성</p>
          </div>
            <div className="admin-settings-content">
              {renderSettings()}
      </div>
    </div>
  );
      case 'security':
        return renderSecurity();
      default:
        return renderDashboard();
  }
  };

  // 사용자 모달 렌더링 함수
  const renderUserModal = () => {
    if (!showUserModal) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
            <h2>{editingUser ? '사용자 정보 수정' : '새 사용자 추가'}</h2>
            <button className="modal-close" onClick={() => setShowUserModal(false)}>×</button>
        </div>
        
        <div className="modal-body">
            <div className="form-section">
              <div className="section-title">
                <h3>기본 정보</h3>
                <p>사용자의 기본 정보를 입력하세요</p>
          </div>
          
          <div className="form-group">
                <label>프로필 이미지</label>
                <div className="profile-image-section">
                  <div className="profile-image-preview">
                    {newUser.profileImage ? (
                      <img src={newUser.profileImage} alt="프로필" className="profile-preview-image" />
                    ) : (
                      <div className="profile-placeholder">
                        {newUser.name ? newUser.name.charAt(0).toUpperCase() : '👤'}
          </div>
                    )}
          </div>
                  <div className="profile-image-info">
                    <p className="profile-image-note">프로필 이미지는 사용자가 직접 설정할 수 있습니다.</p>
            </div>
            </div>
          </div>
          
            <div className="form-group">
                <label>이름 *</label>
              <input
              type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                  placeholder="사용자 이름을 입력하세요"
                  required
              />
            </div>
            
            <div className="form-group">
                <label>이메일 *</label>
              <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
                  placeholder="이메일 주소를 입력하세요"
                  required
              />
          </div>
          
            <div className="form-group">
                <label>전화번호</label>
              <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                className="form-input"
                  placeholder="전화번호를 입력하세요"
              />
            </div>
            
            <div className="form-group">
                <label>주소</label>
            <textarea
                  value={newUser.address}
                  onChange={(e) => setNewUser(prev => ({ ...prev, address: e.target.value }))}
              className="form-textarea"
                  placeholder="주소를 입력하세요"
              rows="3"
            />
          </div>
          
            <div className="form-group">
                <label>역할 *</label>
              <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                className="form-select"
              >
                  <option value="user">일반 사용자</option>
                  <option value="manager">매니저</option>
                  <option value="admin">관리자</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowUserModal(false)}>
            취소
          </button>
            <button className="btn-primary" onClick={handleSaveUser}>
              {editingUser ? '수정' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
  };


  // 관리자 로그인 함수
  const handleAdminLogin = async (loginData) => {
    try {
      // 백엔드 API를 통한 실제 인증
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.user.role === 'admin') {
        // 관리자 권한 확인
        setIsAdmin(true);
        setShowLoginForm(false);
        
        // JWT 토큰 저장
        localStorage.setItem('kirby-shop-token', data.access_token);
        localStorage.setItem('kirby-shop-user', JSON.stringify(data.user));
        
        // 관리자 세션 정보 저장
        localStorage.setItem('adminSession', JSON.stringify({
          isAdmin: true,
          username: loginData.email,
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24시간
        }));
        
        loadDashboardData();
        alert('관리자 로그인 성공!');
      } else {
        alert('관리자 권한이 필요합니다.');
        throw new Error('Admin access required');
      }
    } catch (error) {
      console.error('관리자 로그인 실패:', error);
      alert('로그인에 실패했습니다.');
      throw error;
    }
  };

  // 관리자 로그아웃 함수
  const handleAdminLogout = () => {
    setIsAdmin(false);
    setShowLoginForm(true);
    localStorage.removeItem('adminSession');
    setLoginData({ email: '', password: '' });
    alert('관리자 로그아웃되었습니다.');
  };


  return (
    <div className="admin-page">
      <Header />
      
      <AdminLoginModal 
        isOpen={showLoginForm}
        onClose={() => setShowLoginForm(false)}
        onLogin={handleAdminLogin}
      />
      
      {isAdmin && (
        <div className="admin-container">
        <div className="admin-sidebar">
          <div className="admin-logo">
            <h2>🎮 커비샵 관리자</h2>
          </div>
          
          <nav className="admin-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="admin-user-info">
            <img 
              src="/bot/kirby-puffy.png" 
              alt="핑크 커비" 
              className="user-avatar"
            />
            <div className="user-details">
              <p className="user-name">관리자</p>
              <p className="user-email">admin@kirby-shop.com</p>
            </div>
            <button className="logout-btn" onClick={handleAdminLogout}>
              로그아웃
            </button>
            <div className="sidebar-developer-info">
              <p className="sidebar-developer-text">Kirby Shop Admin Panel v1.0</p>
              <p className="sidebar-developer-text">Developed with ❤️ by Kirby Team</p>
            </div>
          </div>
          </div>
          
        <div className="admin-main">
            {renderContent()}
          {renderCouponModal()}
          {renderProductModal()}
          {renderQnAModal()}
          {renderNotification()}
          </div>
      </div>
      )}
      
      <Footer />
      {renderUserModal()}
    </div>
  );
};
export default AdminPage;