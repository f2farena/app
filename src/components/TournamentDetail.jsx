import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const tournamentDetailsData = [
  {
    id: 203,
    title: 'Weekend Hodl Masters',
    thumbnail: 'https://img.chelseafc.com/image/upload/f_auto,c_fill,ar_16:9,q_90/video/2022/09/20/Thumbnail_16x9_01785.png',
    date: '2025-06-21', // Cập nhật ngày để rõ ràng
    author: 'PK Team',
    description: 'Get ready for the ultimate weekend challenge tailored for Bitcoin enthusiasts! The Weekend Hodl Masters is a high-stakes trading competition designed to test your HODL strength and trading prowess. Compete in a 48-hour sprint against top traders worldwide, navigating the volatile BTC/USDT market to secure your spot on the leaderboard.\n\nThis event offers a massive prize pool with exclusive rewards for the top performers. Whether you’re a seasoned trader or a bold newcomer, this is your chance to shine. Participate in live trading sessions, leverage real-time market data, and strategize to outperform your rivals. Special bonuses await those who achieve key milestones during the event.\n\nDon’t miss out on this electrifying competition! Register now to join the action and claim your share of the rewards. May the best trader win!',
    prizePool: '1,000,000 USDT',
    participants: 520,
    symbol: 'BTC/USDT',
    startTime: '2026-06-21T12:00:00Z', // Cập nhật để giải đấu diễn ra trong tương lai
    broker: 'Go Markets',
    minBalanceRequired: 500,
    brokerRegistrationUrl: 'https://www.binance.com/en/register', 
    results: [],
    images: [
        'https://images.unsplash.com/photo-1626846116770-5a5b0926ebb6?q=80&w=1920&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1631624215749-5b8a7d6e1c1f?q=80&w=1920&auto=format&fit=crop',
        'https://public.bnbstatic.com/image/cms/blog/20210510/1234567890.jpg'
    ],
  },
  {
    id: 201,
    title: 'Summer Trading Championship',
    thumbnail: 'https://forexdailyinfo.com/wp-content/uploads/2023/02/grand-capital-trading-tournament.webp',
    date: '2025-06-18',
    author: 'Exness',
    description: 'Join the Summer Trading Championship, the biggest trading event of the year, where traders from across the globe compete for glory and substantial rewards! This championship spans all available trading pairs, offering unparalleled flexibility to showcase your trading strategies. From crypto to forex, every market is your battlefield.\n\nOver the course of a week, participants will engage in intense trading sessions, with daily leaderboards tracking progress. Special challenges, such as achieving the highest profit percentage or executing the most successful trades, come with bonus prizes. The event also features live webinars with expert traders sharing tips and insights.\n\nWhether you prefer scalping, swing trading, or long-term strategies, this championship has something for everyone. Register today to secure your spot and compete for the top prize. Don’t wait—summer is heating up, and so is the competition!',
    prizePool: '100,000 USDT',
    participants: 128,
    symbol: 'All Pairs',
    startTime: '2026-06-18T12:00:00Z',
    broker: 'Exness',
    minBalanceRequired: 500,
    brokerRegistrationUrl: 'https://www.exness.com/',
    results: [], // Chưa kết thúc, không có kết quả
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1920&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1920&auto=format&fit=crop',
      'https://forexdailyinfo.com/wp-content/uploads/2022/05/trading-event.jpg'
    ],
  },
  {
    id: 204,
    title: 'Futures Grand Prix (Season 1)',
    thumbnail: 'https://static.tildacdn.com/tild3065-6232-4465-b966-646138353438/badge_iq-option-tour.jpg',
    date: '2025-06-17',
    author: 'IQ Option',
    description: 'The first season of our Futures Grand Prix is here. This tournament is focused on ETH/USDT futures contracts. Test your strategies, manage your risk, and compete for the title of Grand Prix Champion. The event has concluded, check out the final results and highlights.',
    prizePool: '50,000 USDT',
    participants: 256,
    symbol: 'ETH/USDT',
    startTime: '2025-06-17T12:00:00Z',
    broker: 'IQ Option',
    minBalanceRequired: 200,
    brokerRegistrationUrl: 'https://iqoption.com/en/sign-up',
    results: [
      { rank: 1, name: 'CryptoWizard', score: 950, reward: '20,000 USDT' },
      { rank: 2, name: 'TradeVanguard', score: 900, reward: '10,000 USDT' },
      { rank: 3, name: 'ProfitSeeker', score: 850, reward: '5,000 USDT' },
      { rank: 4, name: 'BullishBoss', score: 800, reward: '3,000 USDT' },
      { rank: 5, name: 'BearBlaster', score: 750, reward: '2,000 USDT' },
    ],
  },
  {
    id: 202,
    title: 'Gold Rush Challenge',
    thumbnail: 'https://images.unsplash.com/photo-1621782249332-e6e73c33333e?q=80&w=1932&auto=format&fit=crop',
    date: '2025-05-15',
    author: 'XM Brokers',
    description: 'The Gold Rush Challenge was a thrilling event focused on the XAU/USD pair. Traders navigated volatile markets to claim their share of the enormous 2,000,000 USDT prize pool. Thank you to all participants for making this a memorable competition.',
    prizePool: '2,000,000 USDT',
    participants: 64,
    symbol: 'XAU/USD',
    startTime: '2025-05-15T12:00:00Z',
    broker: 'XM',
    minBalanceRequired: 1000,
    brokerRegistrationUrl: 'https://www.xm.com/register',
    results: [
      { rank: 1, name: 'GoldSeeker', score: 1000, reward: '1,000,000 USDT' },
      { rank: 2, name: 'MarketMogul', score: 920, reward: '500,000 USDT' },
      { rank: 3, name: 'TrendRider', score: 880, reward: '250,000 USDT' },
      { rank: 4, name: 'PipHunter', score: 840, reward: '150,000 USDT' },
      { rank: 5, name: 'CandleKing', score: 800, reward: '100,000 USDT' },
    ],
  },
];

