import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Star, Camera, Video, Upload, X, Edit3, Trash2, 
  ThumbsUp, MessageCircle, Calendar, User, Package
} from 'lucide-react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/ReviewPage.css';

const ReviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('write');
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [purchasedProducts, setPurchasedProducts] = useState([]);

  // 리뷰 작성 상태
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
    images: [],
    videos: []
  });
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadReviews();
    loadPurchasedProducts();
  }, [user, navigate]);

  const loadReviews = () => {
    try {
      const savedReviews = JSON.parse(localStorage.getItem('kirby-shop-reviews') || '[]');
      setReviews(savedReviews);
      
      // 내 리뷰만 필터링
      const myReviewsData = savedReviews.filter(review => review.userId === user.id);
      setMyReviews(myReviewsData);
    } catch (error) {
      console.error('리뷰 로드 실패:', error);
    }
  };

  const loadPurchasedProducts = () => {
    try {
      // 주문 내역에서 구매한 상품들 가져오기
      const orders = JSON.parse(localStorage.getItem('kirby-shop-orders') || '[]');
      const userOrders = orders.filter(order => order.userId === user.id);
      
      const purchased = [];
      userOrders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            const existing = purchased.find(p => p.id === item.id);
            if (existing) {
              existing.quantity += item.quantity;
            } else {
              purchased.push({
                ...item,
                orderDate: order.createdAt,
                orderId: order.id
              });
            }
          });
        }
      });
      
      setPurchasedProducts(purchased);
    } catch (error) {
      console.error('구매 상품 로드 실패:', error);
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setReviewForm(prev => ({
            ...prev,
            images: [...prev.images, {
              id: Date.now() + Math.random(),
              file: file,
              url: e.target.result,
              name: file.name
            }]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleVideoUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setReviewForm(prev => ({
            ...prev,
            videos: [...prev.videos, {
              id: Date.now() + Math.random(),
              file: file,
              url: e.target.result,
              name: file.name
            }]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeMedia = (type, id) => {
    setReviewForm(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
  };

  const handleSubmitReview = () => {
    if (!selectedProduct || !reviewForm.title || !reviewForm.content) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const newReview = {
      id: Date.now(),
      userId: user.id,
      userName: user.name,
      userProfileImage: user.profileImage,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: selectedProduct.image,
      rating: reviewForm.rating,
      title: reviewForm.title,
      content: reviewForm.content,
      images: reviewForm.images,
      videos: reviewForm.videos,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    try {
      const existingReviews = JSON.parse(localStorage.getItem('kirby-shop-reviews') || '[]');
      const updatedReviews = [...existingReviews, newReview];
      localStorage.setItem('kirby-shop-reviews', JSON.stringify(updatedReviews));
      
      setReviews(updatedReviews);
      setMyReviews([...myReviews, newReview]);
      
      // 폼 초기화
      setReviewForm({
        rating: 5,
        title: '',
        content: '',
        images: [],
        videos: []
      });
      setSelectedProduct(null);
      setShowReviewModal(false);
      
      // 리뷰 업데이트 이벤트 발생
      window.dispatchEvent(new CustomEvent('reviewUpdated'));
      
      alert('리뷰가 성공적으로 작성되었습니다!');
    } catch (error) {
      console.error('리뷰 저장 실패:', error);
      alert('리뷰 작성 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      try {
        const updatedReviews = reviews.filter(review => review.id !== reviewId);
        localStorage.setItem('kirby-shop-reviews', JSON.stringify(updatedReviews));
        setReviews(updatedReviews);
        setMyReviews(myReviews.filter(review => review.id !== reviewId));
        
        // 리뷰 업데이트 이벤트 발생
        window.dispatchEvent(new CustomEvent('reviewUpdated'));
        
        alert('리뷰가 삭제되었습니다.');
      } catch (error) {
        console.error('리뷰 삭제 실패:', error);
        alert('리뷰 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={20}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const renderWriteReview = () => (
    <div className="review-write-section">
      <h2>리뷰 작성</h2>
      <p>구매하신 상품에 대한 리뷰를 작성해주세요.</p>
      
      <div className="product-selection">
        <h3>상품 선택</h3>
        <div className="purchased-products">
          {purchasedProducts.length === 0 ? (
            <div className="no-products">
              <Package size={48} />
              <p>구매한 상품이 없습니다.</p>
              <button onClick={() => navigate('/')} className="btn-primary">
                쇼핑하러 가기
              </button>
            </div>
          ) : (
            purchasedProducts.map(product => (
              <div 
                key={product.id} 
                className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => setSelectedProduct(product)}
              >
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p>구매일: {new Date(product.orderDate).toLocaleDateString()}</p>
                  <p>수량: {product.quantity}개</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedProduct && (
        <div className="review-form">
          <h3>리뷰 작성</h3>
          
          <div className="form-group">
            <label>별점</label>
            {renderStars(reviewForm.rating, true, (rating) => 
              setReviewForm(prev => ({ ...prev, rating }))
            )}
          </div>

          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="리뷰 제목을 입력하세요"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea
              value={reviewForm.content}
              onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="상품에 대한 솔직한 후기를 작성해주세요"
              rows={6}
              maxLength={1000}
            />
            <div className="char-count">{reviewForm.content.length}/1000</div>
          </div>

          <div className="form-group">
            <label>사진 첨부</label>
            <div className="media-upload">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="image-upload" className="upload-btn">
                <Camera size={20} />
                사진 추가
              </label>
              <div className="media-preview">
                {reviewForm.images.map(image => (
                  <div key={image.id} className="media-item">
                    <img src={image.url} alt={image.name} />
                    <button onClick={() => removeMedia('images', image.id)} className="remove-btn">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>동영상 첨부</label>
            <div className="media-upload">
              <input
                type="file"
                id="video-upload"
                accept="video/*"
                multiple
                onChange={handleVideoUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="video-upload" className="upload-btn">
                <Video size={20} />
                동영상 추가
              </label>
              <div className="media-preview">
                {reviewForm.videos.map(video => (
                  <div key={video.id} className="media-item">
                    <video src={video.url} controls />
                    <button onClick={() => removeMedia('videos', video.id)} className="remove-btn">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button onClick={() => setSelectedProduct(null)} className="btn-secondary">
              취소
            </button>
            <button onClick={handleSubmitReview} className="btn-primary">
              리뷰 작성
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderMyReviews = () => (
    <div className="my-reviews-section">
      <h2>내 리뷰 관리</h2>
      <p>작성하신 리뷰를 관리할 수 있습니다.</p>
      
      {myReviews.length === 0 ? (
        <div className="no-reviews">
          <MessageCircle size={48} />
          <p>작성한 리뷰가 없습니다.</p>
          <button onClick={() => setActiveTab('write')} className="btn-primary">
            리뷰 작성하기
          </button>
        </div>
      ) : (
        <div className="reviews-list">
          {myReviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="product-info">
                  <img src={review.productImage} alt={review.productName} />
                  <div>
                    <h4>{review.productName}</h4>
                    <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="review-actions">
                  <button className="btn-small">
                    <Edit3 size={16} />
                    수정
                  </button>
                  <button 
                    onClick={() => handleDeleteReview(review.id)}
                    className="btn-small delete"
                  >
                    <Trash2 size={16} />
                    삭제
                  </button>
                </div>
              </div>
              
              <div className="review-content">
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                <h3>{review.title}</h3>
                <p>{review.content}</p>
                
                {review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((image, index) => (
                      <img key={index} src={image.url} alt={`리뷰 이미지 ${index + 1}`} />
                    ))}
                  </div>
                )}
                
                {review.videos.length > 0 && (
                  <div className="review-videos">
                    {review.videos.map((video, index) => (
                      <video key={index} src={video.url} controls />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="review-stats">
                <span><ThumbsUp size={16} /> {review.likes}</span>
                <span><MessageCircle size={16} /> {review.comments.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAllReviews = () => (
    <div className="all-reviews-section">
      <h2>전체 리뷰</h2>
      <p>다른 고객들의 리뷰를 확인해보세요.</p>
      
      {reviews.length === 0 ? (
        <div className="no-reviews">
          <MessageCircle size={48} />
          <p>아직 작성된 리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="user-info">
                  <img 
                    src={review.userProfileImage || '/default-avatar.png'} 
                    alt={review.userName}
                    className="user-avatar"
                  />
                  <div>
                    <h4>{review.userName}</h4>
                    <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="product-info">
                  <img src={review.productImage} alt={review.productName} />
                  <span>{review.productName}</span>
                </div>
              </div>
              
              <div className="review-content">
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
                <h3>{review.title}</h3>
                <p>{review.content}</p>
                
                {review.images.length > 0 && (
                  <div className="review-images">
                    {review.images.map((image, index) => (
                      <img key={index} src={image.url} alt={`리뷰 이미지 ${index + 1}`} />
                    ))}
                  </div>
                )}
                
                {review.videos.length > 0 && (
                  <div className="review-videos">
                    {review.videos.map((video, index) => (
                      <video key={index} src={video.url} controls />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="review-stats">
                <button className="like-btn">
                  <ThumbsUp size={16} /> {review.likes}
                </button>
                <span><MessageCircle size={16} /> {review.comments.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!user) {
    return (
      <div className="review-page-container">
        <Header />
        <div className="login-required">
          <h2>로그인이 필요합니다</h2>
          <p>리뷰를 작성하려면 로그인해주세요.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            로그인하기
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="review-page-container">
      <Header />
      <div className="review-page-content">
        <div className="review-header">
          <h1>리뷰 관리</h1>
          <p>상품에 대한 솔직한 후기를 공유해보세요</p>
        </div>

        <div className="review-tabs">
          <button 
            className={`tab-button ${activeTab === 'write' ? 'active' : ''}`}
            onClick={() => setActiveTab('write')}
          >
            <Edit3 size={20} />
            리뷰 작성
          </button>
          <button 
            className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
            onClick={() => setActiveTab('my')}
          >
            <User size={20} />
            내 리뷰
          </button>
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <MessageCircle size={20} />
            전체 리뷰
          </button>
        </div>

        <div className="review-content">
          {activeTab === 'write' && renderWriteReview()}
          {activeTab === 'my' && renderMyReviews()}
          {activeTab === 'all' && renderAllReviews()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewPage;
