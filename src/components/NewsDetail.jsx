import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Giả lập dữ liệu bài tin tức
// Dữ liệu này phải khớp với dữ liệu trong App.jsx
const newsArticles = [
    { 
      id: 1, 
      style: 'news', 
      title: 'Summer Challenge: Double Your Account!', 
      date: '05/06/2025', 
      author: 'Admin', 
      summary: 'Join our special challenge event with exciting rewards for top traders.', 
      thumbnail: 'https://forexpropreviews.com/wp-content/uploads/2023/06/The-Trading-Pit-1-Step-CFD-New-Challenge-450x254.png', 
      content: 'The Summer Challenge is officially live! This is your opportunity to showcase your trading skills and compete for a grand prize pool. The event will run for four weeks, focusing on major currency pairs and select commodities. Participants are required to maintain a minimum equity balance and adhere to strict risk management rules. Weekly leaderboards will track the top performers, with smaller prizes awarded to the top 3 traders each week. The ultimate winner will be the one with the highest percentage gain at the end of the challenge, securing a fully funded trading account and a significant cash prize. We encourage all our users to participate and make this summer a memorable one.' 
    },
    { 
      id: 2, 
      style: 'news', 
      title: 'New Feature Update: Live Outside Betting', 
      date: '03/06/2025', 
      author: 'Tech Team', 
      summary: 'You can now place outside bets on ongoing matches and see instant results.', 
      thumbnail: 'https://i.ytimg.com/vi/YnqAbGY_Atw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBoB7qUoYwQ78ZiZ0vQrGdgSIkiUw', 
      content: 'We are thrilled to announce the rollout of our most requested feature: Live Outside Betting. This new system allows spectators to engage directly with ongoing 1v1 matches by placing bets on the potential winner. The odds are calculated in real-time based on the current score, remaining time, and the community betting pool. This creates a dynamic and engaging experience for everyone, not just the participants. All winnings from outside bets are instantly credited to your wallet upon match completion. Please note that this feature is currently in beta, and we welcome all feedback to help us refine the system.' 
    },
    { 
      id: 3, 
      style: 'broker-review', 
      title: 'Broker Exness Review: Is It Reliable?', 
      date: '10/06/2025', 
      author: 'TradeChallenge Team', 
      summary: 'A deep dive into EX-T broker, evaluating licenses, fees, and platform stability for traders.', 
      thumbnail: 'https://pub-bbd7a5e39ace471789419f06775be4ec.r2.dev/files/rubricator/2aa461431e7d3fa5c5d5cf313ffc729dc51b87fd.jpeg', 
      content: 'In today\'s review, we take a comprehensive look at EX-T, a broker that has been gaining significant traction in the Asian market. We will analyze their regulatory framework, which includes licenses from top-tier authorities, providing a strong sense of security for clients. Their platform, based on MetaTrader 5, offers exceptional stability and a wide array of analytical tools suitable for both novice and experienced traders. We also examine their fee structure, which is highly competitive, featuring low spreads on major pairs and zero commission on standard accounts. However, we did find that their educational resources are somewhat limited compared to industry leaders. Our detailed breakdown provides all the information you need to decide if EX-T is the right partner for your trading journey.',
      ratings: {
        license: 5,
        insurance: 4,
        localization: 5,
        commission: 4,
        stability: 5,
        onboarding: 4
      }
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
      } 
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
        <button onClick={() => navigate('/news')} className="detail-back-button">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="page-padding">
        <h3 className="news-title">{article.title}</h3>
        <p className="news-detail-author" style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', marginBottom: '1.5rem' }}>
          By {article.author} - {article.date}
        </p>
        
        {/* === PHẦN GIAO DIỆN MỚI CHO BROKER REVIEW === */}
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

        <div className="detail-page-content" style={{marginTop: '1.5rem'}}>
          <p style={{ fontSize: '1rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {article.content}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;