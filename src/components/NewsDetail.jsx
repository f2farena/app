import React, { useState, useEffect } from 'react';  // Thêm useEffect
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

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null); // Thay hardcode
  const [comments, setComments] = useState([]); // Thay hardcode comments
  const [activeTab, setActiveTab] = useState('pk-review'); // Giữ
  const [newComment, setNewComment] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    console.log('NewsDetail mounted, fetching id:', id);  // Log để check component load OK
    const fetchBrokerDetail = async () => {
        const cacheKey = `broker_detail_${id}`;  // Key động theo id
        console.log(`Checking sessionStorage for ${cacheKey}`);  // Log: Kiểm tra trước khi fetch
        const cachedDetail = sessionStorage.getItem(cacheKey);
        if (cachedDetail) {
          console.log(`Using cached broker detail for id ${id} from sessionStorage`);
          const parsedData = JSON.parse(cachedDetail);
          setArticle(parsedData);
          return;
        }
        try {
            const response = await fetch(`http://localhost:8000/api/brokers/${id}`);
            console.log('Fetch broker detail response status:', response.status);  // Log mới: Check status
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched broker detail:', data); // Log
            const articleData = {
            id: data.id,
            style: 'broker-review',
            title: `Broker ${data.broker_name} Review: Is It Reliable?`,
            date: '10/06/2025', // Giữ hardcode hoặc thêm field ở backend
            author: 'TradeChallenge Team',
            summary: data.description,
            thumbnail: `http://localhost:8000/${data.thumbnail}`,  // Prepend URL
            content: data.pk_review,
            ratings: { license: data.star_1, insurance: data.star_2, localization: data.star_3, commission: data.star_4, stability: data.star_5, onboarding: data.star_6 }
            };
            setArticle(articleData);
            sessionStorage.setItem(cacheKey, JSON.stringify(articleData));  // Lưu cache với key động
            console.log(`Stored broker detail for id ${id} to sessionStorage`);
        } catch (error) {
            console.error('Error fetching broker detail:', error);
        }
    };

    const fetchComments = async () => {
      const cacheKey = `comments_${id}`;  // Key động theo id
      console.log(`Checking sessionStorage for ${cacheKey}`);  // Log: Kiểm tra trước khi fetch
      const cachedComments = sessionStorage.getItem(cacheKey);
      if (cachedComments) {
        console.log(`Using cached comments for id ${id} from sessionStorage`);
        const parsedData = JSON.parse(cachedComments);
        setComments(parsedData);
        return;
      }
      try {
        const response = await fetch(`http://localhost:8000/api/trader_reviews/${id}`);
        const data = await response.json();
        console.log('Fetched comments:', data); // Log
        const commentsData = data.list_comments.map(c => ({
          id: c.id,
          username: c.username,
          content: c.comment,
          timestamp: c.created_at
        }));
        setComments(commentsData);
        sessionStorage.setItem(cacheKey, JSON.stringify(commentsData));  // Lưu cache với key động
        console.log(`Stored comments for id ${id} to sessionStorage`);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchBrokerDetail();
    fetchComments();
  }, [id]); // Fetch khi id thay đổi

  if (!article) {
    return (
      <div className="page-padding" style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
        <h2>Loading Article...</h2>  // Thêm loading để tránh null error
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

  const confirmComment = () => {
    const newCommentObj = {
      id: comments.length + 1,
      username: 'Guest', 
      content: newComment.trim(),
      timestamp: new Date().toLocaleString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    setComments([...comments, newCommentObj]);
    setNewComment('');
    setShowConfirmation(false);
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
                src={`http://localhost:8000/${article.logo}`}  // Prepend
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
            {comments.length === 0 ? (
              <p className="no-comments" style={{ color: 'var(--color-secondary-text)' }}>
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment-card card">
                  <div className="comment-header">
                    <span className="comment-username">{comment.username}</span>
                    <span className="comment-timestamp">{comment.timestamp}</span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))
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