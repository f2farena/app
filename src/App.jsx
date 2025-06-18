import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MatchDetail from './components/MatchDetail';
import NewsDetail from './components/NewsDetail';
import ArenaDetail from './components/ArenaDetail';
import settingIcon from './assets/setting.png';
import chatboxIcon from './assets/chatbox.png';
import homeActive from './assets/home-2.png';
import homeInactive from './assets/home-1.png';
import newsActive from './assets/news-2.png';
import newsInactive from './assets/news-1.png';
import arenaActive from './assets/arena-2.png';
import arenaInactive from './assets/arena-1.png';
import leaderboardActive from './assets/leaderboard-2.png';
import leaderboardInactive from './assets/leaderboard-1.png';
import walletActive from './assets/wallet-2.png';
import walletInactive from './assets/wallet-1.png';
import logoIcon from './assets/logo.png';
import arrowIcon from './assets/arrow.png';
import qrCode from './assets/QR-code.gif';
import copyIcon1 from './assets/copy-1.png';
import copyIcon2 from './assets/copy-2.png';

// ===================================================================================
// CÁC COMPONENT GIAO DIỆN PHỤ
// ===================================================================================

const Header = ({ onSettingsClick, onChatbotClick, showHeader }) => {
  const navigate = useNavigate();
  return (
    <header className={`header ${!showHeader ? 'header-hidden' : ''}`}>
      <button
        onClick={onSettingsClick}
        className="icon-button"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
      >
        <img
          src={settingIcon}
          alt="Settings"
          style={{ width: '20px', height: '20px' }}
          onError={() => console.error('Failed to load setting icon')}
        />
      </button>
      <button
        className="icon-button"
        onClick={() => navigate('/home')}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
      >
        <img
          src={logoIcon}
          alt="Logo"
          style={{ width: '50px', height: '50px', objectFit: 'contain' }}
          onError={() => console.error('Failed to load logo icon')}
        />
      </button>
      <button
        onClick={() => { onChatbotClick(); navigate('/chatbot'); }}
        className="icon-button"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}
      >
        <img
          src={chatboxIcon}
          alt="Chatbot"
          style={{ width: '26px', height: '26px' }}
          onError={() => console.error('Failed to load chatbox icon')}
        />
      </button>
    </header>
  );
};

const FooterButton = ({ icon, label, page, activePage, setActivePage }) => {
  const icons = {
    home: activePage === 'home' ? homeActive : homeInactive,
    news: activePage === 'news' ? newsActive : newsInactive,
    arena: activePage === 'arena' ? arenaActive : arenaInactive,
    leaderboard: activePage === 'leaderboard' ? leaderboardActive : leaderboardInactive,
    wallet: activePage === 'wallet' ? walletActive : walletInactive,
  };
  const navigate = useNavigate();
  return (
    <button
      className={`footer-button ${activePage === page ? 'active' : ''}`}
      onClick={() => { setActivePage(page); navigate(`/${page}`); }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '0.5rem' }}
    >
      <img
        src={icons[icon]}
        alt={label}
        style={{ width: '20px', height: '20px', objectFit: 'contain' }}
        onError={() => console.error(`Failed to load ${icon} icon`)}
      />
      <span>{label}</span>
    </button>
  );
};

const Footer = ({ activePage, setActivePage, showFooter }) => (
    <footer className={`footer ${!showFooter ? 'footer-hidden' : ''}`}>
        <FooterButton icon="home" label="Home" page="home" activePage={activePage} setActivePage={setActivePage} />
        <FooterButton icon="news" label="News" page="news" activePage={activePage} setActivePage={setActivePage} />
        <FooterButton icon="arena" label="Arena" page="arena" activePage={activePage} setActivePage={setActivePage} />
        <FooterButton icon="leaderboard" label="Leaderboard" page="leaderboard" activePage={activePage} setActivePage={setActivePage} />
        <FooterButton icon="wallet" label="Wallet" page="wallet" activePage={activePage} setActivePage={setActivePage} />
    </footer>
);

// ===================================================================================
// CÁC COMPONENT TRANG (ĐÃ KHÔI PHỤC)
// ===================================================================================

const generateAvatarUrl = (seed) => `https://placehold.co/50x50/3498db/ffffff?text=${(seed.split(' ').map(n=>n[0]).join('') || 'NN').toUpperCase()}`;

