import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="stars-container">
      {[...Array(fullStars)].map((_, i) => <span key={`full-${i}`} className="star full">★</span>)}
      {halfStar && <span key="half" className="star half">★</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`empty-${i}`} className="star empty">☆</span>)}
    </div>
  );
};

const NewsDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [activeTab, setActiveTab] = useState('pk-review');
  const [newComment, setNewComment] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const loadingRef = useRef(null);

  // === Start: Tách các useEffect ra ===

  // 1. useEffect để fetch chi tiết Broker (chỉ chạy khi `id` thay đổi)
  useEffect(() => {
    console.log('NewsDetail mounted, fetching id:', id);
    const fetchBrokerDetail = async () => {
      const cacheKey = `broker_detail_${id}`;
      console.log(`Checking sessionStorage for ${cacheKey}`);
      const cachedDetail = sessionStorage.getItem(cacheKey);
      if (cachedDetail) {
        console.log(`Using cached broker detail for id ${id} from sessionStorage`);
        const parsedData = JSON.parse(cachedDetail);
        setArticle(parsedData);
        return;
      }
      try {
        const response = await fetch(`https://f2farena.com/api/brokers/${id}`);
        console.log('Fetch broker detail response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched broker detail:', data);
        const articleData = {
          id: data.id,
          style: 'broker-review',
          title: `Broker ${data.broker_name} Review: Is It Reliable?`,
          date: '10/06/2025', // Giữ hardcode hoặc thêm field ở backend
          author: 'TradeChallenge Team',
          summary: data.description,
          thumbnail: data.thumbnail,
          content: data.pk_review,
          ratings: { license: data.star_1, insurance: data.star_2, localization: data.star_3, commission: data.star_4, stability: data.star_5, onboarding: data.star_6 }
        };
        setArticle(articleData);
        sessionStorage.setItem(cacheKey, JSON.stringify(articleData));
        console.log(`Stored broker detail for id ${id} to sessionStorage`);
      } catch (error) {
        console.error('Error fetching broker detail:', error);
      }
    };
    fetchBrokerDetail();
  }, [id]);

  // 2. Hàm fetchComments, được định nghĩa bên ngoài useEffect để có thể gọi lại nhiều lần
  const fetchComments = async (currentOffset) => {
    if (!id) return; // Đảm bảo có ID trước khi fetch comments
    if (!hasMoreComments && currentOffset > 0) return;
    try {
      const response = await fetch(`https://f2farena.com/api/trader_reviews/${id}?offset=${currentOffset}&limit=10`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched comments:', data);

      const commentsData = data.list_comments.map(c => ({
        id: c.id,
        username: c.username,
        content: c.comment,
        timestamp: c.created_at
      }));

      setComments(prevComments => {
        return currentOffset === 0 ? commentsData : [...prevComments, ...commentsData];
      });
      setOffset(currentOffset + commentsData.length);
      setHasMoreComments(commentsData.length === 10); // Nếu số lượng trả về ít hơn 10, tức là không còn data

    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // 3. useEffect để khởi tạo và reset comments khi `id` thay đổi hoặc tab chuyển sang 'trader-reviews'
  useEffect(() => {
    const initializeComments = async () => { // Tạo một hàm async bên trong
      if (activeTab === 'trader-reviews' || id) {
        setComments([]);
        setOffset(0);
        setHasMoreComments(true);
        await fetchComments(0); // Giờ có thể dùng await
      }
    };

    initializeComments(); // Gọi hàm async này
  }, [id, activeTab]);

  // 4. useEffect cho Intersection Observer (infinite scrolling)
  useEffect(() => {
    if (!loadingRef.current || !id || activeTab !== 'trader-reviews') return; // Chỉ kích hoạt khi ở tab đúng và có ID

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreComments) {
        fetchComments(offset);
      }
    }, { threshold: 1.0 });

    observer.observe(loadingRef.current);

    return () => {
      if (loadingRef.current) {
        observer.unobserve(loadingRef.current);
      }
    };
  }, [offset, hasMoreComments, id, activeTab]);

  if (!article) {
    return (
      <div className="page-padding" style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
        <h2>Loading Article...</h2> 
      </div>
    );
  }

  const averageRating = article.style === 'broker-review' 
    ? (Object.values(article.ratings).reduce((sum, val) => sum + val, 0) / Object.keys(article.ratings).length).toFixed(1)
    : 0;

  const ratingCriteria = {
    license: "License & Regulation",
    insurance: "Fund Security",
    localization: "Localization & Support",
    commission: "Commissions & Fees",
    stability: "Platform Stability & Tools",
    onboarding: "Onboarding & Ease of Use"
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setShowConfirmation(true);
  };

  const confirmComment = async () => {
    if (!user || !user.telegram_id) {
      alert("Thông tin người dùng không có sẵn. Vui lòng đăng nhập.");
      setShowConfirmation(false);
      return;
    }

    try {
      const response = await fetch('https://f2farena.com/api/trader_reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker_id: parseInt(id), // Lấy broker_id từ useParams
          user_id: user.telegram_id, // Lấy user_id từ prop
          comment: newComment.trim(),
          vote: 5 // Bạn có thể thêm chức năng vote sau, tạm thời hardcode là 5 sao
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to post comment');
      }

      setNewComment('');
      setShowConfirmation(false);
      // Sau khi đăng thành công, reset và tải lại 10 bình luận đầu tiên
      setComments([]);
      setOffset(0);
      setHasMoreComments(true);
      fetchComments(0);
    } catch (error) {
      alert(`Lỗi khi đăng bình luận: ${error.message}`);
      console.error('Error posting comment:', error);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="news-detail-container" style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
        <div style={{ position: 'relative' }}>
            <img
                src={article.thumbnail}
                alt={article.title}
                className="news-detail-banner"
                style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                console.error(`Thumbnail error in detail: ${article.thumbnail}`);  // Log fail
                e.target.src = 'https://placehold.co/500x220?text=Image+Error';
                }}
                onLoad={() => console.log(`Thumbnail loaded in detail: ${article.thumbnail}`)}  // Log ok
            />
            {article.logo && (  // Nếu backend return logo field, add img (giả sử)
                <img
                src={article.logo} 
                alt="Broker Logo"
                style={{ position: 'absolute', top: '10px', left: '10px', width: '50px', height: '50px' }}  // Style tùy ý
                onError={(e) => console.error(`Logo error: ${article.logo}`)}
                onLoad={() => console.log(`Logo loaded: ${article.logo}`)}
                />
            )}
            <button onClick={() => navigate('/news')} className="detail-back-button" aria-label="Back to News">
                <svg fill="var(--color-text)" viewBox="0 0 24 24" width="20" height="20">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>

      <div className="page-padding">
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>
          <button 
            className={`btn ${activeTab === 'pk-review' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('pk-review')}
          >
            PK Team Review
          </button>
          <button 
            className={`btn ${activeTab === 'trader-reviews' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('trader-reviews')}
          >
            Trader Reviews
          </button>
        </div>
        
        {activeTab === 'pk-review' && (
          <>
            {article.style === 'broker-review' && (
              <div className="broker-ratings-container card">
                <div className="overall-rating">
                  <h4>Total rank: {averageRating} / 5.0</h4>
                  <StarRating rating={parseFloat(averageRating)} />
                </div>
                <div className="detailed-ratings">
                  {Object.entries(article.ratings).map(([key, value]) => (
                    <div key={key} className="rating-item">
                      <span className="rating-label">{ratingCriteria[key]}</span>
                      <StarRating rating={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="detail-page-content" style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {article.content}
              </p>
            </div>
          </>
        )}

        {activeTab === 'trader-reviews' && (
          <div className="comments-section">
            <h4 className="comments-title">Comments ({comments.length})</h4>
            {comments.length === 0 && !hasMoreComments && ( // Thêm điều kiện !hasMoreComments để chỉ hiển thị khi không còn comments và không còn gì để tải
              <p className="no-comments" style={{ color: 'var(--color-secondary-text)' }}>
                No comments yet. Be the first to comment!
              </p>
            )}
            {comments.map(comment => (
              <div key={comment.id} className="comment-card card">
                <div className="comment-header">
                  <span className="comment-username">{comment.username || 'Anonymous User'}</span>
                  <span className="comment-timestamp">{comment.timestamp ? new Date(comment.timestamp).toLocaleString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  }) : 'N/A'}</span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
            {hasMoreComments && ( // Chỉ hiển thị div này nếu còn comments để tải
              <div ref={loadingRef} style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-secondary-text)' }}>
                Loading more comments...
              </div>
            )}
            <form className="comment-form card" onSubmit={handleCommentSubmit} style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="comment-input">Add a Comment</label>
                <textarea
                  id="comment-input"
                  className="form-input"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  rows="4"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Post Comment
              </button>
            </form>
          </div>
        )}
      </div>

      {showConfirmation && (
        <>
          <div className="confirmation-overlay" onClick={() => setShowConfirmation(false)}></div>
          <div className="confirmation-modal card">
            <h4>Confirm Comment</h4>
            <p>Are you sure you want to post this comment?</p>
            <p style={{ fontStyle: 'italic', color: 'var(--color-secondary-text)', margin: '1rem 0' }}>
              "{newComment}"
            </p>
            <div className="confirmation-buttons">
              <button className="btn btn-secondary" onClick={() => setShowConfirmation(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmComment}>
                Confirm
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NewsDetail;