import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { Star, StarIcon, Camera, Video, Trash2, Edit3, Package, Calendar, CreditCard, Truck, CheckCircle } from 'lucide-react';
import '../styles/OrderHistoryPage.css';

const ORDERS_LIST_KEY = 'kirby-shop-orders';
const REVIEWS_KEY = 'kirby-shop-reviews';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    content: '',
    mediaFiles: []
  });

  useEffect(() => {
    loadOrders();
    loadReviews();
  }, []);

  const loadOrders = () => {
    try {
      const saved = localStorage.getItem(ORDERS_LIST_KEY);
      const ordersData = saved ? JSON.parse(saved) : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('주문내역 로딩 실패:', error);
    }
  };

  const loadReviews = () => {
    try {
      const saved = localStorage.getItem(REVIEWS_KEY);
      const reviewsData = saved ? JSON.parse(saved) : [];
      setReviews(reviewsData);
    } catch (error) {
      console.error('리뷰 로딩 실패:', error);
    }
  };

  const handleWriteReview = (order, product) => {
    setSelectedOrder(order);
    setSelectedProduct(product);
    setReviewForm({
      rating: 0,
      title: '',
      content: '',
      mediaFiles: []
    });
    setShowReviewModal(true);
  };

  const handleMediaUpload = (event) => {
    const files = Array.from(event.target.files);
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video',
      file: file,
    }));
    setReviewForm(prev => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...newMedia]
    }));
  };

  const handleRemoveMedia = (id) => {
    setReviewForm(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter(media => media.id !== id)
    }));
  };

  const handleSubmitReview = () => {
    if (!selectedProduct || reviewForm.rating === 0 || !reviewForm.title || !reviewForm.content) {
      alert('모든 필드를 채워주세요 (별점, 제목, 내용).');
      return;
    }

    const newReview = {
      id: Date.now(),
      orderId: selectedOrder.orderId,
      productId: selectedProduct.id,
      productName: selectedProduct.title || selectedProduct.name,
      productImage: selectedProduct.image,
      rating: reviewForm.rating,
      title: reviewForm.title,
      content: reviewForm.content,
      media: reviewForm.mediaFiles.map(m => ({ url: m.url, type: m.type })),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    const updatedReviews = [...reviews, newReview];
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updatedReviews));
    setReviews(updatedReviews);

    setShowReviewModal(false);
    setSelectedOrder(null);
    setSelectedProduct(null);
    alert('리뷰가 성공적으로 작성되었습니다!');
  };

  const hasReviewForProduct = (productId) => {
    return reviews.some(review => review.productId === productId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'REQUESTED': return <Package size={16} />;
      case 'CONFIRMED': return <CheckCircle size={16} />;
      case 'SHIPPED': return <Truck size={16} />;
      case 'DELIVERED': return <CheckCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REQUESTED': return '#ff9800';
      case 'CONFIRMED': return '#2196f3';
      case 'SHIPPED': return '#4caf50';
      case 'DELIVERED': return '#4caf50';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'REQUESTED': return '주문접수';
      case 'CONFIRMED': return '주문확인';
      case 'SHIPPED': return '배송중';
      case 'DELIVERED': return '배송완료';
      default: return status;
    }
  };

  return (
    <>
      <Header />
      <div className="order-history-container">
        <div className="order-history-content">
          <div className="page-header">
            <h1 className="page-title">
              주문내역
              <span className="title-icon">📦</span>
            </h1>
            <p className="page-subtitle">나의 주문 내역을 확인하고 리뷰를 작성해보세요</p>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <Package size={64} className="empty-icon" />
              <h3>주문내역이 없습니다</h3>
              <p>첫 번째 주문을 시작해보세요!</p>
              <button className="btn-primary" onClick={() => navigate('/')}>
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.orderId} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-number">주문번호: {order.orderId}</h3>
                      <div className="order-date">
                        <Calendar size={16} />
                        {new Date(order.createdAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                    <div className="order-status">
                      <span 
                        className="status-badge"
                        style={{ color: getStatusColor(order.status) }}
                      >
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="order-items">
                    {(order.items || []).map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-image">
                          <img 
                            src={item.image || item.product?.image || '/kirby_images/kirby_001.jpg'} 
                            alt={item.title || item.product?.title || '상품'}
                            onError={(e) => {
                              e.target.src = '/kirby_images/kirby_001.jpg';
                            }}
                          />
                        </div>
                        <div className="item-info">
                          <h4 className="item-title">{item.title || item.product?.title || '상품'}</h4>
                          <div className="item-details">
                            <span className="item-quantity">수량: {item.quantity || 1}개</span>
                            <span className="item-price">
                              {(item.price || item.product?.price || 0).toLocaleString()}원
                            </span>
                          </div>
                        </div>
                        <div className="item-actions">
                          {hasReviewForProduct(item.id || item.product?.id) ? (
                            <button className="review-btn completed" disabled>
                              <CheckCircle size={16} />
                              리뷰 완료
                            </button>
                          ) : (
                            <button 
                              className="review-btn"
                              onClick={() => handleWriteReview(order, item)}
                            >
                              <Star size={16} />
                              리뷰 작성
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>상품금액</span>
                      <span>{(order.summary?.subtotal || order.payable || 0).toLocaleString()}원</span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="summary-row discount">
                        <span>할인금액</span>
                        <span>-{order.discountAmount.toLocaleString()}원</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>총 결제금액</span>
                      <span>{(order.payable || 0).toLocaleString()}원</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {showReviewModal && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>리뷰 작성</h3>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {selectedProduct && (
                <div className="selected-product">
                  <img 
                    src={selectedProduct.image || selectedProduct.product?.image || '/kirby_images/kirby_001.jpg'} 
                    alt={selectedProduct.title || selectedProduct.product?.title}
                  />
                  <span>{selectedProduct.title || selectedProduct.product?.title}</span>
                </div>
              )}

              <div className="form-group">
                <label>별점</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={30}
                      fill={star <= reviewForm.rating ? '#ffc107' : 'none'}
                      stroke={star <= reviewForm.rating ? '#ffc107' : '#ccc'}
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="star-icon"
                    />
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="review-title">제목</label>
                <input
                  id="review-title"
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="리뷰 제목을 입력해주세요"
                  maxLength={50}
                />
                <span className="char-count">{reviewForm.title.length}/50</span>
              </div>

              <div className="form-group">
                <label htmlFor="review-content">내용</label>
                <textarea
                  id="review-content"
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="자세한 리뷰 내용을 작성해주세요"
                  rows={5}
                  maxLength={500}
                ></textarea>
                <span className="char-count">{reviewForm.content.length}/500</span>
              </div>

              <div className="form-group">
                <label>사진/비디오 첨부</label>
                <div className="media-upload-area">
                  <input
                    type="file"
                    id="media-upload"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleMediaUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="media-upload" className="upload-btn">
                    <Camera size={20} />
                    <span>사진/비디오 추가</span>
                  </label>
                </div>
                <div className="media-preview-grid">
                  {reviewForm.mediaFiles.map(media => (
                    <div key={media.id} className="media-preview-item">
                      {media.type === 'image' ? (
                        <img src={media.url} alt="미리보기" />
                      ) : (
                        <video src={media.url} controls />
                      )}
                      <button className="remove-media-btn" onClick={() => handleRemoveMedia(media.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowReviewModal(false)}>
                취소
              </button>
              <button className="btn-primary" onClick={handleSubmitReview}>
                리뷰 작성 완료
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default OrderHistoryPage;