const EventBanner = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);
    const navigate = useNavigate();

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(
            () => setCurrentIndex((prevIndex) =>
                prevIndex === items.length - 1 ? 0 : prevIndex + 1
            ),
            5000 // Tự động trượt sau 3 giây
        );

        return () => {
            resetTimeout();
        };
    }, [currentIndex, items.length]);

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    }

    return (
        <div className="banner-container">
            <div className="banner-slides" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {items.map((item) => (
                  <div className="banner-slide" key={item.id} onClick={() => navigate(`/news/${item.id}`)}>
                      <img src={item.thumbnail} alt={`Event ${item.id}`} className="banner-image" />
                      {/* Đã xóa phần title ở đây */}
                  </div>
              ))}
            </div>
            <div className="banner-dots">
                {items.map((_, slideIndex) => (
                    <div
                        key={slideIndex}
                        className={`banner-dot ${currentIndex === slideIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(slideIndex)}
                    ></div>
                ))}
            </div>
        </div>
    );
}

const HomePage = () => {
    const navigate = useNavigate();

    // Dữ liệu cho banner (lấy từ newsArticles làm mẫu)
    const bannerItems = [
        { id: 1, title: 'Summer Challenge: Double Your Account!', thumbnail: 'https://images.media-outreach.com/559582/Gala-Dinner-news.jpg' },
        { id: 2, title: 'New Feature Update: Live Outside Betting', thumbnail: 'https://autorebateforex.com/cashback/wp-content/uploads/2021/04/2021-04-06-2-1024x494.png' },
        { id: 3, title: 'Top 5 Altcoins to Watch This Month', thumbnail: 'https://blog.investingnote.com/wp-content/uploads/2019/09/traders-rally-1.jpg' },
    ];

    const ongoingMatches = [
        { id: 1, pair: 'BTC/USDT', betAmount: 100, player1: { name: 'CryptoKing', avatar: generateAvatarUrl('CryptoKing'), score: 7, odds: '1:0.75' }, player2: { name: 'TradeMaster', avatar: generateAvatarUrl('TradeMaster'), score: 3, odds: '1:0.90' }, timeRemaining: '00:45:30', views: 1250, outsideBetsTotal: 12500 },
        { id: 2, pair: 'ETH/USDT', betAmount: 250, player1: { name: 'BlockBoss', avatar: generateAvatarUrl('BlockBoss'), score: 5, odds: '1:0.85' }, player2: { name: 'MarketWhiz', avatar: generateAvatarUrl('MarketWhiz'), score: 5, odds: '1:0.85' }, timeRemaining: '01:10:15', views: 890, outsideBetsTotal: 8000 },
    ];

    return (
        // Bỏ class page-padding ở thẻ ngoài cùng để banner tràn viền
        <div>
            {/* === PHẦN BANNER MỚI === */}
            <EventBanner items={bannerItems} />
            
            {/* === PHẦN CÁC TRẬN ĐẤU === */}
            <div className="page-padding">
                <h2 className="section-title">⚔️ Matching</h2>
                {ongoingMatches.map((match) => (
                    <div key={match.id} className="card match-card" onClick={() => navigate(`/match/${match.id}`)} style={{ cursor: 'pointer' }}>
                        {/* Nội dung match-card giữ nguyên */}
                        <div className="top-section">
                            <div className="player-info">
                                <img src={match.player1.avatar} alt={match.player1.name} className="player-avatar" />
                                <span className="player-name">{match.player1.name}</span>
                                <span className="player-odds">{match.player1.odds}</span>
                            </div>
                            <div className="center-details">
                                <div className="time-remaining">{match.timeRemaining}</div>
                                <div className="vs-text">VS</div>
                            </div>
                            <div className="player-info">
                                <img src={match.player2.avatar} alt={match.player2.name} className="player-avatar" />
                                <span className="player-name">{match.player2.name}</span>
                                <span className="player-odds">{match.player2.odds}</span>
                            </div>
                        </div>
                        <div className="score-bar-container">
                            <div className="score-bar">
                                <div style={{ width: `${(match.player1.score / (match.player1.score + match.player2.score)) * 100}%` }}></div>
                                <div style={{ width: `${(match.player2.score / (match.player1.score + match.player2.score)) * 100}%` }}></div>
                            </div>
                            <div className="score-text">
                                <span>Score: {match.player1.score}</span>
                                <span>Score: {match.player2.score}</span>
                            </div>
                        </div>
                        <div className="bottom-section">
                            <div className="info-group">
                                <div className="info-item"><p className="primary-p">{match.pair}</p></div>
                                <div className="info-item"><p className="accent-p">{match.betAmount} USDT</p></div>
                            </div>
                            <div className="info-group">
                                <div className="info-item icon-info"><svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg><span>{match.views}</span></div>
                                <div className="info-item icon-info"><svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg><span>{match.outsideBetsTotal} USDT</span></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const NewsPage = () => {
  const navigate = useNavigate();
  const newsArticles = [
    { id: 1, title: 'Summer Challenge: Double Your Account!', date: '05/06/2025', author: 'Admin', summary: 'Join our special challenge event with exciting rewards for top traders.', thumbnail: 'https://forexpropreviews.com/wp-content/uploads/2023/06/The-Trading-Pit-1-Step-CFD-New-Challenge-450x254.png', content: 'Join our special challenge event with exciting rewards for top traders. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
    { id: 2, title: 'New Feature Update: Live Outside Betting', date: '03/06/2025', author: 'Tech Team', summary: 'You can now place outside bets on ongoing matches and see instant results.', thumbnail: 'https://i.ytimg.com/vi/YnqAbGY_Atw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBoB7qUoYwQ78ZiZ0vQrGdgSIkiUw', content: 'You can now place outside bets on ongoing matches and see instant results. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
  ];
  return (
    <div className="page-padding">
      {newsArticles.map((article) => (
        <div key={article.id} className="news-card" onClick={() => navigate(`/news/${article.id}`)} style={{ cursor: 'pointer' }}>
          <img src={article.thumbnail} alt={article.title} className="news-thumbnail" />
          <div className="news-content">
            <h3 className="news-title">{article.title}</h3>
            <p className="news-date">{article.date}</p>
            <p className="news-summary">{article.summary}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('traders');

  const leaderboardData = [
    { id: 1, rank: 1, name: 'ProTraderX', avatar: generateAvatarUrl('ProTraderX'), wins: 120, profit: 50000 },
    { id: 2, rank: 2, name: 'MarketMaestro', avatar: generateAvatarUrl('MarketMaestro'), wins: 110, profit: 45000 },
    { id: 3, rank: 3, name: 'AlphaScalper', avatar: generateAvatarUrl('AlphaScalper'), wins: 105, profit: 40000 },
    { id: 4, rank: 4, name: 'CryptoWizard', avatar: generateAvatarUrl('CryptoWizard'), wins: 100, profit: 38000 },
    { id: 5, rank: 5, name: 'TradeVanguard', avatar: generateAvatarUrl('TradeVanguard'), wins: 95, profit: 36000 },
    { id: 6, rank: 6, name: 'ProfitSeeker', avatar: generateAvatarUrl('ProfitSeeker'), wins: 90, profit: 34000 },
    { id: 7, rank: 7, name: 'BullishBoss', avatar: generateAvatarUrl('BullishBoss'), wins: 85, profit: 32000 },
    { id: 8, rank: 8, name: 'BearBlaster', avatar: generateAvatarUrl('BearBlaster'), wins: 80, profit: 30000 },
    { id: 9, rank: 9, name: 'TrendRider', avatar: generateAvatarUrl('TrendRider'), wins: 75, profit: 28000 },
    { id: 10, rank: 10, name: 'ChartMaster', avatar: generateAvatarUrl('ChartMaster'), wins: 70, profit: 26000 },
    { id: 11, rank: 11, name: 'PipHunter', avatar: generateAvatarUrl('PipHunter'), wins: 65, profit: 24000 },
    { id: 12, rank: 12, name: 'CandleKing', avatar: generateAvatarUrl('CandleKing'), wins: 60, profit: 22000 },
    { id: 13, rank: 13, name: 'SwingTrader', avatar: generateAvatarUrl('SwingTrader'), wins: 55, profit: 20000 },
    { id: 14, rank: 14, name: 'RiskTamer', avatar: generateAvatarUrl('RiskTamer'), wins: 50, profit: 18000 },
    { id: 15, rank: 15, name: 'MarketMogul', avatar: generateAvatarUrl('MarketMogul'), wins: 45, profit: 16000 },
    { id: 16, rank: 16, name: 'TradeTitan', avatar: generateAvatarUrl('TradeTitan'), wins: 40, profit: 14000 },
    { id: 17, rank: 17, name: 'CoinCrusader', avatar: generateAvatarUrl('CoinCrusader'), wins: 35, profit: 12000 },
    { id: 18, rank: 18, name: 'FiatFighter', avatar: generateAvatarUrl('FiatFighter'), wins: 30, profit: 10000 },
    { id: 19, rank: 19, name: 'LeverageLord', avatar: generateAvatarUrl('LeverageLord'), wins: 25, profit: 8000 },
    { id: 20, rank: 20, name: 'HodlHero', avatar: generateAvatarUrl('HodlHero'), wins: 20, profit: 6000 },
  ];

  const betOutsideWinnersData = [
    { id: 1, rank: 1, name: 'BetKing', avatar: generateAvatarUrl('BetKing'), totalWinnings: 25000 },
    { id: 2, rank: 2, name: 'RiskTaker', avatar: generateAvatarUrl('RiskTaker'), totalWinnings: 22000 },
    { id: 3, rank: 3, name: 'WagerMaster', avatar: generateAvatarUrl('WagerMaster'), totalWinnings: 20000 },
    { id: 4, rank: 4, name: 'OddsSavant', avatar: generateAvatarUrl('OddsSavant'), totalWinnings: 18000 },
    { id: 5, rank: 5, name: 'StakeGuru', avatar: generateAvatarUrl('StakeGuru'), totalWinnings: 16000 },
    { id: 6, rank: 6, name: 'BetBlitz', avatar: generateAvatarUrl('BetBlitz'), totalWinnings: 14000 },
    { id: 7, rank: 7, name: 'WinWizard', avatar: generateAvatarUrl('WinWizard'), totalWinnings: 12000 },
    { id: 8, rank: 8, name: 'PuntPro', avatar: generateAvatarUrl('PuntPro'), totalWinnings: 10000 },
    { id: 9, rank: 9, name: 'CashCaller', avatar: generateAvatarUrl('CashCaller'), totalWinnings: 9000 },
    { id: 10, rank: 10, name: 'GambleGenix', avatar: generateAvatarUrl('GambleGenix'), totalWinnings: 8000 },
    { id: 11, rank: 11, name: 'BetBuster', avatar: generateAvatarUrl('BetBuster'), totalWinnings: 7000 },
    { id: 12, rank: 12, name: 'WagerWhiz', avatar: generateAvatarUrl('WagerWhiz'), totalWinnings: 6000 },
    { id: 13, rank: 13, name: 'StakeStar', avatar: generateAvatarUrl('StakeStar'), totalWinnings: 5000 },
    { id: 14, rank: 14, name: 'OddsOracle', avatar: generateAvatarUrl('OddsOracle'), totalWinnings: 4000 },
    { id: 15, rank: 15, name: 'BetBaron', avatar: generateAvatarUrl('BetBaron'), totalWinnings: 3500 },
    { id: 16, rank: 16, name: 'WinWarden', avatar: generateAvatarUrl('WinWarden'), totalWinnings: 3000 },
    { id: 17, rank: 17, name: 'PuntPrince', avatar: generateAvatarUrl('PuntPrince'), totalWinnings: 2500 },
    { id: 18, rank: 18, name: 'CashCrusader', avatar: generateAvatarUrl('CashCrusader'), totalWinnings: 2000 },
    { id: 19, rank: 19, name: 'GambleGlider', avatar: generateAvatarUrl('GambleGlider'), totalWinnings: 1500 },
    { id: 20, rank: 20, name: 'BetBanzai', avatar: generateAvatarUrl('BetBanzai'), totalWinnings: 1000 },
  ];

  return (
    <div className="page-padding">
      <div className="wallet-tabs">
        <button
          className={`wallet-tab-button ${activeTab === 'traders' ? 'active' : ''}`}
          onClick={() => setActiveTab('traders')}
        >
          Top Traders
        </button>
        <button
          className={`wallet-tab-button ${activeTab === 'betOutside' ? 'active' : ''}`}
          onClick={() => setActiveTab('betOutside')}
        >
          Top Winning Teams
        </button>
      </div>
      <div className="card">
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <div>Rank</div>
            <div>{activeTab === 'traders' ? 'Trader' : 'Team'}</div>
            <div className="text-center">{activeTab === 'traders' ? 'Wins' : 'Total Winnings'}</div>
            <div className="text-right">{activeTab === 'traders' ? 'Profit (USDT)' : 'Winnings (USDT)'}</div>
          </div>
          {(activeTab === 'traders' ? leaderboardData : betOutsideWinnersData).map(item => (
            <div key={item.id} className="leaderboard-row">
              <div className={`leaderboard-rank ${item.rank <= 3 ? 'top-rank' : ''}`}>{item.rank}</div>
              <div className="trader-info">
                <img src={item.avatar} alt={item.name} className="trader-avatar" />
                <span>{item.name}</span>
              </div>
              <div className="text-center">{activeTab === 'traders' ? item.wins : item.totalWinnings.toLocaleString()}</div>
              <div className="text-right profit-text">+{activeTab === 'traders' ? item.profit.toLocaleString() : item.totalWinnings.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WalletPage = () => {
  const [activeTab, setActiveTab] = useState('assetInfo');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  const walletData = {
    currentBalance: '1500.50 USDT',
    totalDeposits: '5000.00 USDT',
    totalWithdrawals: '3000.00 USDT',
    totalWinnings: '150.00 USDT',
    totalLosses: '50.00 USDT',
    affiliateCommission: '25.00 USDT',
    transactionHistory: [
      { id: 1, type: 'Deposit', amount: '500 USDT', date: '2025-06-01', status: 'Completed' },
      { id: 2, type: 'Win', amount: '20 USDT', date: '2025-06-02', matchId: 'M-123', status: 'Completed' },
      { id: 3, type: 'Withdraw', amount: '100 USDT', date: '2025-06-03', status: 'Pending' },
      { id: 4, type: 'Loss', amount: '10 USDT', date: '2025-06-04', matchId: 'M-124', status: 'Completed' },
    ],
  };

  if (showDepositForm) {
    return <DepositForm onClose={() => setShowDepositForm(false)} />;
  }

  if (showWithdrawForm) {
    return <WithdrawForm onClose={() => setShowWithdrawForm(false)} currentBalance={walletData.currentBalance} />;
  }

  return (
    <div className="page-padding">
      <div className="wallet-tabs">
        <button className={`wallet-tab-button ${activeTab === 'assetInfo' ? 'active' : ''}`} onClick={() => setActiveTab('assetInfo')}>
          Asset Information
        </button>
        <button className={`wallet-tab-button ${activeTab === 'transactionHistory' ? 'active' : ''}`} onClick={() => setActiveTab('transactionHistory')}>
          Transaction History
        </button>
      </div>

      {activeTab === 'assetInfo' && (
        <div className="card">
          <div className="wallet-info-row">
            <span className="label">Current Balance</span>
            <span className="value accent">{walletData.currentBalance}</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Total Deposits</span>
            <span className="value win">{walletData.totalDeposits}</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Total Withdrawals</span>
            <span className="value secondary">{walletData.totalWithdrawals}</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Total Winnings</span>
            <span className="value win">{walletData.totalWinnings}</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Total Losses</span>
            <span className="value loss">{walletData.totalLosses}</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Affiliate Commission</span>
            <span className="value accent">{walletData.affiliateCommission}</span>
          </div>
          <div className="wallet-buttons">
            <button className="btn btn-primary" onClick={() => setShowDepositForm(true)}>Deposit</button>
            <button className="btn btn-accent" onClick={() => setShowWithdrawForm(true)}>Withdraw</button>
          </div>
        </div>
      )}
      {activeTab === 'transactionHistory' && (
        <div className="card">
          {walletData.transactionHistory.map(tx => (
            <div key={tx.id} className="wallet-info-row">
              <div>
                <p className="label" style={{ margin: 0 }}>{tx.type} {tx.matchId ? `(${tx.matchId})` : ''}</p>
                <p className="secondary" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-secondary-text)' }}>{tx.date}</p>
              </div>
              <div className={`value ${tx.type === 'Loss' || tx.type === 'Withdraw' ? 'loss' : 'win'}`}>
                <span>{tx.type === 'Loss' || tx.type === 'Withdraw' ? '-' : '+'} {tx.amount}</span>
                <span className={`status-dot ${tx.status.toLowerCase()}`}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateNewMatchForm = ({ onClose }) => {
    const [betAmount, setBetAmount] = useState('');
    const [tradingSymbol, setTradingSymbol] = useState('');
    const [challengeMode, setChallengeMode] = useState('waiting');
    const [opponentName, setOpponentName] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleConfirm = (e) => {
        e.preventDefault();
        // Thêm kiểm tra validation cơ bản ở đây nếu cần
        setShowConfirmation(true);
    };

    const confirmMatchSetup = () => {
        // Xử lý logic tạo trận đấu ở đây
        console.log("Creating match:", { betAmount, tradingSymbol, challengeMode, opponentName });
        setShowConfirmation(false);
        onClose(); // Đóng form sau khi xác nhận
    };

    return (
        <>
            <div className="page-padding">
                <div className="form-header">
                    <h2>Create New Match</h2>
                    <button onClick={onClose} className="icon-button close-button">&times;</button>
                </div>
                <form className="card" onSubmit={handleConfirm}>
                    <div className="form-group">
                        <label className="form-label">Bet Amount (USDT)</label>
                        <input
                            type="number"
                            className="form-input"
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            placeholder="e.g., 100"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Trading Symbol</label>
                        <input
                            type="text"
                            className="form-input"
                            value={tradingSymbol}
                            onChange={(e) => setTradingSymbol(e.target.value)}
                            placeholder="e.g., BTC/USDT, GOLD"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Challenge Mode</label>
                        <div className="form-radio-group">
                            <label className="form-radio-label">
                                <input type="radio" name="challengeMode" value="specific" checked={challengeMode === 'specific'} onChange={(e) => setChallengeMode(e.target.value)} />
                                <span>Challenge User</span>
                            </label>
                            <label className="form-radio-label">
                                <input type="radio" name="challengeMode" value="waiting" checked={challengeMode === 'waiting'} onChange={(e) => setChallengeMode(e.target.value)} />
                                <span>Waiting Mode</span>
                            </label>
                        </div>
                    </div>
                    {challengeMode === 'specific' && (
                        <div className="form-group">
                            <label className="form-label">Opponent's Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={opponentName}
                                onChange={(e) => setOpponentName(e.target.value)}
                                placeholder="Enter Telegram ID or Nickname"
                                required
                            />
                        </div>
                    )}
                    <button type="submit" className="btn btn-accent" style={{width: '100%', marginTop: '1rem'}}>
                        Confirm Setup
                    </button>
                </form>
            </div>

            {showConfirmation && (
                <>
                    <div className="confirmation-overlay" onClick={() => setShowConfirmation(false)}></div>
                    <div className="confirmation-modal card">
                        <h4>Confirm Match Setup</h4>
                        <p>Are you sure you want to set up this match?</p>
                        <div className="confirmation-buttons">
                            <button className="btn btn-secondary" onClick={() => setShowConfirmation(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={confirmMatchSetup}>Confirm</button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

const DepositForm = ({ onClose }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timer, setTimer] = useState(600); // 10 phút = 600 giây
  const [copied, setCopied] = useState(false);
  const walletAddress = 'TUYDJGWvzE54Wpq1AqFXWCUkjbyozrK1L2';

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!depositAmount || !memoContent) return;
    setShowConfirmation(true);
  };

  const confirmDeposit = () => {
    console.log("Depositing:", { depositAmount, memoContent });
    // Placeholder để gọi endpoint kiểm tra ví
    const checkWalletStatus = async () => {
      try {
        // Ví dụ: const response = await fetch('/api/check-wallet', { ... });
        console.log('Checking wallet status for deposit:', { depositAmount, memoContent });
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    };
    checkWalletStatus();
    setShowConfirmation(false);
    onClose();
  };

  // Bộ đếm giờ
  useEffect(() => {
    if (!showConfirmation || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [showConfirmation, timer]);

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied sau 2 giây
    });
  };

  return (
    <>
      <div className="page-padding">
        <div className="form-header">
          <h2>Deposit Funds</h2>
          <button onClick={onClose} className="icon-button close-button">×</button>
        </div>
        <form className="card" onSubmit={handleConfirm}>
          <div className="form-group">
            <label className="form-label">Deposit Amount (USDT)</label>
            <input
              type="number"
              className="form-input"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="e.g., 100"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Memo Content</label>
            <input
              type="text"
              className="form-input"
              value={memoContent}
              onChange={(e) => setMemoContent(e.target.value)}
              placeholder="Enter memo content"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Confirm Deposit
          </button>
        </form>
      </div>

      {showConfirmation && (
        <>
          <div className="confirmation-overlay" onClick={() => setShowConfirmation(false)}></div>
          <div className="confirmation-modal card">
            <p style={{ textAlign: 'center' }}>Deposit {depositAmount} USDT with memo: {memoContent}</p>
            <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
              Please transfer to the address below with the exact amount and Memo requested
            </p>
            <img
              src={qrCode}
              alt="QR Code"
              style={{ width: '150px', height: '150px', margin: '1rem auto', display: 'block' }}
              onError={() => console.error('Failed to load QR code')}
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <p style={{ margin: 0, wordBreak: 'break-all', fontSize: '0.875rem' }}>{walletAddress}</p>
                <button
                  className="icon-button"
                  onClick={handleCopy}
                  style={{ padding: '0.25rem', background: 'transparent', border: 'none' }}
                >
                  <img
                    src={copied ? copyIcon2 : copyIcon1}
                    alt={copied ? 'Copied!' : 'Copy'}
                    style={{ width: '16px', height: '16px' }}
                    onError={() => console.error('Failed to load copy icon')}
                  />
                </button>
              </div>
              <p style={{ margin: '0.5rem 0 0 0' }}>Time Remaining</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{formatTimer()}</p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const WithdrawForm = ({ onClose, currentBalance }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [destinationWallet, setDestinationWallet] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!withdrawAmount || !destinationWallet) return;
    setShowConfirmation(true);
  };

  const confirmWithdrawal = () => {
    console.log("Withdrawing:", { withdrawAmount, destinationWallet });
    setShowConfirmation(false);
    onClose();
  };

  return (
    <>
      <div className="page-padding">
        <div className="form-header">
          <h2>Withdraw Funds</h2>
          <button onClick={onClose} className="icon-button close-button">×</button>
        </div>
        <div className="wallet-info-row" style={{ marginBottom: '1rem' }}>
          <span className="label">Available Balance</span>
          <span className="value accent">{currentBalance}</span>
        </div>
        <form className="card" onSubmit={handleConfirm}>
          <div className="form-group">
            <label className="form-label">Withdrawal Amount (USDT)</label>
            <input
              type="number"
              className="form-input"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g., 100"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Destination Wallet Address</label>
            <input
              type="text"
              className="form-input"
              value={destinationWallet}
              onChange={(e) => setDestinationWallet(e.target.value)}
              placeholder="e.g., 0x123..."
              required
            />
          </div>
          <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '1rem' }}>
            Confirm Withdrawal
          </button>
        </form>
      </div>

      {showConfirmation && (
        <>
          <div className="confirmation-overlay" onClick={() => setShowConfirmation(false)}></div>
          <div className="confirmation-modal card">
            <h4>Confirm Withdrawal</h4>
            <p>Withdraw {withdrawAmount} USDT to {destinationWallet}?</p>
            <p>Available Balance: {currentBalance}</p>
            <div className="confirmation-buttons">
              <button className="btn btn-secondary" onClick={() => setShowConfirmation(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmWithdrawal}>Confirm</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const ArenaPage = () => {
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterAmount, setFilterAmount] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterPanelHeight, setFilterPanelHeight] = useState(0); // Thêm state cho chiều cao
  const filterContentRef = useRef(null);

  const waitingMatches = [
    { id: 101, betAmount: 75, symbol: 'XRP/USDT', challenger: { name: 'GoldSeeker', avatar: generateAvatarUrl('GoldSeeker') }, country: 'Vietnam', waitingTime: '00:05:00' },
    { id: 102, betAmount: 200, symbol: 'SOL/USDC', challenger: { name: 'ForexGiant', avatar: generateAvatarUrl('ForexGiant') }, country: 'USA', waitingTime: '00:12:30' },
    { id: 103, betAmount: 50, symbol: 'BTC/USDT', challenger: { name: 'CryptoNewbie', avatar: generateAvatarUrl('CryptoNewbie') }, country: 'Singapore', waitingTime: '00:01:45' },
    { id: 104, betAmount: 150, symbol: 'ETH/USDT', challenger: { name: 'EthTrader', avatar: generateAvatarUrl('EthTrader') }, country: 'Vietnam', waitingTime: '00:08:10' },
  ];

  const filteredMatches = waitingMatches.filter(match => {
    const amountCondition = !filterAmount || match.betAmount <= parseInt(filterAmount);
    const countryCondition = !filterCountry || match.country.toLowerCase().includes(filterCountry.toLowerCase());
    const symbolCondition = !filterSymbol || match.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
    return amountCondition && countryCondition && symbolCondition;
  });

  // Cập nhật chiều cao khi showFilters thay đổi
  useEffect(() => {
    if (showFilters && filterContentRef.current) {
      setFilterPanelHeight(filterContentRef.current.scrollHeight);
    } else {
      setFilterPanelHeight(0);
    }
  }, [showFilters]);

  if (showCreateForm) {
    return <CreateNewMatchForm onClose={() => setShowCreateForm(false)} />;
  }

  return (
    <div className="page-padding">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
        <button className="btn btn-primary" onClick={() => setShowFilters(!showFilters)}>
          Filters
          <svg className={`filter-arrow ${showFilters ? 'open' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <button className="btn btn-accent" onClick={() => setShowCreateForm(true)}>+ New Match</button>
      </div>
      
      <div className="filters-panel" style={{ maxHeight: `${filterPanelHeight}px` }}>
        <div className="card" ref={filterContentRef} style={{ marginBottom: '1rem', overflow: 'hidden' }}>
          <div className="form-group">
            <label className="form-label">Max Bet Amount</label>
            <input
              type="number"
              className="form-input"
              value={filterAmount}
              onChange={e => setFilterAmount(e.target.value)}
              placeholder="e.g., 200"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              type="text"
              className="form-input"
              value={filterCountry}
              onChange={e => setFilterCountry(e.target.value)}
              placeholder="e.g., Vietnam"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Symbol</label>
            <input
              type="text"
              className="form-input"
              value={filterSymbol}
              onChange={e => setFilterSymbol(e.target.value)}
              placeholder="e.g., BTC, GOLD"
            />
          </div>
        </div>
      </div>

      {filteredMatches.map(match => (
        <div key={match.id} className="card arena-match-card">
          <div className="challenger-info">
            <img src={match.challenger.avatar} alt={match.challenger.name} className="challenger-avatar" />
            <div>
              <p className="challenger-name">{match.challenger.name}</p>
              <p className="challenger-country">{match.country}</p>
            </div>
          </div>
          <div className="details-section">
            <div className="detail-item">
              <span>Time</span>
              <p className="detail-value">{match.waitingTime}</p>
            </div>
            <div className="detail-item">
              <span>Symbol</span>
              <p className="detail-value primary">{match.symbol}</p>
            </div>
            <div className="detail-item">
              <span>Bet</span>
              <p className="detail-value accent">{match.betAmount} USDT</p>
            </div>
          </div>
          <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => navigate(`/arena/${match.id}`)}
            >
            Join
          </button>
        </div>
      ))}
    </div>
  );
};

const SettingsSidebar = ({ show, onClose }) => {
    const [currentView, setCurrentView] = useState('main');

    // Di chuyển userData vào trong để quản lý tập trung
    const userData = {
        name: 'Nguyen Van A',
        email: 'nguyenvana@example.com',
        telegramId: '@nguyenvana_trader',
        walletAddress: '0x123...abcd',
        vipLevel: 'Gold',
        affiliateCode: 'REF123XYZ',
        isVerified: true,
        joinDate: '2024-01-15',
    };

    const handleBack = () => setCurrentView('main');
    
    // Khi đóng sidebar, reset view về 'main'
    const handleClose = () => {
      onClose();
      setCurrentView('main');
    };

    const renderView = () => {
      console.log('Rendering view:', currentView); // Debug view hiện tại
      switch(currentView) {
        case 'personalInfo':
          return <PersonalInfoView onBack={handleBack} userData={userData} />;
        case 'language':
          return <LanguageView onBack={handleBack} />;
        case 'terms':
          return <TextView title="Terms of Service" onBack={handleBack} content="Đây là nội dung Điều khoản Dịch vụ..." />;
        case 'about':
          return <TextView title="About Project" onBack={handleBack} content="Dự án TRADE CHALLENGE..." />;
        default:
          return (
            <div className="sidebar-content">
              <div className="sidebar-header">
                <h2 className="sidebar-title">Settings</h2>
                <button className="icon-button close-button" onClick={handleClose}>
                  <img
                    src={arrowIcon}
                    alt="Close"
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    onError={() => console.error('Failed to load arrow icon')}
                  />
                </button>
              </div>
              <ul className="sidebar-nav-list">
                <li>
                  <button
                    className="sidebar-nav-item"
                    onClick={() => {
                      console.log('Navigating to personalInfo'); // Debug click
                      setCurrentView('personalInfo');
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <span>Personal Information</span>
                    <img
                      src={arrowIcon}
                      alt="Arrow"
                      style={{ width: '16px', height: '16px', objectFit: 'contain', transform: 'rotate(180deg)' }}
                      onError={() => console.error('Failed to load arrow icon')}
                    />
                  </button>
                </li>
                <li>
                  <button
                    className="sidebar-nav-item"
                    onClick={() => {
                      console.log('Navigating to language');
                      setCurrentView('language');
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <span>Language</span>
                    <img
                      src={arrowIcon}
                      alt="Arrow"
                      style={{ width: '16px', height: '16px', objectFit: 'contain', transform: 'rotate(180deg)' }}
                      onError={() => console.error('Failed to load arrow icon')}
                    />
                  </button>
                </li>
                <li>
                  <button
                    className="sidebar-nav-item"
                    onClick={() => {
                      console.log('Navigating to terms');
                      setCurrentView('terms');
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <span>Terms of Service</span>
                    <img
                      src={arrowIcon}
                      alt="Arrow"
                      style={{ width: '16px', height: '16px', objectFit: 'contain', transform: 'rotate(180deg)' }}
                      onError={() => console.error('Failed to load arrow icon')}
                    />
                  </button>
                </li>
                <li>
                  <button
                    className="sidebar-nav-item"
                    onClick={() => {
                      console.log('Navigating to about');
                      setCurrentView('about');
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <span>About Project</span>
                    <img
                      src={arrowIcon}
                      alt="Arrow"
                      style={{ width: '16px', height: '16px', objectFit: 'contain', transform: 'rotate(180deg)' }}
                      onError={() => console.error('Failed to load arrow icon')}
                    />
                  </button>
                </li>
              </ul>
            </div>
          );
      }
    };

    return (
        <>
            <div className={`settings-overlay ${show ? 'show' : ''}`} onClick={handleClose}></div>
            <div className={`settings-sidebar ${show ? 'show' : ''}`}>{renderView()}</div>
        </>
    );
};

const PersonalInfoView = ({ onBack, userData }) => {
    return (
        <div className="sidebar-view">
            <div className="sidebar-view-header">
                <button className="icon-button back-button" onClick={onBack}>
                  <img
                    src={arrowIcon}
                    alt="Back"
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    onError={() => console.error('Failed to load arrow icon')}
                  />
                </button>
                <h3 className="sidebar-title">Personal Information</h3>
            </div>
            <div className="personal-info-header">
                <img src={generateAvatarUrl(userData.name)} alt="User Avatar" className="personal-info-avatar" />
                <h4 className="personal-info-name">{userData.name}</h4>
                <p className="personal-info-id">{userData.telegramId}</p>
            </div>
            <ul className="sidebar-nav-list scrollable">
                <li className="list-item"><span className="list-item-label">Email</span><span className="list-item-value">{userData.email}</span></li>
                <li className="list-item"><span className="list-item-label">Wallet Address</span><span className="list-item-value">{userData.walletAddress}</span></li>
                <li className="list-item"><span className="list-item-label">VIP Level</span><span className="list-item-value accent">{userData.vipLevel}</span></li>
                <li className="list-item">
                    <span className="list-item-label">Affiliate Code</span>
                    <span className="list-item-value">{userData.affiliateCode}</span>
                </li>
                <li className="list-item"><span className="list-item-label">Verified</span><span className={`list-item-value ${userData.isVerified ? 'verified' : 'unverified'}`}>{userData.isVerified ? 'Yes' : 'No'}</span></li>
                <li className="list-item"><span className="list-item-label">Join Date</span><span className="list-item-value">{userData.joinDate}</span></li>
            </ul>
        </div>
    );
};

const LanguageView = ({ onBack }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('vi');
    const languages = [
        { code: 'en', name: 'English', flag: 'US' },
        { code: 'vi', name: 'Tiếng Việt', flag: 'VN' },
        { code: 'zh', name: '简体中文', flag: 'CN' },
    ];
    return (
        <div className="sidebar-view">
            <div className="sidebar-view-header">
                <button className="icon-button back-button" onClick={onBack}>
                  <img
                    src={arrowIcon}
                    alt="Back"
                    style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                    onError={() => console.error('Failed to load arrow icon')}
                  />
                </button>
                <h3 className="sidebar-title">Language</h3>
            </div>
            <ul className="sidebar-nav-list">
                {languages.map(lang => (
                    <li key={lang.code}>
                        <label htmlFor={`lang-${lang.code}`} className="sidebar-nav-item language-item">
                            <div style={{display: 'flex', alignItems: 'center'}}>
                                <img src={`https://flagsapi.com/${lang.flag}/flat/64.png`} alt={`${lang.name} Flag`} className="language-flag" />
                                <span>{lang.name}</span>
                            </div>
                            <input
                                type="radio"
                                id={`lang-${lang.code}`}
                                name="language"
                                value={lang.code}
                                checked={selectedLanguage === lang.code}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="language-radio"
                            />
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const TextView = ({ title, content, onBack }) => (
    <div className="sidebar-view">
        <div className="sidebar-view-header">
            <button className="icon-button back-button" onClick={onBack}>
              <img
                src={arrowIcon}
                alt="Back"
                style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                onError={() => console.error('Failed to load arrow icon')}
              />
            </button>
            <h3 className="sidebar-title">{title}</h3>
        </div>
        <div className="text-view-card">
            <p>{content}</p>
        </div>
    </div>
);

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false); // Thêm state theo dõi focus
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      { text: 'Xin chào! Tôi là trợ lý AI của bạn. Tôi có thể giúp gì về thông tin thị trường hoặc các mẹo giao dịch?', sender: 'bot' }
    ]);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage = { text: trimmedInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const apiKey = ""; // Để test fallback, thay bằng key hợp lệ sau

    if (!apiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, { text: "Tính năng chat đang được cấu hình. Vui lòng thử lại sau.", sender: 'bot' }]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: trimmedInput }] }] })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      const botResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không nhận được phản hồi từ bot.';
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error) {
      console.error("Lỗi API chatbot:", error);
      setMessages(prev => [...prev, { text: "Đã có lỗi xảy ra. Vui lòng thử lại.", sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="chatbot-messages" style={{ flex: '1 1 auto', overflowY: 'auto', paddingBottom: isInputFocused ? '100px' : '20px' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble-row ${msg.sender}`}>
            <div className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble-row bot">
            <div className="message-bubble bot loading-pulse">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="chatbot-input-area"
        style={{ display: 'flex', alignItems: 'center', position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--color-background)', zIndex: 20 }}
        onSubmit={sendMessage}
      >
        <input
          type="text"
          className="chatbot-input form-input"
          placeholder="Nhập thông tin..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          disabled={isLoading}
          style={{ flex: 1, marginRight: '0.5rem' }}
        />
        <button type="submit" className="chatbot-send-btn btn btn-primary" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

// ===================================================================================
// COMPONENT APP CHÍNH
// ===================================================================================
const AppContent = () => {
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  
  // Dùng useRef thay vì useState để không re-render component mỗi khi scroll
  const lastScrollY = useRef(0); 
  const ticking = useRef(false); // Dùng để debounce sự kiện scroll

  const [activePage, setActivePage] = useState('home');
  const location = useLocation();

  // THAY THẾ TOÀN BỘ KHỐI USEEFFECT XỬ LÝ SCROLL BẰNG KHỐI NÀY
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const handleScroll = () => {
      const currentScrollY = mainContent.scrollTop;

      // Nếu chưa có yêu cầu nào đang chờ xử lý, thì mới tạo yêu cầu mới
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const isDetailPage = location.pathname.startsWith('/match/') || 
                               location.pathname.startsWith('/news/') || 
                               location.pathname.startsWith('/arena/');
          
          if (isDetailPage) {
              // Trên trang chi tiết, không làm gì cả
              setShowHeader(false);
              setShowFooter(false);
          } else {
              // Chỉ xử lý ẩn/hiện trên các trang không phải chi tiết
              if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                  setShowHeader(false);
                  setShowFooter(false);
              } else if (currentScrollY < lastScrollY.current) {
                  setShowHeader(true);
                  setShowFooter(location.pathname !== '/chatbot');
              }
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false; // Đánh dấu đã xử lý xong
        });

        ticking.current = true; // Đánh dấu đang chờ xử lý
      }
    };

    mainContent.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainContent.removeEventListener('scroll', handleScroll);
  }, [location.pathname]); // Bỏ lastScrollY khỏi dependency array


  // useEffect này để xử lý trạng thái ban đầu khi chuyển trang
  useEffect(() => {
    const path = location.pathname.substring(1); // Bỏ dấu / ở đầu
    const page = path.split('/')[0];
    const isDetailPage = ['match', 'news', 'arena'].includes(page) && path.includes('/');

    if (isDetailPage) {
      setActivePage('');
    } else {
      setActivePage(page || 'home');
    }
  }, [location.pathname]);


useEffect(() => {
  setShowHeader(!(location.pathname.startsWith('/match') || location.pathname.startsWith('/news/') || location.pathname.startsWith('/arena/')));
  setShowFooter(!(location.pathname.startsWith('/match') || location.pathname.startsWith('/news/') || location.pathname.startsWith('/arena/') || location.pathname === '/chatbot'));
}, [location.pathname]);

  useEffect(() => {
  const path = location.pathname;
  if (path.startsWith('/match') || path.startsWith('/news/')) {
    setActivePage('');
  } else {
    setActivePage(path.replace('/', '') || 'home');
  }
}, [location]);

  return (
    <div className="app-container">
      <Header 
        onSettingsClick={() => setShowSettingsSidebar(true)} 
        onChatbotClick={() => setActivePage('chatbot')}
        showHeader={showHeader}
      />
      <main
        id="main-content"
        className={`main-content ${!showHeader ? 'no-header-padding' : ''} ${!showFooter ? 'no-footer-padding' : ''}`}
      >
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/arena" element={<ArenaPage />} />
          <Route path="/arena/:id" element={<ArenaDetail />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={
            <div className="page-padding">
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          } />
        </Routes>
      </main>
      <Footer 
        activePage={activePage}
        setActivePage={setActivePage}
        showFooter={showFooter}
      />
      <SettingsSidebar 
        show={showSettingsSidebar} 
        onClose={() => setShowSettingsSidebar(false)} 
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
