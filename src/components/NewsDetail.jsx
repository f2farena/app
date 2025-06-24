import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Giả lập dữ liệu bài tin tức với bình luận
const newsArticles = [
    { 
      id: 3, 
      style: 'broker-review', 
      title: 'Broker GO MARKETS Review: Is It Reliable?', 
      date: '10/06/2025', 
      author: 'TradeChallenge Team', 
      summary: 'A deep dive into EX-T broker, evaluating licenses, fees, and platform stability for traders.', 
      thumbnail: 'https://i.ytimg.com/vi/wOsceV5XQjg/maxresdefault.jpg', 
      content: 'GO Markets has been a fantastic choice for my trading journey! Established in 2006, this broker long track record and regulation by top-tier authorities like ASIC and CySEC give me confidence in its reliability. The tight spreads, starting from 0.0 pips on the GO Plus+ account, and fast execution speeds make trading cost-effective and seamless, especially for forex and CFDs. I love the variety of platforms—MT4, MT5, and cTrader—offering flexibility for both beginners and pros. Their educational resources, like webinars and trading guides, are a standout, helping me sharpen my strategies. Deposits and withdrawals are hassle-free with no fees, and the 24/5 customer support is always responsive and knowledgeable. The demo account is a great touch for practicing without risk. GO Markets truly combines trustworthiness with convenience, making it a top pick for traders',
      ratings: {
        license: 5,
        insurance: 4,
        localization: 5,
        commission: 4,
        stability: 5,
        onboarding: 4
      },
      comments: [
        { id: 1, username: 'ProTrader', content: 'Great review! Ive been using Go Markets and agree with the stability point.', timestamp: '10/06/2025 08:50 AM' },
        { id: 2, username: 'BeginnerFX', content: 'Wish they had more tutorials for newbies.', timestamp: '10/06/2025 09:30 AM' },
        { id: 3, username: 'MarketMogul', content: 'Low spreads are a big plus. Thanks for the detailed analysis!', timestamp: '10/06/2025 10:10 AM' },
      ]
    },
    { 
      id: 4, 
      style: 'broker-review', 
      title: 'Is FX-Pro a Good Choice for Beginners?', 
      date: '12/06/2025', 
      author: 'TradeChallenge Team', 
      summary: 'We examine FX-Pro broker focusing on ease of account opening and local support for new traders.', 
      thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx36-olMGbgJiWiei0Qoy5bJfeDq_NuvtYqg&s',
      content: 'FX-Pro has long been a household name in the forex industry, but is it the ideal choice for those just starting out? Our review focuses specifically on the beginner experience. The account opening process is remarkably straightforward, taking less than 10 minutes to complete with clear, step-by-step instructions. Their customer support is another strong point, offering 24/5 assistance in multiple languages, including dedicated local support for many regions. While their platform offers advanced features that might overwhelm a newcomer, they also provide a simplified interface and a wealth of demo account options. The commission structure can be slightly higher than some discount brokers, but the overall package of support and reliability makes it a strong contender for anyone new to trading.',
      ratings: {
        license: 4,
        insurance: 3,
        localization: 5,
        commission: 3,
        stability: 4,
        onboarding: 5
      },
      comments: [
        { id: 1, username: 'NewbieTrader', content: 'Thanks for this! Just opened an account with FX-Pro.', timestamp: '12/06/2025 07:40 AM' },
        { id: 2, username: 'SupportSeeker', content: 'Their support team is really helpful, confirmed!', timestamp: '12/06/2025 08:15 AM' },
      ]
    }
];

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
  const article = newsArticles.find(article => article.id === parseInt(id));
  const [comments, setComments] = useState(article?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!article) {
    return (
      <div className="page-padding" style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
        <h2>Article Not Found</h2>
        <p>No article found with ID {id}.</p>
        <button className="btn btn-primary" onClick={() => navigate('/news')}>
          Back to News
        </button>
      </div>
    );
  }

  // Tính toán điểm trung bình nếu là broker review
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

  // Xử lý gửi bình luận
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setShowConfirmation(true);
  };

  const confirmComment = () => {
    const newCommentObj = {
      id: comments.length + 1,
      username: 'Guest', // Trong thực tế, lấy từ thông tin người dùng đã đăng nhập
      content: newComment.trim(),
      timestamp: new Date().toLocaleString('en-US', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
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
          onError={(e) => (e.target.src = 'https://placehold.co/500x220?text=Image+Error')}
        />
        <button onClick={() => navigate('/news')} className="detail-back-button" aria-label="Back to News">
          <svg fill="var(--color-text)" viewBox="0 0 24 24" width="20" height="20">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="page-padding">
        <h3 className="news-title">{article.title}</h3>
        <p className="news-detail-author" style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', marginBottom: '1.5rem' }}>
          By {article.author} - {article.date}
        </p>
        
        {/* Phần giao diện cho Broker Review */}
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

        {/* Phần bình luận */}
        <div className="comments-section" style={{ marginTop: '2rem' }}>
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

          {/* Form nhập bình luận */}
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
      </div>

      {/* Modal xác nhận */}
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