import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MatchDetail from './components/MatchDetail';
import NewsDetail from './components/NewsDetail';
import ArenaDetail from './components/ArenaDetail';
import TournamentDetail from './components/TournamentDetail';
import LazyLoad from 'react-lazyload';
import { FixedSizeList } from 'react-window';
import { notifyAdminOfDeposit, requestWithdrawal } from './services/telegramService';

import settingIcon from './assets/setting.png';
import chatboxIcon from './assets/chatbox.png';
import homeActive from './assets/home-2.png';
import homeInactive from './assets/home-1.png';
import newsActive from './assets/review-2.png';
import newsInactive from './assets/review-1.png';
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
        <FooterButton icon="news" label="Review" page="news" activePage={activePage} setActivePage={setActivePage} />
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
  const navigate = useNavigate();
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const isPaused = useRef(false);
  const containerRef = useRef(null);
  const isVisible = useRef(true);

  // Hàm chuyển slide
  const goToNextSlide = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  // Animation loop
  const animate = (time) => {
    if (!isVisible.current || isPaused.current) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    if (time - lastTimeRef.current >= 5000) {
      goToNextSlide();
      lastTimeRef.current = time;
    }

    rafRef.current = requestAnimationFrame(animate);
  };

  // Khởi động và dừng animation
  useEffect(() => {
    if (items.length <= 1) {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        return;
    }

    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [items]);

  // Tạm dừng khi cuộn
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      isPaused.current = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isPaused.current = false;
        lastTimeRef.current = performance.now();
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  // Theo dõi visibility của banner
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
    lastTimeRef.current = performance.now();
  };

  return (
    <div className="banner-container" ref={containerRef}>
      <div className="banner-slides" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {items.map((item) => (
          <div className="banner-slide" key={item.id} onClick={() => navigate(`/news/${item.id}`)}>
            <LazyLoad height={220} offset={100}>
              <img
                src={item.thumbnail}
                alt={`Event ${item.id}`}
                className="banner-image"
                loading="lazy"
                onError={(e) => {
                  console.error(`Img load error for src: ${item.thumbnail}`);  // Log error src
                  e.target.src = 'https://placehold.co/500x220';
                }}
                onLoad={() => console.log(`Img loaded successfully for src: ${item.thumbnail}`)}  // Log nếu load ok
              />
            </LazyLoad>
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
};

const HomePage = () => {
  const navigate = useNavigate();

  const [bannerItems, setBannerItems] = useState([]);
  const [ongoingMatches, setOngoingMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchBanner = async () => {
      console.log('Checking sessionStorage for banner_data');  // Log: Kiểm tra trước khi fetch
      const cachedBanner = sessionStorage.getItem('banner_data');
      if (cachedBanner) {
        console.log('Using cached banner data from sessionStorage');
        const parsedData = JSON.parse(cachedBanner);
        setBannerItems(parsedData);
        return;
      }
      try {
        const response = await fetch('https://f2farena.com/api/events/banner');
        const data = await response.json();
        console.log('Fetched banner data:', data);
        if (data && data.length > 0) {
          console.log('Thumbnail URL to load:', data[0].thumbnail);
        }
        // Thêm map để prepend full URL cho thumbnail
        const updatedData = data.map(item => ({
          ...item,
          thumbnail: `https://f2farena.com/${item.thumbnail}` // Prepend backend base URL
        }));
        setBannerItems(updatedData);
        sessionStorage.setItem('banner_data', JSON.stringify(updatedData));  // Lưu cache
        console.log('Stored banner data to sessionStorage');
      } catch (error) {
        console.error('Error fetching banner:', error);
      }
    };
    const fetchOngoing = async () => {
      console.log('Checking sessionStorage for ongoing_matches');
      const cachedOngoing = sessionStorage.getItem('ongoing_matches');
      if (cachedOngoing) {
        console.log('Using cached ongoing matches from sessionStorage');
        const parsedData = JSON.parse(cachedOngoing);
        setOngoingMatches(parsedData);
        return;
      }
      try {
        const response = await fetch('https://f2farena.com/api/matches/ongoing');
        // SỬA: Thêm check response.ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched ongoing matches for home:', data);

        // SỬA: Kiểm tra data có phải là một mảng không trước khi map
        if (!Array.isArray(data)) {
          console.error('API response is not an array:', data);
          setOngoingMatches([]); // Set về mảng rỗng để tránh lỗi
          return;
        }

        const updatedData = data.map(item => ({
          ...item,
          thumbnail: `https://f2farena.com/${item.thumbnail}`
        }));
        const limitedData = updatedData.slice(0, 5);
        setOngoingMatches(limitedData);
        sessionStorage.setItem('ongoing_matches', JSON.stringify(limitedData));
        console.log('Stored ongoing matches to sessionStorage');
      } catch (error) {
        console.error('Error fetching ongoing matches:', error);
        setOngoingMatches([]); // Set về mảng rỗng khi có lỗi
      }
    };
    const fetchTournaments = async () => {
      console.log('Checking sessionStorage for tournaments_home');  // Log: Kiểm tra trước khi fetch
      const cachedTournaments = sessionStorage.getItem('tournaments_home');
      if (cachedTournaments) {
        console.log('Using cached tournaments for home from sessionStorage');
        const parsedData = JSON.parse(cachedTournaments);
        setTournaments(parsedData);
        return;
      }
      try {
        const response = await fetch('https://f2farena.com/api/tournaments/?offset=0');
        const data = await response.json();
        console.log('Fetched tournaments for home:', data);
        const updatedData = data.map(item => ({
          ...item,
          thumbnail: `https://f2farena.com/${item.thumbnail}`  // Thêm prepend full URL cho thumbnail, đồng bộ với banner
        }));
        const limitedData = updatedData.slice(0, 5);
        setTournaments(limitedData);
        console.log('Set tournaments state:', limitedData.length, limitedData);
        sessionStorage.setItem('tournaments_home', JSON.stringify(limitedData));
        console.log('Stored tournaments for home to sessionStorage');
      } catch (error) {
        console.error('Error fetching tournaments for home:', error);
      }
    };
    fetchBanner();
    fetchOngoing();
    fetchTournaments();
  }, []);

  return (
    <div>
      <EventBanner items={bannerItems} />
      <div className="page-padding">
        <h2 className="section-title">⚔️ Matching</h2>
        {ongoingMatches.map((match) => {
          const player1Width = (match.player1.score / (match.player1.score + match.player2.score)) * 100;
          const player2Width = (match.player2.score / (match.player1.score + match.player2.score)) * 100;

          return (
            <div key={match.id} className="card match-card" onClick={() => navigate(`/match/${match.id}`)} style={{ cursor: 'pointer' }}>
              <div className="top-section">
                <div className="player-info">
                  <LazyLoad height={48} offset={100}>
                    <img src={match.player1.avatar} alt={match.player1.name} className="player-avatar" loading="lazy" />
                  </LazyLoad>
                  <span className="player-name">{match.player1.name}</span>
                  <span className="player-odds">{match.player1.odds}</span>
                </div>
                <div className="center-details">
                  <div className="time-remaining">{match.timeRemaining}</div>
                  <div className="vs-text">VS</div>
                </div>
                <div className="player-info">
                  <LazyLoad height={48} offset={100}>
                    <img src={match.player2.avatar} alt={match.player2.name} className="player-avatar" loading="lazy" />
                  </LazyLoad>
                  <span className="player-name">{match.player2.name}</span>
                  <span className="player-odds">{match.player2.odds}</span>
                </div>
              </div>
              <div className="score-bar-container">
                <div className="score-bar">
                  <div className="score-bar-player1" style={{ width: `${player1Width}%` }}></div>
                  <div className="score-bar-player2" style={{ width: `${player2Width}%` }}></div>
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
                  <div className="info-item icon-info">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    <span>{match.views}</span>
                  </div>
                  <div className="info-item icon-info">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    <span>{match.outsideBetsTotal} USDT</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <h2 className="section-title">🏆 Tournaments</h2>
        {tournaments.map(item => (
          <div key={item.id} className="card tournament-card">
            <div className="tournament-thumbnail-wrapper thumbnail-skeleton">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="tournament-thumbnail"
                loading="lazy"
                onError={(e) => {
                  console.error(`Failed to load image: ${item.thumbnail}`);
                  e.target.src = 'https://placehold.co/500x220?text=Image+Not+Found';
                }}
                onLoad={(e) => { e.target.parentNode.classList.add('loaded'); }}
              />
              <TournamentStatus startTime={item.event_time} />
            </div>
            <div className="tournament-content">
              <h3 className="tournament-title">{item.title}</h3>
              <div className="tournament-details-grid">
                <div className="detail-item">
                  <span>Prize Pool</span>
                  <p className="detail-value accent">{item.prize_pool} USDT</p>
                </div>
                <div className="detail-item">
                  <span>Participants</span>
                  <p className="detail-value">{item.participants}</p>
                </div>
                <div className="detail-item">
                  <span>Symbol</span>
                  <p className="detail-value primary">{item.symbol}</p>
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => navigate(`/tournament/${item.id}`)}
              >
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ComplaintThread = ({ complaint, onUpdateStatus, onToggleExpand, isExpanded }) => {
    const detailRef = useRef(null);

    return (
        <div className="card complaint-thread">
            <div className="complaint-thread__header">
                <div className="complaint-thread__user-info">
                    <img src={generateAvatarUrl(complaint.user)} alt={complaint.user} className="challenger-avatar" />
                    <div>
                        <p className="challenger-name">{complaint.user}</p>
                        {/* Bổ sung tên Broker */}
                        <p className="challenger-country">
                            Broker: <span style={{ fontWeight: 'bold' }}>{complaint.broker_name}</span>
                        </p>
                        <p className="challenger-country">{new Date(complaint.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <p className="complaint-thread__summary">{complaint.summary}</p>
            <div 
                ref={detailRef}
                className="complaint-thread__details"
                style={{ maxHeight: isExpanded ? `${detailRef.current?.scrollHeight}px` : '0px' }}
            >
                <div className="complaint-thread__details-content">
                    <p>{complaint.details}</p>
                </div>
            </div>
            <div className="complaint-thread__actions">
                <div className="action-buttons-left">
                    {/* Nút Mark as Resolved giờ sẽ gọi onUpdateStatus */}
                    <button className="btn-action resolve" onClick={() => onUpdateStatus(complaint.id)}>
                        Mark as Resolved
                    </button>
                </div>
                 <button className="btn-action" onClick={() => onToggleExpand(complaint.id)}>
                    {isExpanded ? 'Collapse' : 'View Detail'}
                    <svg className={`filter-arrow ${isExpanded ? 'open' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

const ComplaintModal = ({ onClose, onSubmit, user }) => {
    const [brokerName, setBrokerName] = useState('');
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!brokerName.trim() || !title.trim() || !comment.trim()) {
            alert('Please fill in all fields.');
            return;
        }
        setShowConfirmation(true);
    };

    const confirmSubmit = async () => {
        if (!user || !user.telegram_id) {
            alert("User information is missing. Cannot submit.");
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
                broker_name: brokerName,
                title,
                comment,
                user_id: user.telegram_id
            });
            // Nếu onSubmit thành công, nó sẽ tự đóng modal
        } catch (error) {
            // Lỗi đã được alert() ở component cha, chỉ cần dừng loading
            console.error('Submission failed and caught in modal:', error);
        } finally {
            setIsSubmitting(false);
            // Không đóng confirmation ở đây, để user thấy thông báo lỗi và quyết định
        }
    };

    // Sử dụng styling từ DepositForm để đảm bảo tính nhất quán
    return (
        <div className="deposit-modal-wrapper" onClick={onClose}>
            <div className="deposit-modal-content" onClick={(e) => e.stopPropagation()}>
                {!showConfirmation ? (
                     <>
                        <div className="form-header">
                            <h2>Create New Complaint</h2>
                            <button onClick={onClose} className="icon-button close-button">&times;</button>
                        </div>
                        <form className="card" onSubmit={handleSubmit} style={{border: 'none', background: 'transparent', padding: 0}}>
                            <div className="form-group">
                                <label className="form-label">Broker Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={brokerName}
                                    onChange={(e) => setBrokerName(e.target.value)}
                                    placeholder="e.g., Exness"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter a brief title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Comment</label>
                                <textarea
                                    className="form-input"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Describe your issue in detail"
                                    rows={5}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="confirmation-modal card" style={{position: 'static', transform: 'none', background: 'transparent', boxShadow: 'none'}}>
                        <h4>Confirm Complaint</h4>
                        <p>Are you sure you want to submit this complaint?</p>
                        <div className="confirmation-buttons">
                            <button className="btn btn-secondary" onClick={() => setShowConfirmation(false)} disabled={isSubmitting}>Cancel</button>
                            <button className="btn btn-primary" onClick={confirmSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Confirming...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const NewsPage = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('broker-review');
  const [allArticles, setAllArticles] = useState([]);
  const [complaintsData, setComplaintsData] = useState([]);
  const [showComplaintModal, setShowComplaintModal] = useState(false); // State để quản lý modal

  // Hàm map dữ liệu brokers để sử dụng trong component
  const mapBrokerData = (brokers) => {
    return brokers.map(broker => ({
      id: broker.id,
      style: 'broker-review',
      title: `Broker ${broker.broker_name} Review: Is It Reliable?`,
      brokerName: broker.broker_name,
      country: broker.nation_code,
      countryCode: broker.nation_code === '86' ? 'CN' : broker.nation_code.toUpperCase(),
      yearsActive: broker.years,
      score: broker.average_star,
      summary: broker.description,
      thumbnail: `https://f2farena.com/${broker.thumbnail}`,
      content: broker.description,
      ratings: { license: broker.star_1, insurance: broker.star_2, localization: broker.star_3, commission: broker.star_4, stability: broker.star_5, 'on-boarding': broker.star_6 }
    }));
  };

  // Hàm fetch dữ liệu cho Broker Reviews (chạy 1 lần khi component mount)
  useEffect(() => {
    const fetchBrokers = async () => {
      const cached = sessionStorage.getItem('brokers_data');
      if (cached) {
        const parsed = JSON.parse(cached);
        if(parsed.brokers) {
            setAllArticles(mapBrokerData(parsed.brokers));
            return;
        }
      }
      try {
        const response = await fetch('https://f2farena.com/api/brokers/list');
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        setAllArticles(mapBrokerData(data.brokers));
        sessionStorage.setItem('brokers_data', JSON.stringify({ brokers: data.brokers }));
      } catch (error) {
        console.error('Error fetching brokers:', error);
      }
    };
    fetchBrokers();
  }, []);

  // Hàm fetch dữ liệu cho Complaints
  const fetchComplaints = async (clearCache = false) => {
    if (clearCache) {
      sessionStorage.removeItem('complaints_data');
    }
    const cachedComplaints = sessionStorage.getItem('complaints_data');
    if (cachedComplaints) {
      const parsedData = JSON.parse(cachedComplaints);
      setComplaintsData(parsedData.complaints.map(c => ({ ...c, id: c.id, details: c.comment, summary: c.title, user: c.username, timestamp: c.created_at, status: c.resolved ? 'resolved' : 'open' })));
      return;
    }
    try {
      const response = await fetch('https://f2farena.com/api/complaints/');
      const data = await response.json();
      setComplaintsData(data.complaints.map(c => ({ ...c, id: c.id, details: c.comment, summary: c.title, user: c.username, timestamp: c.created_at, status: c.resolved ? 'resolved' : 'open' })));
      sessionStorage.setItem('complaints_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'complaint') {
      fetchComplaints();
    }
  }, [activeTab]);

  const [expandedComplaints, setExpandedComplaints] = useState({});
  const handleToggleExpand = (id) => {
    setExpandedComplaints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Hàm xử lý khi nhấn nút "Mark as Resolved"
  const handleUpdateComplaintStatus = async (complaintId) => {
      try {
          const response = await fetch(`https://f2farena.com/api/complaints/${complaintId}/resolve`, {
              method: 'PATCH',
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || 'Failed to update status');
          }
          alert('Complaint marked as resolved.');
          fetchComplaints(true); // Tải lại danh sách để loại bỏ complaint đã giải quyết
      } catch (error) {
          alert(`Error: ${error.message}`);
          console.error('Error updating complaint status:', error);
      }
  };

  // Hàm xử lý khi submit form tạo complaint mới
  const handleCreateComplaint = async (complaintData) => {
    try {
      const response = await fetch('https://f2farena.com/api/complaints/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create complaint');
      }
      alert('Complaint created successfully!');
      setShowComplaintModal(false);
      fetchComplaints(true);
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error('Error creating complaint:', error);
    }
  };

  return (
    <div className="page-padding">
      <div className="wallet-tabs">
        <button className={`wallet-tab-button ${activeTab === 'broker-review' ? 'active' : ''}`} onClick={() => setActiveTab('broker-review')}>Broker Review</button>
        <button className={`wallet-tab-button ${activeTab === 'complaint' ? 'active' : ''}`} onClick={() => setActiveTab('complaint')}>Complaint</button>
      </div>

      {activeTab === 'broker-review' && allArticles.map((article) => (
        <div key={article.id} className="news-card" onClick={() => navigate(`/news/${article.id}`)} style={{ cursor: 'pointer' }}>
          <LazyLoad height={220} offset={100}>
            <img 
              src={article.thumbnail} 
              alt={article.title} 
              className="news-thumbnail" 
              loading="lazy" 
              onError={(e) => {
                console.error(`Broker thumbnail error: ${article.thumbnail}`);
                e.target.src = 'https://placehold.co/500x220?text=Image+Error';
              }} 
              onLoad={() => console.log(`Broker thumbnail loaded: ${article.thumbnail}`)}
            />
          </LazyLoad>
          <div className="news-content review-card-content">
              <div className="review-card-header">
                  <div className="review-card-main-info">
                      <h4 className="review-card-broker-name">{article.brokerName}</h4>
                      <div className="review-card-info-line">
                          <img 
                              src={`https://flagsapi.com/${article.countryCode}/flat/64.png`} 
                              alt={`${article.country} flag`}
                              className="review-card-flag"
                          />
                          <span>{article.country}</span>
                          <span className="info-separator">•</span>
                          <span>{article.yearsActive} years</span>
                      </div>
                  </div>
                  <div className="review-card-score">
                      <span className="score-value">{article.score.toFixed(1)}</span>
                      <span className="score-label">Score</span>
                  </div>
              </div>
              <p className="review-card-summary">{article.summary}</p>
          </div>
        </div>
      ))}

      {activeTab === 'complaint' && (
        <div className="complaint-section">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowComplaintModal(true)} 
              style={{fontSize: '1rem', padding: '0.5rem 1rem'}}
            >
              + New Thread
            </button>
          </div>
          {complaintsData.map(complaint => (
            <ComplaintThread
              key={complaint.id}
              complaint={complaint}
              onUpdateStatus={handleUpdateComplaintStatus} // Truyền hàm mới vào
              onToggleExpand={handleToggleExpand}
              isExpanded={!!expandedComplaints[complaint.id]}
            />
          ))}
        </div>
      )}

      {showComplaintModal && (
        <ComplaintModal
          user={user}
          onClose={() => setShowComplaintModal(false)}
          onSubmit={handleCreateComplaint}
        />
      )}
    </div>
  );
};

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('traders');
  const [tradersData, setTradersData] = useState([]);  // State cho personal
  const [teamsData, setTeamsData] = useState([]);  // State cho tournament

  useEffect(() => {
    const fetchLeaderboard = async (type) => {
      const cacheKey = `${type}_leaderboard`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        console.log(`Using cached ${type} leaderboard`);
        return JSON.parse(cached);
      }
      try {
        const response = await fetch(`https://f2farena.com/api/leaderboard/${type}`);
        const data = await response.json();
        console.log(`Fetched ${type} leaderboard:`, data);
        // Map data to format (add rank, name/avatar from generate or future join)
        const mapped = data.map((item, index) => ({
          id: item.user_id,
          rank: index + 1,
          name: item.user_name || item.user_id,  // Ưu tiên user_name từ users.name, fallback user_id (telegram_id)
          avatar: generateAvatarUrl(item.user_name || item.user_id),  // Avatar based on name or id
          wins: item.wins,
          profit: item.profit,
          totalWinnings: item.profit  
        }));
        sessionStorage.setItem(cacheKey, JSON.stringify(mapped));
        return mapped;
      } catch (error) {
        console.error(`Error fetching ${type} leaderboard:`, error);
        return [];
      }
    };

    const loadData = async () => {
      const personal = await fetchLeaderboard('personal');
      setTradersData(personal);
      const tournament = await fetchLeaderboard('tournament');
      setTeamsData(tournament);
    };
    loadData();
  }, []);  // Fetch once on mount

  const currentData = activeTab === 'traders' ? tradersData : teamsData;

  return (
    <div className="page-padding">
      <div className="wallet-tabs">
        <button
          className={`wallet-tab-button ${activeTab === 'traders' ? 'active' : ''}`}
          onClick={() => setActiveTab('traders')}
        >
          Top Tournament Winners
        </button>
        <button
          className={`wallet-tab-button ${activeTab === 'betOutside' ? 'active' : ''}`}
          onClick={() => setActiveTab('betOutside')}
        >
          Top Personal Winners
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
          {currentData.map(item => (
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

const WalletPage = ({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('assetInfo');
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [showUpdateWalletAddressForm, setShowUpdateWalletAddressForm] = useState(false);
  const [walletData, setWalletData] = useState({
    currentBalance: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalWinnings: 0, 
    totalLosses: 0, 
    affiliateCommission: 0, 
    transactionHistory: [],
  });

  // Lấy currentBalance từ user.bet_wallet khi component mount hoặc user thay đổi
  useEffect(() => {
    if (user && user.bet_wallet !== undefined) {
      setWalletData(prevData => ({
        ...prevData,
        currentBalance: parseFloat(user.bet_wallet)
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchTransactionHistory = async () => {
      if (!user || !user.telegram_id) return;

      try {
        // Chỉ fetch lịch sử giao dịch, không fetch current_balance nữa
        const response = await fetch(`https://f2farena.com/api/users/${user.telegram_id}/history-transactions`); // Sẽ điều chỉnh endpoint này ở main.py
        if (!response.ok) throw new Error('Failed to fetch transaction history');
        const data = await response.json();

        const totalDeposits = data.transaction_history
            .filter(tx => tx.type === 'deposit')
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

        const totalWithdrawals = data.transaction_history
            .filter(tx => tx.type === 'withdraw')
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

        setWalletData(prevData => ({
          ...prevData,
          totalDeposits: totalDeposits,
          totalWithdrawals: totalWithdrawals,
          transactionHistory: data.transaction_history.map(tx => ({
                id: `${tx.type}-${tx.created_at}-${tx.amount}`, // Tạo ID duy nhất hơn
                type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1), 
                amount: `${parseFloat(tx.amount).toFixed(2)} USDT`,
                date: new Date(tx.created_at).toLocaleString(),
                status: 'Completed', 
            })),
        }));
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      }
    };

    fetchTransactionHistory();
  }, [user]);

  const handleWithdrawClick = () => {
    if (!user) {
      alert('Thông tin người dùng chưa được tải. Vui lòng thử lại.');
      return;
    }
    // Kiểm tra nếu wallet_address chưa có hoặc là string rỗng (hoặc chỉ toàn khoảng trắng)
    if (!user.wallet_address || user.wallet_address.trim() === '') {
      setShowUpdateWalletAddressForm(true); // Hiển thị form cập nhật ví
    } else {
      setShowWithdrawForm(true); // Hiển thị form rút tiền
    }
  };

  const handleWalletAddressUpdated = (updatedUser) => {
    onUserUpdate(updatedUser); // Cập nhật user state ở AppContent
    setShowUpdateWalletAddressForm(false); // Đóng form cập nhật
    setShowWithdrawForm(true); // Mở form rút tiền ngay lập tức
  };

  if (showUpdateWalletAddressForm) {
    return (
      <UpdateWalletAddressForm
        onClose={() => setShowUpdateWalletAddressForm(false)}
        user={user}
        onWalletAddressUpdated={handleWalletAddressUpdated}
      />
    );
  }

  if (showWithdrawForm) {
    return (
      <WithdrawForm
        onClose={() => setShowWithdrawForm(false)}
        user={user}
        onUserUpdate={onUserUpdate}
      />
    );
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
            <span className="value accent">{walletData.currentBalance.toFixed(2)} USDT</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Total Deposits</span>
            <span className="value win">{walletData.totalDeposits.toFixed(2)} USDT</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Total Withdrawals</span>
            <span className="value secondary">{walletData.totalWithdrawals.toFixed(2)} USDT</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Total Winnings</span>
            <span className="value win">{walletData.totalWinnings.toFixed(2)} USDT</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Total Losses</span>
            <span className="value loss">{walletData.totalLosses.toFixed(2)} USDT</span>
          </div>
          <div className="wallet-info-row">
            <span className="label">Affiliate Commission</span>
            <span className="value accent">{walletData.affiliateCommission.toFixed(2)} USDT</span>
          </div>
          <div className="wallet-buttons">
            <button className="btn btn-accent" onClick={handleWithdrawClick}>Withdraw</button>
          </div>
        </div>
      )}
      {activeTab === 'transactionHistory' && (
        <div className="card">
          {walletData.transactionHistory.length > 0 ? (
            walletData.transactionHistory.map(tx => (
              <div key={tx.id} className="wallet-info-row">
                <div>
                  <p className="label" style={{ margin: 0 }}>{tx.type}</p>
                  <p className="secondary" style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-secondary-text)' }}>{tx.date}</p>
                </div>
                <div className={`value ${tx.type === 'Loss' || tx.type === 'Withdraw' ? 'loss' : 'win'}`}>
                  <span>{tx.type === 'Loss' || tx.type === 'Withdraw' ? '-' : '+'} {tx.amount}</span>
                  <span className={`status-dot ${tx.status.toLowerCase()}`}>{tx.status}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-secondary-text)' }}>No transactions found.</p>
          )}
        </div>
      )}
    </div>
  );
};

const CreateNewMatchForm = ({ onClose, brokersList, user, onCreateSuccess }) => {
    const [betAmount, setBetAmount] = useState('');
    const [tradingSymbol, setTradingSymbol] = useState('');
    const [challengeMode, setChallengeMode] = useState('waiting');
    const [opponentId, setOpponentId] = useState('');
    const [durationTime, setDurationTime] = useState(1);
    const [selectedBroker, setSelectedBroker] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleConfirm = (e) => {
        e.preventDefault();
        // Thêm kiểm tra validation cơ bản ở đây nếu cần
        setShowConfirmation(true);
    };

    const confirmMatchSetup = async () => {  // Add async for await fetch
      console.log("Creating match:", { betAmount, tradingSymbol, challengeMode, opponentId, durationTime, selectedBroker });
      try {
          const response = await fetch('https://f2farena.com/api/matches/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bet: parseFloat(betAmount),
              pair: tradingSymbol,
              player1_id: user?.telegram_id,
              player2_id: challengeMode === 'waiting' ? null : Number(opponentId),
              duration_time: durationTime,
              broker_id: parseInt(selectedBroker)
            })
          });
          if (!response.ok) {
              const errorData = await response.json();
              console.error('Create match failed:', response.status, errorData.detail);  // Log error detail (e.g invalid broker_id)
              alert('Create failed: ' + errorData.detail);  // Show user
              return;
          }
          const data = await response.json();
          console.log('Create match success, id:', data.id);  // Log success
          setShowConfirmation(false);
          onClose();
          onCreateSuccess?.();
      } catch (error) {
          console.error('Error POST create match:', error);
          alert('Error creating match');
      }
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
                    <div className="form-group">
                      <label className="form-label">Duration Time (hours)</label>
                      <select
                        className="form-input"
                        value={durationTime}
                        onChange={(e) => setDurationTime(Number(e.target.value))}
                        required
                      >
                        <option value={1}>1 hour</option>
                        <option value={4}>4 hours</option>
                        <option value={8}>8 hours</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Broker</label>
                      <select
                        className="form-input"
                        value={selectedBroker}
                        onChange={(e) => setSelectedBroker(e.target.value)}
                        required
                      >
                        <option value="">Select Broker</option>
                        {brokersList.map(broker => (
                          <option key={broker.id} value={broker.id}>{broker.name}</option>
                        ))}
                      </select>
                    </div>
                    {challengeMode === 'specific' && (                       
                      <div className="form-group">
                          <label className="form-label">Opponent's ID</label>
                          <input
                              type="number"
                              className="form-input"
                              value={opponentId}
                              onChange={(e) => setOpponentId(e.target.value)}
                              placeholder="Enter Telegram ID"
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

const DepositForm = ({ onClose, user, onUserUpdate }) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [memoContent, setMemoContent] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [timer, setTimer] = useState(600);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef(null); 
  const walletAddress = 'TUYDJGWvzE54Wpq1AqFXWCUkjbyozrK1L2';

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!depositAmount || !memoContent) {
      alert('Please enter both deposit amount and memo content.');
      return;
    }
    
    if (!user || !user.telegram_id) {
      console.error("User data is not available. Cannot send notification.");
      alert("User information missing. Please refresh or try again.");
      return;
    }

    try {
      await notifyAdminOfDeposit(user.telegram_id, depositAmount, memoContent);
      setShowConfirmation(true);
      setTimer(600); 

      startPollingBalance();
    } catch (error) {
      console.error('Error in deposit confirmation process:', error);
      alert('There was an issue processing your deposit. Please try again or contact support.');
    }
  };

  const startPollingBalance = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let pollingAttempts = 0;
    const maxPollingTime = 600; 
    const intervalDuration = 30 * 1000; 

    intervalRef.current = setInterval(async () => {
      pollingAttempts++;
      console.log(`Polling attempt ${pollingAttempts} for user ${user.telegram_id} balance...`);

      if (timer <= 0) { 
        clearInterval(intervalRef.current);
        console.log('Polling stopped: QR code timer expired.');
        alert("Deposit confirmation time expired. If you've sent money, please contact support!");
        onClose(); 
        return;
      }

      try {
        // Fetch lại user data để có balance mới nhất
        const response = await fetch(`https://f2farena.com/api/users/${user.telegram_id}`);
        if (!response.ok) throw new Error('Failed to fetch user balance from API');
        const updatedUserData = await response.json();
        const currentBetWallet = parseFloat(updatedUserData.bet_wallet);
        const expectedBalance = parseFloat(user.bet_wallet) + parseFloat(depositAmount); // So sánh với balance LÚC BẮT ĐẦU nạp + số tiền nạp

        console.log(`Fetched current balance: ${currentBetWallet}, Expected after deposit: ${expectedBalance}`);

        if (Math.abs(currentBetWallet - expectedBalance) < 0.001) { 
          alert("🎉 Deposit successful! Your balance has been updated.");
          clearInterval(intervalRef.current); 
          onClose(); 
          onUserUpdate(updatedUserData); // Cập nhật user object ở AppContent
        }
      } catch (error) {
        console.error('Error fetching current balance during polling:', error);
      }
    }, intervalDuration);
  };

  // Clear interval when component unmounts or confirmation view changes
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); 

  // Timer for QR code display
  useEffect(() => {
    if (!showConfirmation || timer <= 0) return;
    const countdown = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(countdown);
  }, [showConfirmation, timer]);

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
    const seconds = (timer % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="deposit-modal-wrapper" onClick={onClose}>
      <div className="deposit-modal-content" onClick={(e) => e.stopPropagation()}>
        {showConfirmation ? (
          // QR Code and Timer Interface
          <>
            <div className="form-header">
              <h2>Scan QR to Deposit</h2>
              <button onClick={onClose} className="icon-button close-button">×</button>
            </div>
            <div className="card" style={{padding: '1rem', border: 'none', background: 'transparent'}}>
              <p style={{ textAlign: 'center' }}>Deposit {depositAmount} USDT with memo: {memoContent}</p>
              <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
                Please transfer to the address below with the exact amount and Memo requested
              </p>
              <img
                src={qrCode}
                alt="QR Code"
                style={{ width: '150px', height: '150px', margin: '0 auto', display: 'block' }}
                onError={() => console.error('Failed to load QR code')}
              />
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
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
        ) : (
          // Input Form Interface
          <>
            <div className="form-header">
              <h2>Deposit Funds</h2>
              <button onClick={onClose} className="icon-button close-button">×</button>
            </div>
            <form className="card" onSubmit={handleConfirm} style={{border: 'none', background: 'transparent', padding: 0}}>
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
          </>
        )}
      </div>
    </div>
  );
};

const WithdrawForm = ({ onClose, user, onUserUpdate }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [destinationWallet, setDestinationWallet] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Thêm state cho trạng thái submit
  const [currentBalance, setCurrentBalance] = useState(0); // Lấy balance từ user prop

  useEffect(() => {
    if (user && user.bet_wallet !== undefined) {
      setCurrentBalance(parseFloat(user.bet_wallet));
    }
  }, [user]);

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!withdrawAmount || !destinationWallet) {
      alert('Vui lòng nhập số tiền và địa chỉ ví.');
      return;
    }
    if (parseFloat(withdrawAmount) <= 0) {
      alert('Số tiền rút phải lớn hơn 0.');
      return;
    }
    if (parseFloat(withdrawAmount) > currentBalance) {
        alert('Số dư không đủ để thực hiện giao dịch này.');
        return;
    }
    setShowConfirmation(true);
  };

  const confirmWithdrawal = async () => {
    if (!user || !user.telegram_id) {
      console.error("User data is not available. Cannot send withdrawal request.");
      alert("Thông tin người dùng không khả dụng. Vui lòng thử lại.");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestWithdrawal(user.telegram_id, withdrawAmount, destinationWallet);
      alert('Yêu cầu rút tiền đã được gửi thành công. Vui lòng chờ admin xác nhận.');
      setShowConfirmation(false);
      onClose();
      const response = await fetch(`https://f2farena.com/api/users/${user.telegram_id}`);
      if (!response.ok) throw new Error('Failed to fetch updated user data');
      const updatedUserData = await response.json();
      onUserUpdate(updatedUserData);

    } catch (error) {
      console.error('Error sending withdrawal request:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="deposit-modal-wrapper" onClick={onClose}> {/* Đổi class để dùng chung style */}
        <div className="deposit-modal-content" onClick={(e) => e.stopPropagation()}> {/* Đổi class để dùng chung style */}
          {!showConfirmation ? (
            <>
              <div className="form-header">
                <h2>Withdraw Funds</h2>
                <button onClick={onClose} className="icon-button close-button">×</button>
              </div>
              <div className="wallet-info-row" style={{ marginBottom: '1rem' }}>
                <span className="label">Available Balance</span>
                <span className="value accent">{currentBalance.toFixed(2)} USDT</span>
              </div>
              <form className="card" onSubmit={handleConfirm} style={{border: 'none', background: 'transparent', padding: 0}}>
                <div className="form-group">
                  <label className="form-label">Withdrawal Amount (USDT)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g., 100"
                    required
                    min="0.01" step="0.01" // Đảm bảo số dương và có thể nhập số lẻ
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
                <button type="submit" className="btn btn-accent" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Confirm Withdrawal'}
                </button>
              </form>
            </>
          ) : (
            <div className="confirmation-modal card" style={{position: 'static', transform: 'none', background: 'transparent', boxShadow: 'none'}}>
              <h4>Xác nhận rút tiền</h4>
              <p>Bạn có muốn rút <span className="accent">{withdrawAmount} USDT</span> tới ví <span style={{wordBreak: 'break-all'}}>{destinationWallet}</span> không?</p>
              <p>Số dư hiện tại: <span className="accent">{currentBalance.toFixed(2)} USDT</span></p>
              <div className="confirmation-buttons">
                <button className="btn btn-secondary" onClick={() => setShowConfirmation(false)} disabled={isSubmitting}>Hủy</button>
                <button className="btn btn-primary" onClick={confirmWithdrawal} disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const UpdateWalletAddressForm = ({ onClose, user, onWalletAddressUpdated }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walletAddress.trim()) {
      alert('Vui lòng nhập địa chỉ ví.');
      return;
    }
    if (!user || !user.telegram_id) {
      alert('Thông tin người dùng không khả dụng. Vui lòng thử lại.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Gửi request PATCH đến backend để cập nhật wallet_address
      const response = await fetch(`https://f2farena.com/api/users/${user.telegram_id}`, {
        method: 'PUT', // Sử dụng PUT hoặc PATCH tùy theo API của bạn
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wallet_address: walletAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Không thể cập nhật địa chỉ ví.');
      }

      const updatedUser = await response.json(); // Nhận về user object đã cập nhật
      alert('Địa chỉ ví đã được cập nhật thành công!');
      onWalletAddressUpdated(updatedUser); // Cập nhật user state ở AppContent
      onClose(); // Đóng form
    } catch (error) {
      console.error('Lỗi khi cập nhật địa chỉ ví:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="deposit-modal-wrapper" onClick={onClose}>
      <div className="deposit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>Bổ sung địa chỉ ví</h2>
          <button onClick={onClose} className="icon-button close-button">×</button>
        </div>
        <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
          Bạn cần cập nhật địa chỉ ví USDT (TRC20) để thực hiện rút tiền.
        </p>
        <form className="card" onSubmit={handleSubmit} style={{ border: 'none', background: 'transparent', padding: 0 }}>
          <div className="form-group">
            <label className="form-label">Địa chỉ ví USDT (TRC20)</label>
            <input
              type="text"
              className="form-input"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Nhập địa chỉ ví của bạn..."
              required
              disabled={isSubmitting}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSubmitting}>
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật địa chỉ ví'}
          </button>
        </form>
      </div>
    </div>
  );
};

const JoinMatchConditionModal = ({ onClose, match, user, onUserUpdate, brokersList, conditionType }) => {
    const navigate = useNavigate();
    const [newAccount, setNewAccount] = useState({ name_account: '', server_account: '' });
    const [newEmail, setNewEmail] = useState(user?.email || ''); // Initialize with user's current email

    // Lấy thông tin broker của trận đấu
    const matchBroker = brokersList.find(b => b.id === match.broker_id);
    const brokerName = matchBroker?.name || 'this broker';
    const brokerRegistrationUrl = matchBroker?.registration_url || 'https://example.com/register'; // Cần lấy từ API broker hoặc hardcode nếu không có

    const currentBalance = parseFloat(user?.bet_wallet || 0);
    const hasSufficientBalance = currentBalance >= match.betAmount;
    const hasBrokerAccount = user?.linkedBrokers?.includes(match.broker_id) || false;
    const hasEmail = user?.email && user.email.trim() !== '';

    const handleGoToWallet = () => {
        navigate('/wallet');
        onClose();
    };

    const handleSubmitNewAccount = async () => {
        if (!newAccount.name_account.trim() || !newAccount.server_account.trim()) {
            alert('Vui lòng nhập đầy đủ Tên tài khoản và Server.');
            return;
        }
        try {
            const response = await fetch('https://f2farena.com/api/accounts/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.telegram_id,
                    broker_id: match.broker_id,
                    name_account: newAccount.name_account,
                    server_account: newAccount.server_account
                })
            });
            const data = await response.json();
            if (data.id) {
                const updatedLinkedBrokers = [...new Set([...(user.linkedBrokers || []), match.broker_id])]; // Đảm bảo unique
                const updatedUser = { ...user, linkedBrokers: updatedLinkedBrokers };
                onUserUpdate(updatedUser);
                alert('Tài khoản đã được liên kết thành công!');
                onClose(); // Đóng modal sau khi liên kết thành công
            } else {
                alert(data.detail || 'Liên kết tài khoản thất bại.');
            }
        } catch (error) {
            console.error('Lỗi khi liên kết tài khoản:', error);
            alert('Lỗi khi liên kết tài khoản: ' + error.message);
        }
    };

    const handleSubmitNewEmail = async () => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!newEmail || !emailPattern.test(newEmail)) {
            alert('Vui lòng nhập địa chỉ email hợp lệ.');
            return;
        }
        try {
            const response = await fetch(`https://f2farena.com/api/users/${user.telegram_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Cập nhật email thất bại.');
            }
            const updatedUserData = await response.json(); // Nhận về user object đã cập nhật
            onUserUpdate(updatedUserData);
            alert('Email đã được cập nhật thành công!');
            onClose(); // Đóng modal sau khi cập nhật email
        } catch (error) {
            console.error('Lỗi khi cập nhật email:', error);
            alert('Lỗi khi cập nhật email: ' + error.message);
        }
    };

    const renderContent = () => {
        if (!hasBrokerAccount) {
            return (
                <>
                    <h4>Yêu cầu tài khoản sàn</h4>
                    <p>Bạn cần có tài khoản với sàn <strong>{brokerName}</strong> để tham gia trận đấu này.</p>
                    <p>
                        Nhấn <a href={brokerRegistrationUrl} target="_blank" rel="noopener,noreferrer" style={{ color: 'var(--color-accent)' }}>vào đây</a> để đăng ký tài khoản mới trên sàn nếu bạn chưa có.
                    </p>
                    <div className="form-group">
                        <label className="form-label">Tên tài khoản Trading</label>
                        <input
                            type="text"
                            value={newAccount.name_account}
                            onChange={(e) => setNewAccount({ ...newAccount, name_account: e.target.value })}
                            placeholder="Nhập tên tài khoản của bạn (ví dụ: PK_YourName)"
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Server của tài khoản</label>
                        <input
                            type="text"
                            value={newAccount.server_account}
                            onChange={(e) => setNewAccount({ ...newAccount, server_account: e.target.value })}
                            placeholder="Nhập tên server (ví dụ: GoMarkets-Live)"
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
                        <button className="btn btn-primary" onClick={handleSubmitNewAccount}>Liên kết tài khoản</button>
                    </div>
                </>
            );
        }

        if (!hasSufficientBalance) {
            return (
                <>
                    <h4>Số dư không đủ</h4>
                    <p>Số dư hiện tại của bạn là <strong>{currentBalance.toFixed(2)} USDT</strong>. Trận đấu này yêu cầu tối thiểu <strong>{match.betAmount} USDT</strong>.</p>
                    <p>Vui lòng nạp thêm tiền vào ví của bạn.</p>
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
                        <button className="btn btn-primary" onClick={handleGoToWallet}>Đi đến ví</button>
                    </div>
                </>
            );
        }
        
        if (!hasEmail) {
            return (
                <>
                    <h4>Yêu cầu Email</h4>
                    <p>Vui lòng cung cấp email của bạn để tham gia trận đấu. Email này sẽ được dùng để liên lạc và xác nhận thông tin.</p>
                    <div className="form-group">
                        <label className="form-label">Email của bạn</label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            placeholder="Nhập email của bạn"
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
                        <button className="btn btn-primary" onClick={handleSubmitNewEmail}>Cập nhật Email</button>
                    </div>
                </>
            );
        }

        return null; // Không nên tới đây nếu logic điều kiện chuẩn đã cover
    };

    return (
        <div className="deposit-modal-wrapper" onClick={onClose}>
            <div className="deposit-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                    <h2>Điều kiện tham gia trận đấu</h2>
                    <button onClick={onClose} className="icon-button close-button">&times;</button>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

const JoinConfirmModal = ({ onClose, onConfirm, match }) => {
    return (
      <>
        <div className="confirmation-overlay" onClick={onClose}></div>
        <div className="confirmation-modal card">
          <h4>Xác nhận tham gia Challenge</h4>
          <p>Bạn có chắc muốn tham gia trận {match.id} với bet {match.betAmount} USDT?</p>
          <div className="confirmation-buttons">
            <button className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button className="btn btn-primary" onClick={onConfirm}>Xác nhận</button>
          </div>
        </div>
      </>
    );
  };

// Helper component để xử lý logic đếm ngược và hiển thị trạng thái
const TournamentStatus = ({ startTime }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(startTime) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { difference, timeLeft };
  };

  const [timeInfo, setTimeInfo] = useState(calculateTimeLeft());

  useEffect(() => {
    if (timeInfo.difference <= 0) {
      // Buộc kiểm tra lại khi trạng thái là "Finished" để kích hoạt LazyLoad
      const forceUpdate = setTimeout(() => {
        setTimeInfo(calculateTimeLeft()); // Cập nhật lại để kích hoạt render
      }, 100);
      return () => clearTimeout(forceUpdate);
    }

    const timer = setInterval(() => {
      setTimeInfo(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, timeInfo.difference]);

  const { difference, timeLeft } = timeInfo;

  if (difference <= 0) {
    return (
      <div className="tournament-status-overlay finished">
        Finished
      </div>
    );
  }

  const formattedTime = `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`;

  return (
    <div className="tournament-status-overlay">
      <svg className="status-overlay-icon" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <span>
        Starts in: {timeLeft.days > 0 && `${timeLeft.days}d `}{formattedTime}
      </span>
    </div>
  );
};

const ArenaPage = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tournament');
  const [tournamentFilter, setTournamentFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterAmount, setFilterAmount] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [brokersList, setBrokersList] = useState([]);
  const [filterPanelHeight, setFilterPanelHeight] = useState(0);
  const filterContentRef = useRef(null);
  const [tournamentItems, setTournamentItems] = useState([]);
  const [waitingMatches, setWaitingMatches] = useState([]);
  const [showJoinMatchConditionModal, setShowJoinMatchConditionModal] = useState(false);

  const handleJoinChallenge = (match) => {
    if (!user) {
        alert('Thông tin người dùng chưa được tải. Vui lòng thử lại.');
        return;
    }

    // Tạo một đối tượng user tạm thời để sử dụng nhất quán (vì user prop có thể bị delay cập nhật)
    const currentUserData = user; // Giả sử user prop đã được cập nhật hoặc lấy từ sessionStorage

    const betWallet = parseFloat(currentUserData?.bet_wallet || 0);
    const hasEmail = currentUserData?.email && currentUserData.email.trim() !== '';
    const linkedBrokers = currentUserData?.linkedBrokers || [];
    const hasBrokerAccount = linkedBrokers.includes(match.broker_id);
    const isPlayer1 = currentUserData.telegram_id === match.player1_id;

    // Ưu tiên kiểm tra người chơi không thể thách đấu chính mình
    if (isPlayer1) {
        alert("Bạn không thể tham gia trận đấu của chính mình!");
        return;
    }

    // Kiểm tra email
    if (!hasEmail) {
        setSelectedMatch(match);
        setShowJoinMatchConditionModal(true); // Hiển thị modal với thông báo thiếu email
        return;
    }

    // Kiểm tra tài khoản sàn liên kết
    if (!hasBrokerAccount) {
        setSelectedMatch(match);
        setShowJoinMatchConditionModal(true); // Hiển thị modal với thông báo thiếu tài khoản sàn
        return;
    }

    // Kiểm tra số dư
    if (betWallet < match.betAmount) {
        setSelectedMatch(match);
        setShowJoinMatchConditionModal(true); // Hiển thị modal với thông báo thiếu số dư
        return;
    }

    // Nếu tất cả điều kiện đều thỏa mãn, hiển thị xác nhận tham gia
    setSelectedMatch(match);
    setShowJoinConfirm(true);
  };

  const handleConfirmJoin = async () => {
      if (!selectedMatch || !user) return;
      
      console.log('Confirm join for match:', selectedMatch.id, 'by user:', user.telegram_id);
      
      try {
          const response = await fetch(`https://f2farena.com/api/matches/${selectedMatch.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  player2_id: user.telegram_id, 
                  status: "pending_confirmation", // Gửi trạng thái chờ xác nhận
                  player2_username: user.username || user.telegram_id.toString(), // Truyền username của player2
                  bet_amount: selectedMatch.betAmount // Truyền số tiền cược
              })
          });
          
          if (!response.ok) {
              const errorData = await response.json();
              console.error('Update match (join) failed:', response.status, errorData.detail);
              alert('Tham gia thất bại: ' + (errorData.detail || 'Lỗi không xác định.'));
              return;
          }
          
          const data = await response.json();
          console.log('Update match success:', data);
          
          // Sau khi gửi request PATCH thành công, không điều hướng ngay
          // mà thông báo cho user rằng yêu cầu đã được gửi đến Player 1
          alert("Yêu cầu tham gia của bạn đã được gửi đến người tạo ván. Vui lòng chờ xác nhận!");
          
          // Cập nhật lại danh sách trận chờ để ẩn trận này (hoặc thay đổi trạng thái nếu bạn có state cho nó)
          fetchWaitingMatches(true); // Clear cache và fetch lại để cập nhật UI
          
          // Không navigate ngay lập tức, chỉ đóng modal
          setShowJoinConfirm(false);
          setSelectedMatch(null);

      } catch (error) {
          console.error('Error updating match (join):', error);
          alert('Lỗi khi gửi yêu cầu tham gia trận đấu. Vui lòng thử lại.');
      } finally {
          // Dù thành công hay thất bại, đóng modal xác nhận
          setShowJoinConfirm(false);
          setSelectedMatch(null);
      }
  };

  const fetchTournaments = async () => {
    console.log('Checking sessionStorage for tournaments_data');
    const cachedTournaments = sessionStorage.getItem('tournaments_data');
    if (cachedTournaments) {
      console.log('Using cached tournaments from sessionStorage');
      const parsedData = JSON.parse(cachedTournaments);
      setTournamentItems(parsedData.map(t => ({
        id: t.id,
        title: t.title,
        thumbnail: t.thumbnail.startsWith('http') ? t.thumbnail : `https://f2farena.com/${t.thumbnail}`,
        prizePool: t.prize_pool + ' USDT',
        participants: t.participants,
        symbol: t.symbol,
        startTime: t.event_time,
        type: t.type || 'live'
      })));
      return;
    }
    try {
      const homeCached = sessionStorage.getItem('tournaments_home');
      let homeTournaments = [];
      if (homeCached) {
        homeTournaments = JSON.parse(homeCached);
        console.log('Loaded home tournaments (5) from session:', homeTournaments.length);
      } else {
        console.log('No home tournaments in session, fetching full from offset=0');
      }
      const offset = homeTournaments.length > 0 ? 5 : 0;
      const limit = homeTournaments.length > 0 ? 5 : 10;
      const response = await fetch(`https://f2farena.com/api/tournaments/?offset=${offset}&limit=${limit}`);
      console.log('Fetch tournaments response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched tournaments (raw):', data);
      const mappedData = data.map(t => ({
        id: t.id,
        title: t.title,
        thumbnail: `https://f2farena.com/${t.thumbnail}`,
        prizePool: t.prize_pool + ' USDT',
        participants: t.participants,
        symbol: t.symbol,
        startTime: t.event_time,
        type: t.type || 'live'
      }));
      const fullData = homeTournaments.length > 0 ? [...homeTournaments, ...mappedData] : mappedData;
      const normalizedData = fullData.map(t => {
          if (t.prizePool) return t;
          return {
              ...t,
              prizePool: t.prize_pool ? `${t.prize_pool} USDT` : '0 USDT'
          };
      });
      setTournamentItems(normalizedData);
      sessionStorage.setItem('tournaments_data', JSON.stringify(normalizedData));
      console.log('Stored full tournaments to sessionStorage, count:', fullData.length);
    } catch (error) {
      console.error('Error fetching tournaments:', error.message);
    }
  };

  const fetchWaitingMatches = async (clearCache = false) => {
    if (clearCache) sessionStorage.removeItem('waiting_matches');
    console.log('Checking sessionStorage for waiting_matches');
    const cachedWaiting = sessionStorage.getItem('waiting_matches');
    if (cachedWaiting) {
      console.log('Using cached waiting matches from sessionStorage');
      const parsedData = JSON.parse(cachedWaiting);
      setWaitingMatches(parsedData);
      return;
    }
    try {
      const waitingUrl = 'https://f2farena.com/api/matches/waiting';
      console.log('Full URL before fetch waiting matches:', waitingUrl);
      const response = await fetch(waitingUrl);
      console.log('Fetch waiting matches status:', response.status);

      let data = [];
      // SỬA: Kiểm tra response.ok trước khi xử lý
      if (response.ok) {
        data = await response.json();
        console.log('Fetched waiting matches:', data);
      } else {
        // Log lỗi chi tiết nếu có
        const errorData = await response.json();
        console.error('Fetch waiting matches failed, status:', response.status, 'detail:', errorData.detail || 'No detail available');
        setWaitingMatches([]); // Set về mảng rỗng để tránh lỗi map
        return;
      }

      setWaitingMatches(data);
      sessionStorage.setItem('waiting_matches', JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching waiting matches:', error);
      setWaitingMatches([]); // Set về mảng rỗng khi có lỗi
    }
  };

  const fetchBrokersForArena = async () => {
    console.log('fetchBrokersForArena called - checking sessionStorage');
    let brokers = [];
    const cached = sessionStorage.getItem('brokers_data');
    if (cached) {
      brokers = JSON.parse(cached).brokers || [];
      console.log('Loaded', brokers.length, 'brokers from cache');
    }
    if (brokers.length === 0) {
      try {
        const response = await fetch('https://f2farena.com/api/brokers/list');
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        brokers = data.brokers.map(b => ({ id: b.id, name: b.broker_name, registration_url: b.registration_url }));
        sessionStorage.setItem('brokers_data', JSON.stringify({ brokers }));
        console.log('Fetched and stored full brokers:', brokers.length);
      } catch (error) {
        console.error('Error fetching brokers for Arena:', error);
      }
    } else {
      try {
        const response = await fetch('https://f2farena.com/api/brokers/list');
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        const allBrokers = data.brokers;
        const existingIds = brokers.map(b => b.id);
        const missingBrokers = allBrokers.filter(b => !existingIds.includes(b.id));
        if (missingBrokers.length > 0) {
          brokers = [...brokers, ...missingBrokers.map(b => ({ id: b.id, name: b.broker_name }))];
          sessionStorage.setItem('brokers_data', JSON.stringify({ brokers }));
          console.log('Fetched and merged missing brokers:', missingBrokers.length);
        } else {
          console.log('No missing brokers, using cache');
        }
      } catch (error) {
        console.error('Error checking missing brokers:', error);
      }
    }
    setBrokersList(brokers);
  };

  useEffect(() => {
    fetchTournaments();
    fetchWaitingMatches();
    fetchBrokersForArena();
  }, []);

  const filteredMatches = waitingMatches.map(match => ({
    ...match,
    betAmount: match.bet,
    symbol: match.pair,
    waitingTime: 'It is the waiting time',
    country: 'Vietnam',
    challenger: {
      name: match.player1_name || 'Anonymous',
      avatar: match.player1_avatar || generateAvatarUrl(match.player1_name || 'Anonymous')
    }
  })).filter(match => {
    const amountCondition = !filterAmount || match.betAmount <= parseInt(filterAmount);
    const countryCondition = !filterCountry || match.country.toLowerCase().includes(filterCountry.toLowerCase());
    const symbolCondition = !filterSymbol || match.symbol.toLowerCase().includes(filterSymbol.toLowerCase());
    return amountCondition && countryCondition && symbolCondition;
  });

  useEffect(() => {
    setFilterPanelHeight(showFilters && filterContentRef.current ? filterContentRef.current.scrollHeight : 0);
  }, [showFilters]);

  if (showCreateForm) {
    return <CreateNewMatchForm onClose={() => setShowCreateForm(false)} brokersList={brokersList} onCreateSuccess={() => fetchWaitingMatches(true)} user={user} />;
  }

  return (
    <div className="page-padding">
      <div className="wallet-tabs">
        <button
          className={`wallet-tab-button ${activeTab === 'tournament' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournament')}
        >
          Tournament
        </button>
        <button
          className={`wallet-tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          1 vs 1 Match
        </button>
      </div>

      {activeTab === 'tournament' && (() => {
        const filteredTournaments = tournamentItems.filter(item => {
          if (tournamentFilter === 'all') return true;
          return item.type === tournamentFilter;
        });
        
        // [SỬA] Bỏ hoàn toàn việc định nghĩa component con ở đây
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
              <button
                className={`btn ${tournamentFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTournamentFilter('all')}
                style={{fontSize: '0.9rem', padding: '0.4rem 0.8rem'}}
              >
                All
              </button>
              <button
                className={`btn ${tournamentFilter === 'live' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTournamentFilter('live')}
                style={{fontSize: '0.9rem', padding: '0.4rem 0.8rem'}}
              >
                Live
              </button>
              <button
                className={`btn ${tournamentFilter === 'demo' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setTournamentFilter('demo')}
                style={{fontSize: '0.9rem', padding: '0.4rem 0.8rem'}}
              >
                Demo
              </button>
            </div>
            
            <div className="tournament-list">
              {filteredTournaments.map(item => (
                <div key={item.id} className="card tournament-card">
                  <div className="tournament-thumbnail-wrapper">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="tournament-thumbnail"
                      loading="lazy"
                      onError={(e) => {
                        console.error(`Failed to load image: ${item.thumbnail}`);
                        e.target.src = 'https://placehold.co/500x220?text=Image+Not+Found';
                      }}
                      onLoad={(e) => { e.target.parentNode.classList.add('loaded'); }}
                    />
                    <TournamentStatus startTime={item.startTime} />
                  </div>
                  <div className="tournament-content">
                    <h3 className="tournament-title">{item.title}</h3>
                    <div className="tournament-details-grid">
                      <div className="detail-item">
                        <span>Prize Pool</span>
                        <p className="detail-value accent">{item.prizePool}</p>
                      </div>
                      <div className="detail-item">
                        <span>Participants</span>
                        <p className="detail-value">{item.participants}</p>
                      </div>
                      <div className="detail-item">
                        <span>Symbol</span>
                        <p className="detail-value primary">{item.symbol}</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '1rem' }}
                      onClick={() => navigate(`/tournament/${item.id}`)}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      })()}

      {activeTab === 'personal' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={() => setShowFilters(!showFilters)}>
              Filters
              <svg className={`filter-arrow ${showFilters ? 'open' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="btn btn-accent" onClick={() => setShowCreateForm(true)}>+ New Match</button>
          </div>
          
          <div className="filters-panel" style={{ maxHeight: `${filterPanelHeight}px`, marginBottom: filterPanelHeight > 0 ? '1rem' : '0' }}>
            <div className="card" ref={filterContentRef} style={{ overflow: 'hidden' }}>
              <div className="form-group">
                <label className="form-label">Max Bet Amount</label>
                <input type="number" className="form-input" value={filterAmount} onChange={e => setFilterAmount(e.target.value)} placeholder="e.g., 200" />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input type="text" className="form-input" value={filterCountry} onChange={e => setFilterCountry(e.target.value)} placeholder="e.g., Vietnam" />
              </div>
              <div className="form-group">
                <label className="form-label">Symbol</label>
                <input type="text" className="form-input" value={filterSymbol} onChange={e => setFilterSymbol(e.target.value)} placeholder="e.g., BTC, GOLD" />
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
                  <p className="detail-value">{match.duration_time} hours</p>
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
                onClick={() => {
                  if (match.status === "waiting") {
                    handleJoinChallenge(match);
                  } else {
                    navigate(`/match/${match.id}`);
                  }
                }}
              >
                {match.status === "waiting" ? "Join Challenge" : "Detail"}
              </button>
            </div>
          ))}
        </>
      )}
      {showJoinMatchConditionModal && (
        <JoinMatchConditionModal
          onClose={() => setShowJoinMatchConditionModal(false)}
          match={selectedMatch}
          user={user}
          onUserUpdate={onUserUpdate}
          brokersList={brokersList} // Truyền brokersList để lấy thông tin broker
        />
      )}
      {showDepositModal && (
        <DepositForm onClose={() => setShowDepositModal(false)} user={user} onUserUpdate={onUserUpdate} />
      )}
      {showJoinConfirm && (
        <JoinConfirmModal
          onClose={() => setShowJoinConfirm(false)}
          onConfirm={handleConfirmJoin}
          match={selectedMatch}
        />
      )}
    </div>
  );
};

const SettingsSidebar = ({ show, onClose, user }) => {
    const [currentView, setCurrentView] = useState('main');

    const handleBack = () => setCurrentView('main');
    
    // Khi đóng sidebar, reset view về 'main'
    const handleClose = () => {
      onClose();
      setCurrentView('main');
    };

    const renderView = () => {
      switch(currentView) {
        case 'personalInfo':
          return <PersonalInfoView onBack={handleBack} user={user} />;
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
                    onClick={() => setCurrentView('personalInfo')}
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
                    onClick={() => setCurrentView('language')}
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
                    onClick={() => setCurrentView('terms')}
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
                    onClick={() => setCurrentView('about')}
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

const PersonalInfoView = ({ onBack, user }) => {
    const [copied, setCopied] = useState(false);

    // Hàm xử lý sao chép link affiliate
    const handleCopyAffiliateLink = () => {
        if (user?.affiliate) {
            navigator.clipboard.writeText(user.affiliate).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // Reset trạng thái sau 2 giây
            });
        }
    };

    // Giao diện loading nếu chưa có dữ liệu user
    if (!user) {
        return (
            <div className="sidebar-view">
                <div className="sidebar-view-header">
                    <button className="icon-button back-button" onClick={onBack}>
                        <img src={arrowIcon} alt="Back" style={{ width: '18px', height: '18px' }} onError={() => console.error('Failed to load arrow icon')} />
                    </button>
                    <h3 className="sidebar-title">Personal Information</h3>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
            </div>
        );
    }
    
    // Ưu tiên avatar thật, nếu không có thì tạo placeholder
    const avatarUrl = user.avatar 
        ? `https://f2farena.com/${user.avatar}` 
        : generateAvatarUrl(user.fullname || user.username || 'User');

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
                <img src={avatarUrl} alt="User Avatar" className="personal-info-avatar" />
                <h4 className="personal-info-name">{user.fullname || user.username}</h4>
                <p className="personal-info-id">@{user.username || user.telegram_id}</p>
            </div>
            <ul className="sidebar-nav-list scrollable">
                <li className="list-item">
                    <span className="list-item-label">Email</span>
                    <span className="list-item-value">{user.email || 'Chưa cập nhật'}</span>
                </li>
                <li className="list-item">
                    <span className="list-item-label">Wallet Address</span>
                    <span className="list-item-value">{user.wallet_address || 'Null'}</span>
                </li>
                <li className="list-item">
                    <span className="list-item-label">VIP Level</span>
                    <span className="list-item-value accent">{user.vip_level}</span>
                </li>
                <li className="list-item">
                    <span className="list-item-label">Affiliate Link</span>
                    <button onClick={handleCopyAffiliateLink} className="copy-link-button" style={{background:'var(--color-primary)',color:'white',border:'none',padding:'4px 8px',borderRadius:'4px',cursor:'pointer',fontSize:'0.8rem'}}>
                        {copied ? 'Đã sao chép!' : 'Sao chép link'}
                    </button>
                </li>
                <li className="list-item">
                    <span className="list-item-label">Verified</span>
                    <span className={`list-item-value ${user.veriflied ? 'verified' : 'unverified'}`}>
                        {user.veriflied ? 'Yes' : 'No'}
                    </span>
                </li>
                <li className="list-item">
                    <span className="list-item-label">Join Date</span>
                    <span className="list-item-value">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                </li>
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const listRef = useRef(null);

  const Row = ({ index, style }) => {
    const msg = messages[index];
    return (
      <div style={style} className={`message-bubble-row ${msg.sender}`}>
        <div className={`message-bubble ${msg.sender}`}>
          {msg.text}
        </div>
      </div>
    );
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || !user || !user.telegram_id || !matchData) return;

    const userMessage = { text: trimmedInput, sender: 'user' };
    setMessages(prev => [...prev, userMessage].slice(-50)); // Giới hạn 50 tin nhắn
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Tính năng chat đang được cấu hình.", sender: 'bot' }].slice(-50));
      setIsLoading(false);
      listRef.current?.scrollToItem(messages.length, 'end');
    }, 1000);
  };

  return (
    <div className="chatbot-container" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div className="chatbot-messages" style={{ flex: '1 1 auto', overflow: 'hidden' }}>
        <FixedSizeList
          height={window.innerHeight - 72 - 60} // Trừ header và input
          itemCount={messages.length}
          itemSize={60} // Ước lượng chiều cao mỗi tin nhắn
          width="100%"
          ref={listRef}
        >
          {Row}
        </FixedSizeList>
        {isLoading && (
          <div className="message-bubble-row bot">
            <div className="message-bubble bot loading-pulse">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
      </div>
      <form className="chatbot-input-area" style={{ display: 'flex', alignItems: 'center', position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'var(--color-background)', zIndex: 20 }} onSubmit={sendMessage}>
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
  const [activePage, setActivePage] = useState('home');
  const location = useLocation();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
      if (!user || !user.telegram_id) {
          console.log("Waiting for user data to establish WebSocket connection.");
          return;
      }

      const wsUrl = `wss://f2farena.com/ws/${user.telegram_id}`; // Thay thế bằng URL WebSocket thật của bạn
      let ws = null;
      let reconnectInterval = null;

      const connectWebSocket = () => {
          console.log(`Attempting to connect WebSocket to ${wsUrl}`);
          ws = new WebSocket(wsUrl);

          ws.onopen = () => {
              console.log('WebSocket connected successfully.');
              if (reconnectInterval) {
                  clearInterval(reconnectInterval);
                  reconnectInterval = null;
              }
          };

          ws.onmessage = (event) => {
              console.log('WebSocket message received:', event.data);
              const message = event.data;
              if (message.startsWith("MATCH_STARTED:")) {
                  const matchId = message.split(":")[1];
                  alert(`Trận đấu ${matchId} đã bắt đầu!`);
                  navigate(`/match/${matchId}`); // Điều hướng đến trang chi tiết trận đấu
              }
              // Thêm các loại tin nhắn khác nếu cần
          };

          ws.onclose = (event) => {
              console.log('WebSocket closed:', event.code, event.reason);
              if (!reconnectInterval) { // Prevent multiple intervals
                  reconnectInterval = setInterval(connectWebSocket, 5000); // Thử kết nối lại sau 5 giây
              }
          };

          ws.onerror = (error) => {
              console.error('WebSocket error:', error);
              if (ws && ws.readyState === WebSocket.OPEN) {
                  ws.close(); // Close to trigger onclose and reconnect logic
              }
          };
      };

      connectWebSocket();

      return () => {
          console.log('Cleaning up WebSocket connection...');
          if (ws) {
              ws.close();
          }
          if (reconnectInterval) {
              clearInterval(reconnectInterval);
          }
      };
  }, [user, navigate]);

  const handleUserUpdate = (updatedUserData) => {
    setUser(updatedUserData);
    sessionStorage.setItem('user_data', JSON.stringify(updatedUserData)); // Cập nhật cache
  };

  const [walletData, setWalletData] = useState({
    currentBalance: '1500.50 USDT',
    totalDeposits: '5000.00 USDT',
    totalWithdrawals: '3000.00 USDT',
  });

  useEffect(() => {
    const loadUser = async () => {
      const cachedUser = sessionStorage.getItem('user_data');
      if (cachedUser) {
        console.log('Loaded user from sessionStorage:', cachedUser);
        setUser(JSON.parse(cachedUser));
        return;
      }

      let telegramId = null;

      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        
        if (tg.initData) {
            const params = new URLSearchParams(tg.initData);
            const userParam = params.get('user');
            if (userParam) {
                const userData = JSON.parse(userParam);
                telegramId = userData.id;
                console.log('Successfully got user ID from Telegram:', telegramId);
            }
        }
      }

      if (!telegramId) {
        const params = new URLSearchParams(location.search);
        telegramId = params.get('userid');
        if (telegramId) {
          console.log('Got user ID from URL param:', telegramId);
        }
      }

      if (!telegramId) {
        telegramId = 6461541179;
        console.log('No user ID found, using default ID for development:', telegramId);
      }
      
      try {
        const response = await fetch(`https://f2farena.com/api/users/${telegramId}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Fetch user failed for ID ${telegramId}:`, response.status, errorText);
          return;
        }
        const data = await response.json();
        console.log('Fetched user data from API:', data);
        setUser(data);
        sessionStorage.setItem('user_data', JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    loadUser();
  }, [location.search]);

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    mainContent.prepend(sentinel);

    const observer = new IntersectionObserver(([entry]) => {
      const isDetailPage = ['/match/', '/news/', '/arena/', '/tournament/'].some(path => location.pathname.includes(path));
      if (isDetailPage) {
        setShowHeader(false);
        setShowFooter(false);
      } else {
        setShowHeader(entry.isIntersecting);
        setShowFooter(entry.isIntersecting && location.pathname !== '/chatbot');
      }
    }, { threshold: 0 });

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, [location.pathname]);


  useEffect(() => {
    const path = location.pathname.substring(1);
    const page = path.split('/')[0];
    const isDetailPage = ['match', 'news', 'arena'].includes(page) && path.includes('/');

    if (isDetailPage) {
      setActivePage('');
    } else {
      setActivePage(page || 'home');
    }
  }, [location.pathname]);

  useEffect(() => {
    setShowHeader(!(location.pathname.startsWith('/match') || location.pathname.startsWith('/news/') || location.pathname.startsWith('/arena/') || location.pathname.startsWith('/tournament/')));
    setShowFooter(!(location.pathname.startsWith('/match') || location.pathname.startsWith('/news/') || location.pathname.startsWith('/arena/') || location.pathname.startsWith('/tournament/') || location.pathname === '/chatbot'));
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
          <Route path="/news" element={<NewsPage user={user} />} />
          <Route path="/news/:id" element={<NewsDetail user={user} />} />
          <Route path="/arena" element={<ArenaPage user={user} onUserUpdate={handleUserUpdate} />} />
          <Route path="/tournament/:id" element={<TournamentDetail user={user} walletData={walletData} onUserUpdate={handleUserUpdate} />} />
          <Route path="/arena/:id" element={<ArenaDetail />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/wallet" element={<WalletPage user={user} onUserUpdate={handleUserUpdate} />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/match/:id" element={<MatchDetail user={user} />} />
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
        user={user}
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