const RegistrationModal = ({ tournament, user, walletData, onClose, navigate }) => {
    // Logic kiểm tra
    const hasBrokerAccount = user.linkedBrokers.includes(tournament.broker);
    // Lấy số từ chuỗi ví dụ '1500.50 USDT' -> 1500.50
    const currentBalance = parseFloat(walletData.currentBalance); 
    const hasSufficientBalance = currentBalance >= tournament.minBalanceRequired;

    const handleOpenBrokerSite = () => {
        window.open(tournament.brokerRegistrationUrl, '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleGoToWallet = () => {
        navigate('/wallet');
        onClose();
    };
    
    const handleConfirmRegistration = () => {
        // Đây là nơi sẽ gọi API để đăng ký giải đấu thật
        console.log(`User ${user.id} confirmed registration for tournament ${tournament.id}`);
        alert('Registration Confirmed!'); // Thông báo tạm thời
        onClose();
    };

    const renderContent = () => {
        // Trường hợp 2: Chưa có tài khoản sàn
        if (!hasBrokerAccount) {
            return (
                <>
                    <h4>Account Required</h4>
                    <p>You need an account with <strong>{tournament.broker}</strong> to join this tournament.</p>
                    <p>Please register an account on their platform first.</p>
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleOpenBrokerSite}>Register at {tournament.broker}</button>
                    </div>
                </>
            );
        }

        // Trường hợp 1: Có tài khoản nhưng không đủ số dư
        if (hasBrokerAccount && !hasSufficientBalance) {
            return (
                <>
                    <h4>Insufficient Balance</h4>
                    <p>Your current balance is <strong>{currentBalance.toFixed(2)} USDT</strong>, but this tournament requires a minimum of <strong>{tournament.minBalanceRequired} USDT</strong>.</p>
                    <p>Please deposit more funds to your wallet.</p>
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleGoToWallet}>Go to Wallet</button>
                    </div>
                </>
            );
        }

        // Trường hợp 1: Đủ điều kiện
        if (hasBrokerAccount && hasSufficientBalance) {
            return (
                <>
                    <h4>Confirm Registration</h4>
                    <p>You are eligible to join the <strong>{tournament.title}</strong>.</p>
                    <div className="wallet-info-row" style={{padding: '0.5rem 0'}}>
                        <span className="label">Required Balance</span>
                        <span className="value">{tournament.minBalanceRequired} USDT</span>
                    </div>
                    <div className="wallet-info-row" style={{padding: '0.5rem 0'}}>
                        <span className="label">Your Current Balance</span>
                        <span className="value win">{currentBalance.toFixed(2)} USDT</span>
                    </div>
                    <p style={{marginTop: '1rem', color: 'var(--color-secondary-text)', fontSize: '0.9rem'}}>
                        By confirming, you agree to the tournament's terms and conditions.
                    </p>
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button className="btn btn-accent" onClick={handleConfirmRegistration}>Confirm</button>
                    </div>
                </>
            );
        }

        return null; // Trường hợp mặc định
    };

    return (
        <>
            <div className="confirmation-overlay" onClick={onClose}></div>
            <div className="confirmation-modal card">
                {renderContent()}
            </div>
        </>
    );
};

