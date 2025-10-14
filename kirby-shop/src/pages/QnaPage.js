import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import '../styles/QnaPage.css';

// API 기본 URL
const API_BASE_URL = 'http://localhost:8000';

const QnAPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    content: '',
    category: 'general',
    isPrivate: false
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const [faqs, setFaqs] = useState([
    {
      id: 1,
      category: 'order',
      question: '주문은 어떻게 하나요?',
      answer: '상품을 장바구니에 담고 주문하기 버튼을 클릭하여 주문서를 작성하신 후 결제하시면 됩니다.',
      views: 1250,
      helpful: 89
    },
    {
      id: 2,
      category: 'payment',
      question: '어떤 결제 방법을 지원하나요?',
      answer: '카카오페이, 네이버페이, 이니시스, 토스페이 등 다양한 결제 방법을 지원합니다.',
      views: 980,
      helpful: 67
    },
    {
      id: 3,
      category: 'delivery',
      question: '배송은 얼마나 걸리나요?',
      answer: '일반적으로 주문 후 2-3일 내에 배송됩니다. 지역에 따라 차이가 있을 수 있습니다.',
      views: 756,
      helpful: 45
    },
    {
      id: 4,
      category: 'return',
      question: '반품/교환은 어떻게 하나요?',
      answer: '상품 수령 후 7일 이내에 고객센터로 연락주시면 반품/교환 절차를 안내해드립니다.',
      views: 634,
      helpful: 38
    },
    {
      id: 5,
      category: 'account',
      question: '회원가입은 필수인가요?',
      answer: '회원가입을 하시면 주문 내역 조회, 위시리스트 저장 등 다양한 혜택을 받으실 수 있습니다.',
      views: 892,
      helpful: 56
    },
    {
      id: 6,
      category: 'general',
      question: '쿠폰은 어떻게 사용하나요?',
      answer: '주문 페이지에서 쿠폰 적용하기 버튼을 클릭하여 보유하신 쿠폰을 선택하시면 됩니다.',
      views: 445,
      helpful: 23
    }
  ]);

  const [userQuestions, setUserQuestions] = useState([
    {
      id: 101,
      title: '배송지 변경이 가능한가요?',
      content: '주문 후 배송지 변경이 가능한지 궁금합니다.',
      category: 'delivery',
      status: 'answered',
      answer: '주문 후 배송지 변경은 배송 준비가 시작되기 전까지만 가능합니다.',
      createdAt: '2024-12-15',
      views: 23
    },
    {
      id: 102,
      title: '상품 재입고 예정일 문의',
      content: '커비 인형이 언제 재입고되는지 알고 싶습니다.',
      category: 'product',
      status: 'pending',
      answer: null,
      createdAt: '2024-12-14',
      views: 15
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'order', name: '주문/결제', icon: '🛒' },
    { id: 'delivery', name: '배송', icon: '🚚' },
    { id: 'return', name: '반품/교환', icon: '↩️' },
    { id: 'account', name: '회원정보', icon: '👤' },
    { id: 'product', name: '상품', icon: '🛍️' },
    { id: 'general', name: '기타', icon: '❓' }
  ];

  const tabs = [
    { id: 'faq', label: '자주 묻는 질문', icon: '❓' },
    { id: 'questions', label: '문의하기', icon: '💬' },
    { id: 'my-questions', label: '내 문의내역', icon: '📝' }
  ];

  // API 호출 함수들
  const fetchUserQuestions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('kirby-shop-token');
      
      if (!token) {
        console.warn('토큰이 없습니다. 더미 데이터만 표시합니다.');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/qna/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const questions = await response.json();
        // 더미 데이터와 API 데이터를 합치기
        const combinedQuestions = [...questions, ...userQuestions.filter(q => q.id > 100)];
        setUserQuestions(combinedQuestions);
      } else {
        throw new Error('문의내역을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user questions:', err);
      // API 실패 시 더미 데이터만 표시
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionData) => {
    try {
      const token = localStorage.getItem('kirby-shop-token');
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      // console.log('토큰 확인:', token);
      // console.log('문의 데이터:', questionData);
      
      const response = await fetch(`${API_BASE_URL}/api/qna/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(questionData)
      });
      
      // console.log('응답 상태:', response.status);
      
      if (response.ok) {
        const newQuestion = await response.json();
        setUserQuestions(prev => [newQuestion, ...prev]);
        return newQuestion;
      } else {
        const errorData = await response.json();
        // console.error('API 에러:', errorData);
        throw new Error(errorData.detail || '문의 등록에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
      // console.error('Error creating question:', err);
      throw err;
    }
  };

  const createQuestionWithImages = async (questionData, images) => {
    try {
      const token = localStorage.getItem('kirby-shop-token');
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      console.log('이미지 업로드 토큰 확인:', token);
      console.log('이미지 업로드 문의 데이터:', questionData);
      console.log('이미지 파일들:', images);
      
      const formData = new FormData();
      
      formData.append('title', questionData.title);
      formData.append('content', questionData.content);
      formData.append('category', questionData.category);
      formData.append('is_private', questionData.is_private);
      if (questionData.product_id) {
        formData.append('product_id', questionData.product_id);
      }
      
      // 이미지 파일 추가
      images.forEach((image, index) => {
        formData.append('images', image);
      });
      
      const response = await fetch(`${API_BASE_URL}/api/qna/with-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('이미지 업로드 응답 상태:', response.status);
      
      if (response.ok) {
        const newQuestion = await response.json();
        setUserQuestions(prev => [newQuestion, ...prev]);
        return newQuestion;
      } else {
        const errorData = await response.json();
        console.error('이미지 업로드 API 에러:', errorData);
        throw new Error(errorData.detail || '문의 등록에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error creating question with images:', err);
      throw err;
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      const token = localStorage.getItem('kirby-shop-token');
      
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/qna/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // 성공적으로 삭제된 경우 목록에서 제거
        setUserQuestions(prev => prev.filter(q => q.id !== questionId));
        alert('문의가 삭제되었습니다.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || '문의 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      alert(`문의 삭제에 실패했습니다: ${err.message}`);
    }
  };

  // 컴포넌트 마운트 시 사용자 문의내역 로드
  useEffect(() => {
    console.log('QnaPage 마운트됨, 사용자:', user);
    console.log('토큰 상태:', localStorage.getItem('kirby-shop-token'));
    if (user) {
      fetchUserQuestions();
    }
  }, [user]);

  // 더미 데이터를 위한 로컬 스토리지 동기화
  useEffect(() => {
    const savedQuestions = localStorage.getItem('userQuestions');
    if (savedQuestions && user) {
      try {
        const parsed = JSON.parse(savedQuestions);
        setUserQuestions(prev => {
          const apiQuestions = prev.filter(q => q.id <= 100);
          const dummyQuestions = parsed.filter(q => q.id > 100);
          return [...apiQuestions, ...dummyQuestions];
        });
      } catch (err) {
        console.error('Error parsing saved questions:', err);
      }
    }
  }, [user]);

  // userQuestions 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (user) {
      const dummyQuestions = userQuestions.filter(q => q.id > 100);
      localStorage.setItem('userQuestions', JSON.stringify(dummyQuestions));
    }
  }, [userQuestions, user]);

  // 이미지 처리 함수들
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('이미지는 최대 5개까지 업로드할 수 있습니다.');
      return;
    }
    
    setSelectedImages(files);
    
    // 미리보기 생성
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreview(newPreviews);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!newQuestion.title.trim() || !newQuestion.content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    console.log('현재 사용자:', user);
    console.log('토큰 확인:', localStorage.getItem('kirby-shop-token'));

    try {
      setLoading(true);
      const questionData = {
        title: newQuestion.title,
        content: newQuestion.content,
        category: newQuestion.category,
        is_private: newQuestion.isPrivate,
        product_id: null // 일반 문의이므로 null
      };

      console.log('제출할 문의 데이터:', questionData);
      console.log('선택된 이미지 개수:', selectedImages.length);

      // 이미지가 있으면 이미지와 함께 생성, 없으면 일반 생성
      if (selectedImages.length > 0) {
        console.log('이미지와 함께 문의 등록 시도');
        await createQuestionWithImages(questionData, selectedImages);
      } else {
        console.log('일반 문의 등록 시도');
        await createQuestion(questionData);
      }
      
      setNewQuestion({ title: '', content: '', category: 'general', isPrivate: false });
      setSelectedImages([]);
      setImagePreview([]);
      setShowQuestionForm(false);
      alert('문의가 등록되었습니다. 빠른 시일 내에 답변드리겠습니다.');
    } catch (err) {
      console.error('문의 등록 실패:', err);
      alert(`문의 등록에 실패했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderFAQ = () => (
    <div className="qna-content">
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="궁금한 내용을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="faq-list">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map(faq => (
            <div key={faq.id} className="faq-item">
              <div className="faq-header">
                <div className="faq-category">
                  {categories.find(cat => cat.id === faq.category)?.icon} 
                  {categories.find(cat => cat.id === faq.category)?.name}
                </div>
                <div className="faq-stats">
                  <span className="stat-item">👁️ {faq.views}</span>
                  <span className="stat-item">👍 {faq.helpful}</span>
                </div>
              </div>
              <h3 className="faq-question">{faq.question}</h3>
              <p className="faq-answer">{faq.answer}</p>
              <div className="faq-actions">
                <button className="action-btn">도움이 되었어요</button>
                <button className="action-btn">공유하기</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>검색 결과가 없습니다</h3>
            <p>다른 키워드로 검색해보시거나 카테고리를 변경해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuestionForm = () => (
    <div className="qna-content">
      <div className="question-form-section">
        <h3>문의하기</h3>
        <p>궁금한 점이 있으시면 언제든지 문의해주세요. 빠른 시일 내에 답변드리겠습니다.</p>
        
        {!user ? (
          <div className="login-required">
            <div className="login-icon">🔒</div>
            <h4>로그인이 필요합니다</h4>
            <p>문의를 등록하려면 로그인이 필요합니다.</p>
            <button className="login-btn">로그인하기</button>
          </div>
        ) : (
          <form onSubmit={handleSubmitQuestion} className="question-form">
            <div className="form-group">
              <label htmlFor="title">제목 *</label>
              <input
                type="text"
                id="title"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                placeholder="문의 제목을 입력해주세요"
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">카테고리 *</label>
              <select
                id="category"
                value={newQuestion.category}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, category: e.target.value }))}
                className="form-select"
                required
              >
                {categories.filter(cat => cat.id !== 'all').map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="content">내용 *</label>
              <textarea
                id="content"
                value={newQuestion.content}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, content: e.target.value }))}
                placeholder="문의 내용을 자세히 입력해주세요"
                className="form-textarea"
                rows="6"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="images">이미지 첨부 (선택사항)</label>
              <div className="image-upload-section">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="image-input"
                />
                <label htmlFor="images" className="image-upload-btn">
                  📷 이미지 선택 (최대 5개)
                </label>
                <p className="image-upload-hint">JPG, PNG, GIF, WebP 형식만 지원됩니다. (최대 10MB)</p>
              </div>
              
              {imagePreview.length > 0 && (
                <div className="image-preview-section">
                  <h4>선택된 이미지 ({imagePreview.length}/5)</h4>
                  <div className="image-preview-grid">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="image-preview-item">
                        <img src={preview} alt={`미리보기 ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newQuestion.isPrivate}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, isPrivate: e.target.checked }))}
                />
                <span className="checkmark"></span>
                비공개 문의 (관리자만 볼 수 있습니다)
              </label>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowQuestionForm(false)}>
                취소
              </button>
              <button type="submit" className="btn-primary">
                문의 등록
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  const renderMyQuestions = () => (
    <div className="qna-content">
      <div className="my-questions-section">
        <h3>내 문의내역</h3>
        <p>등록하신 문의와 답변을 확인하실 수 있습니다.</p>
        
        {!user ? (
          <div className="login-required">
            <div className="login-icon">🔒</div>
            <h4>로그인이 필요합니다</h4>
            <p>문의내역을 확인하려면 로그인이 필요합니다.</p>
            <button className="login-btn">로그인하기</button>
          </div>
        ) : (
          <div className="questions-list">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner">⏳</div>
                <p>문의내역을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="error">
                <div className="error-icon">❌</div>
                <p>{error}</p>
                <button onClick={fetchUserQuestions} className="retry-btn">다시 시도</button>
              </div>
            ) : userQuestions.length > 0 ? (
              userQuestions.map(question => (
                <div key={question.id} className="question-item">
                  <div className="question-header">
                    <div className="question-category">
                      {categories.find(cat => cat.id === question.category)?.icon} 
                      {categories.find(cat => cat.id === question.category)?.name}
                    </div>
                    <div className="question-status">
                      <span className={`status-badge ${question.status}`}>
                        {question.status === 'answered' ? '답변완료' : '답변대기'}
                      </span>
                    </div>
                  </div>
                  <h4 className="question-title">{question.title}</h4>
                  <p className="question-content">{question.content}</p>
                  
                  {/* 이미지 표시 */}
                  {question.images && question.images.length > 0 && (
                    <div className="question-images">
                      <h5>첨부 이미지</h5>
                      <div className="image-gallery">
                        {question.images.map((imageUrl, index) => (
                          <div key={index} className="image-item">
                            <img 
                              src={`${API_BASE_URL}${imageUrl}`} 
                              alt={`첨부 이미지 ${index + 1}`}
                              onClick={() => window.open(`${API_BASE_URL}${imageUrl}`, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {question.answer && (
                    <div className="answer-section">
                      <h5>답변</h5>
                      <p className="answer-content">{question.answer}</p>
                    </div>
                  )}
                  {question.answers && question.answers.length > 0 && (
                    <div className="answer-section">
                      <h5>답변</h5>
                      {question.answers.map(answer => (
                        <p key={answer.id} className="answer-content">{answer.content}</p>
                      ))}
                    </div>
                  )}
                  <div className="question-footer">
                    <div className="question-info">
                      <span className="question-date">
                        {question.created_at ? new Date(question.created_at).toLocaleDateString() : question.createdAt}
                      </span>
                      <span className="question-views">👁️ {question.views || 0}</span>
                    </div>
                    <div className="question-actions">
                      {question.status === 'pending' ? (
                        <button 
                          className="btn-delete"
                          onClick={() => {
                            if (window.confirm('정말로 이 문의를 삭제하시겠습니까?\n삭제된 문의는 복구할 수 없습니다.')) {
                              deleteQuestion(question.id);
                            }
                          }}
                          title="문의 삭제"
                        >
                          🗑️ 삭제
                        </button>
                      ) : (
                        <span 
                          className="delete-disabled"
                          title="답변이 완료된 문의는 삭제할 수 없습니다"
                        >
                          🔒 삭제불가
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-questions">
                <div className="no-questions-icon">📝</div>
                <h4>등록된 문의가 없습니다</h4>
                <p>궁금한 점이 있으시면 문의해주세요.</p>
                <button 
                  className="btn-primary"
                  onClick={() => setActiveTab('questions')}
                >
                  문의하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'faq': return renderFAQ();
      case 'questions': return renderQuestionForm();
      case 'my-questions': return renderMyQuestions();
      default: return renderFAQ();
    }
  };

  return (
    <div className="page-container qna-page">
      <Header />
      <div className="page-content">
        <main className="qna-main">
          <div className="qna-header">
            <h1 className="page-title">고객센터</h1>
            <p className="page-subtitle">궁금한 점을 해결해드립니다</p>
          </div>
          
          <div className="qna-tabs">
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
          
          <div className="qna-body">
            {renderContent()}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default QnAPage;
