import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Giả lập dữ liệu bài tin tức
const newsArticles = [
  {
    id: 1,
    title: 'Summer Challenge: Double Your Account!',
    date: '05/06/2025',
    author: 'Admin',
    summary: 'Join our special challenge event with exciting rewards for top traders.',
    thumbnail: 'data:image/jpeg;base64,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',
    content: 'Join our special challenge event with exciting rewards for top traders. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
  {
    id: 2,
    title: 'New Feature Update: Live Outside Betting',
    date: '03/06/2025',
    author: 'Tech Team',
    summary: 'You can now place outside bets on ongoing matches and see instant results.',
    thumbnail: 'https://i.ytimg.com/vi/YnqAbGY_Atw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBoB7qUoYwQ78ZiZ0vQrGdgSIkiUw',
    content: 'You can now place outside bets on ongoing matches and see instant results. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
];

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const article = newsArticles.find(article => article.id === parseInt(id));

  if (!article) {
    return (
      <div
        className="page-padding"
        style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)', minHeight: '100vh' }}
      >
        <h2>Article Not Found</h2>
        <p>No article found with ID {id}.</p>
        <button className="btn btn-primary" onClick={() => navigate('/news')}>
          Back to News
        </button>
      </div>
    );
  }

  return (
    <div
      className="news-detail-container"
      style={{ backgroundColor: 'var(--color-card-bg)', color: 'var(--color-text)', minHeight: '100vh' }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={article.thumbnail}
          alt={article.title}
          className="news-detail-banner"
          style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }}
        />
        <button
          className="icon-button"
          onClick={() => navigate('/news')}
          style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: 'var(--color-card-bg)',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--color-text)',
            fontSize: '1.5rem',
          }}
        >
          <svg fill="currentColor" viewBox="0 0 20 20" style={{ width: '1.5rem', height: '1.5rem' }}>
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="page-padding">
        <h3 className="news-title">{article.title}</h3>
        <p className="news-detail-author" style={{ fontSize: '0.875rem', color: 'var(--color-secondary-text)', marginBottom: '0.5rem' }}>
          By {article.author} - {article.date}
        </p>
        <p className="news-detail-content" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
          {article.content}
        </p>
      </div>
    </div>
  );
};

export default NewsDetail;