const TournamentDetail = ({ user, walletData }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tournament = tournamentDetailsData.find(item => item.id === parseInt(id));
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  if (!tournament) {
    return (
      <div className="page-padding detail-page-container">
        <h2>Tournament Not Found</h2>
        <p>No tournament found with ID {id}.</p>
        <button className="btn btn-primary" onClick={() => navigate('/arena')}>
          Back to Arena
        </button>
      </div>
    );
  }

  const isTournamentEnded = new Date(tournament.startTime) < new Date();

  if (!user || !walletData) {
    return <div className="page-padding">Loading user data...</div>;
  }

  return (
    <div className="detail-page-container">
      <div style={{ position: 'relative' }}>
        <img
          src={tournament.thumbnail}
          alt={tournament.title}
          className="detail-page-banner"
          loading="lazy"
          onError={(e) => {
            console.error(`Failed to load image: ${tournament.thumbnail}`);
            e.target.src = 'https://placehold.co/500x220?text=Image+Not+Found';
          }}
          onLoad={(e) => console.log(`TournamentDetail image loaded: ${tournament.thumbnail}, size: ${e.target.naturalWidth}x${e.target.naturalHeight}`)}
        />
        <button
          className="icon-button detail-back-button"
          onClick={() => navigate('/arena')}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="page-padding">
        <h1 className="detail-page-title">{tournament.title}</h1>
        <p className="detail-page-meta">
          By {tournament.author} - {tournament.date}
        </p>

        <div className="card tournament-info-box">
          <div className="info-grid-item">
            <span className="info-label">Prize Pool</span>
            <span className="info-value accent">{tournament.prizePool}</span>
          </div>
          <div className="info-grid-item">
            <span className="info-label">Participants</span>
            <span className="info-value">{tournament.participants}</span>
          </div>
          <div className="info-grid-item">
            <span className="info-label">Symbol</span>
            <span className="info-value primary">{tournament.symbol}</span>
          </div>
          <div className="info-grid-item">
            <span className="info-label">Event Time</span>
            <span className="info-value">{new Date(tournament.startTime).toLocaleString()}</span>
          </div>
          <div className="info-grid-item">
            <span className="info-label">Broker</span>
            <span className="info-value">{tournament.broker}</span>
          </div>
        </div>

        <p className="detail-page-content">
          {tournament.description}
        </p>

        {isTournamentEnded && tournament.results.length > 0 && (
          <div className="card">
            <h2 className="section-title">Tournament Results</h2>
            <div className="leaderboard-table">
              <div className="leaderboard-header">
                <div>Rank</div>
                <div>Player</div>
                <div className="text-center">Score</div>
                <div className="text-right">Reward</div>
              </div>
              {tournament.results.map((result) => (
                <div
                  key={result.rank}
                  className={`leaderboard-row ${result.rank === 1 ? 'top-rank' : ''}`}
                >
                  <div className="leaderboard-rank">{result.rank}</div>
                  <div className="trader-info">
                    <span>{result.name}</span>
                  </div>
                  <div className="text-center">{result.score}</div>
                  <div className="text-right">{result.reward}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isTournamentEnded && (
        <footer className="detail-page-footer">
          <button 
            className="btn btn-accent" 
            style={{ width: '90%', maxWidth: '400px' }}
            onClick={() => setShowRegisterModal(true)}
          >
            Register Now
          </button>
        </footer>
      )}

      {showRegisterModal && (
        <RegistrationModal
            tournament={tournament}
            user={user}
            walletData={walletData}
            onClose={() => setShowRegisterModal(false)}
            navigate={navigate}
        />
      )}
    </div>
  );
};

export default TournamentDetail;