import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MatchDetail.css';

const generateAvatarUrl = (seed) => `https://placehold.co/50x50/3498db/ffffff?text=${(seed.split(' ').map(n => n[0]).join('') || 'NN').toUpperCase()}`;

const matchesData = [
  { id: 1, pair: 'BTC/USDT', betAmount: 100, player1: { name: 'CryptoKing', avatar: generateAvatarUrl('CryptoKing'), score: 7, odds: '1:0.75' }, player2: { name: 'TradeMaster', avatar: generateAvatarUrl('TradeMaster'), score: 3, odds: '1:0.90' }, timeRemaining: '00:45:30', views: 1250, outsideBetsTotal: 12500 },
  { id: 2, pair: 'ETH/USDT', betAmount: 250, player1: { name: 'BlockBoss', avatar: generateAvatarUrl('BlockBoss'), score: 5, odds: '1:0.85' }, player2: { name: 'MarketWhiz', avatar: generateAvatarUrl('MarketWhiz'), score: 5, odds: '1:0.85' }, timeRemaining: '01:10:15', views: 890, outsideBetsTotal: 8000 },
];

const initialTrades = [
  { id: 1, player: 'CryptoKing', type: 'BUY', amount: 0.1, price: 60000, timestamp: '2025-06-11T14:00:00Z' },
  { id: 2, player: 'TradeMaster', type: 'SELL', amount: 0.05, price: 59950, timestamp: '2025-06-11T14:02:00Z' },
];

const initialComments = [
  { id: 1, user: 'TraderX', comment: 'CryptoKing is dominating this match!', timestamp: '2025-06-11T14:01:00Z' },
  { id: 2, user: 'MarketGuru', comment: 'TradeMaster needs to step up!', timestamp: '2025-06-11T14:03:00Z' },
];

const initialBets = [
  { id: 1, user: 'BetKing', amount: 50, player: 'CryptoKing', timestamp: '2025-06-11T14:00:30Z' },
  { id: 2, user: 'RiskTaker', amount: 30, player: 'TradeMaster', timestamp: '2025-06-11T14:02:30Z' },
];

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const widgetRef = useRef(null); // Ref để theo dõi widget

  const [matchData, setMatchData] = useState(null);  // State thay vì hardcode

  // useEffect mới: Fetch detail từ endpoint với sessionStorage
  useEffect(() => {
    const fetchMatchDetail = async () => {
      const cacheKey = `match_detail_${id}`;
      console.log(`Checking sessionStorage for ${cacheKey}`);  // Log kiểm tra cache
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        console.log(`Using cached match detail for id ${id}`);
        setMatchData(JSON.parse(cachedData));
        return;
      }
      try {
        const response = await fetch(`https://f2farena.com/api/matches/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched pair:', data.pair);
        console.log('Fetched match detail:', data);
        // Get player2 info nếu player2_id exist
        let player2 = { name: 'Waiting', avatar: generateAvatarUrl('Waiting'), score: 0, odds: '1:1.0' };
        if (data.player2_id) {
          try {
            const userRes = await fetch(`https://f2farena.com/api/users/${data.player2_id}`);
            if (userRes.ok) {
              const userData = await userRes.json();
              player2 = {
                name: userData.username || 'Anonymous',
                avatar: userData.avatar || generateAvatarUrl(userData.username || 'Anonymous'),
                score: data.player2_score || 0,
                odds: data.player2_odds || '1:1.0'
              };
              console.log('Fetched player2 info:', player2); // Log để xem avatar/username
            } else {
              console.error('Failed to fetch player2 user, status:', userRes.status);
            }
          } catch (error) {
            console.error('Error fetch player2:', error);
          }
        }
        data.player2 = player2;
        setMatchData(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        console.log(`Stored match detail for id ${id} to sessionStorage`);
      } catch (error) {
        console.error('Error fetching match detail:', error);
        setMatchData(null);  // Để show Not Found
      }
    };
    fetchMatchDetail();
  }, [id]);

  if (!matchData) {
    return (
      <div className="match-detail-container">
        <div className="page-padding">
          <h2>Match Not Found</h2>
          <p>No match found with ID {id}. Please try another match.</p>
          <button className="btn btn-primary" onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </div>
    );
  }

  const [timeRemaining, setTimeRemaining] = useState(matchData.timeRemaining);
  const [trades, setTrades] = useState(initialTrades);
  const tradesEndRef = useRef(null);
  const [comments, setComments] = useState(initialComments);
  const commentsEndRef = useRef(null);
  const [commentInput, setCommentInput] = useState('');

  const [bets, setBets] = useState(initialBets);
  const [oddsTrend, setOddsTrend] = useState({ player1: 'up', player2: 'down' });
  const [activeTab, setActiveTab] = useState('matching');

  useEffect(() => {
    const interval = setInterval(() => {
      const [hours, minutes, seconds] = timeRemaining.split(':').map(Number);
      let totalSeconds = hours * 3600 + minutes * 60 + seconds;
      if (totalSeconds <= 0) {
        clearInterval(interval);
        return;
      }
      totalSeconds--;
      const newHours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const newMinutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const newSeconds = (totalSeconds % 60).toString().padStart(2, '0');
      setTimeRemaining(`${newHours}:${newMinutes}:${newSeconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTrade = {
        id: trades.length + 1,
        player: Math.random() > 0.5 ? matchData.player1.name : matchData.player2.name,
        type: Math.random() > 0.5 ? 'BUY' : 'SELL',
        amount: (Math.random() * 0.1 + 0.01).toFixed(2),
        price: (59900 + Math.random() * 200).toFixed(2),
        timestamp: new Date().toISOString(),
      };
      setTrades((prev) => [...prev, newTrade]);
    }, 10000);
    return () => clearInterval(interval);
  }, [trades, matchData]);

  useEffect(() => {
    if (activeTab === 'matching' && tradesEndRef.current) {
      tradesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [trades, activeTab]);

  // PHần xử lý cho Tab Discussion
  useEffect(() => {
    const interval = setInterval(() => {
      const newComment = {
        id: comments.length + 1,
        user: `User${Math.floor(Math.random() * 100)}`,
        comment: `Comment ${comments.length + 1} on this match!`,
        timestamp: new Date().toISOString(),
      };
      setComments((prev) => [...prev, newComment]);
    }, 15000);
    return () => clearInterval(interval);
  }, [comments]);

  // Cuộn đến bình luận mới nhất
  useEffect(() => {
    if (activeTab === 'discussion' && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments, activeTab]);

  // Xử lý gửi bình luận mới
  const handleSendComment = (e) => {
    e.preventDefault();
    const trimmedInput = commentInput.trim();
    if (!trimmedInput) return;
    const newComment = {
      id: comments.length + 1,
      user: 'CurrentUser', // Giả lập user hiện tại
      comment: trimmedInput,
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentInput('');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newBet = {
        id: bets.length + 1,
        user: `Bettor${Math.floor(Math.random() * 100)}`,
        amount: (Math.random() * 50 + 10).toFixed(2),
        player: Math.random() > 0.5 ? matchData.player1.name : matchData.player2.name,
        timestamp: new Date().toISOString(),
      };
      setBets((prev) => [...prev, newBet]);
    }, 12000);
    return () => clearInterval(interval);
  }, [bets, matchData]);

  // Giả lập kèo tăng/giảm
  useEffect(() => {
    const interval = setInterval(() => {
      setOddsTrend({
        player1: Math.random() > 0.5 ? 'up' : 'down',
        player2: Math.random() > 0.5 ? 'up' : 'down',
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab !== 'matching') return;

    // Tải script TradingView
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Kiểm tra xem widget đã tồn tại chưa
      if (!widgetRef.current) {
        widgetRef.current = new window.TradingView.widget({
          width: '100%',
          height: 400, // Đồng bộ với CSS
          symbol: `BINANCE:${matchData.pair.replace('/', '')}`,
          interval: '1',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: 'tradingview_widget',
        });
      }
    };

    return () => {
      // Không xóa script để tránh lỗi khi quay lại
      // document.body.removeChild(script);
      // Cleanup widget nếu cần
      if (widgetRef.current) {
        // TradingView widget không có API cleanup trực tiếp, chỉ unmount DOM
        const widgetDiv = document.getElementById('tradingview_widget');
        if (widgetDiv) widgetDiv.innerHTML = '';
        widgetRef.current = null;
      }
    };
  }, [activeTab, matchData.pair]);

  const totalOutsideBets = bets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);

  return (
    <div className="match-detail-container">
      <div className="match-detail-header">
        <button className="icon-button back-button" onClick={() => navigate('/home')}>&lt;</button>
        <div className="player-info">
          <img src={matchData.player1.avatar} alt={matchData.player1.name} className="player-avatar" />
          <span className="player-name">{matchData.player1.name}</span>
          <span className="player-odds">{matchData.player1.odds}</span>
        </div>
        <div className="center-details">
          <div className="time-remaining">{timeRemaining}</div>
          <div className="vs-text">VS</div>
        </div>
        <div className="player-info">
          <img src={matchData.player2.avatar} alt={matchData.player2.name} className="player-avatar" />
          <span className="player-name">{matchData.player2.name}</span>
          <span className="player-odds">{matchData.player2.odds}</span>
        </div>
      </div>
      <div className="score-bar-container">
        <div className="score-bar">
          <div style={{ width: `${(matchData.player1.score / (matchData.player1.score + matchData.player2.score)) * 100}%` }}></div>
          <div style={{ width: `${(matchData.player2.score / (matchData.player1.score + matchData.player2.score)) * 100}%` }}></div>
        </div>
        <div className="score-text">
          <span>Score: {matchData.player1.score}</span>
          <span>Score: {matchData.player2.score}</span>
        </div>
      </div>
      <div className="header-bottom-section">
        <div className="info-group">
          <div className="info-item"><p className="primary-p">{matchData.pair}</p></div>
          <div className="info-item"><p className="accent-p">{matchData.betAmount} USDT</p></div>
        </div>
        <div className="info-group">
          <div className="info-item icon-info">
            <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
            <span>{matchData.views}</span>
          </div>
          <div className="info-item icon-info">
            <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
            <span>{totalOutsideBets.toFixed(2)} USDT</span>
          </div>
        </div>
      </div>
      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'matching' ? 'active' : ''}`}
          onClick={() => setActiveTab('matching')}
        >
          Matching
        </button>
        <button
          className={`tab-button ${activeTab === 'discussion' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          Discussion
        </button>
        <button
          className={`tab-button ${activeTab === 'bet-outside' ? 'active' : ''}`}
          onClick={() => setActiveTab('bet-outside')}
        >
          Bet Outside
        </button>
      </div>
      {activeTab === 'matching' && (
        <>
          <div className="trading-view-container">
            <div id="tradingview_widget"></div>
          </div>
          <div className="timeline-container">
            <div className="timeline">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className={`trade-box ${trade.player === matchData.player1.name ? 'left' : 'right'}`}
                >
                  <div className="trade-info">
                    <span className="trade-type">{trade.type}</span>
                    <span className="trade-amount">{trade.amount} {matchData.pair.split('/')[0]}</span>
                    <span className="trade-price">${trade.price}</span>
                    <span className="trade-time">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              <div ref={tradesEndRef} />
            </div>
          </div>
        </>
      )}
      {activeTab === 'discussion' && (
        <div className="discussion-container">
          <div className="discussion-messages">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`discussion-bubble-row ${comment.user === 'CurrentUser' ? 'user' : 'other'}`}
              >
                <div className="discussion-bubble-container">
                  {comment.user !== 'CurrentUser' && (
                    <img
                      src={generateAvatarUrl(comment.user)}
                      alt={comment.user}
                      className="discussion-avatar"
                    />
                  )}
                  <div className={`discussion-bubble ${comment.user === 'CurrentUser' ? 'user' : 'other'}`}>
                    {comment.user !== 'CurrentUser' && (
                      <span className="discussion-user">{comment.user}</span>
                    )}
                    <span className="discussion-text">{comment.comment}</span>
                    <span className="discussion-time">{new Date(comment.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
          <form
            className="discussion-input-area"
            onSubmit={handleSendComment}
          >
            <input
              type="text"
              className="discussion-input form-input"
              placeholder="Type your comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            />
            <button type="submit" className="discussion-send-btn btn btn-primary">
              Send
            </button>
          </form>
        </div>
      )}
      {activeTab === 'bet-outside' && (
        <div className="bet-outside-container">
          <div className="bet-outside-buttons">
            <button className="bet-outside-button-green">
              {matchData.player1.odds}
              <span className={`bet-outside-trend ${oddsTrend.player1}`}>
                {oddsTrend.player1 === 'up' ? '↑' : '↓'}
              </span>
            </button>
            <button className="bet-outside-button-red">
              {matchData.player2.odds}
              <span className={`bet-outside-trend ${oddsTrend.player2}`}>
                {oddsTrend.player2 === 'up' ? '↑' : '↓'}
              </span>
            </button>
          </div>
          <div className="bet-outside-table">
            <div className="bet-outside-total">
              Total Outside Bets: {totalOutsideBets.toFixed(2)} USDT
            </div>
            {bets.map((bet, index) => (
              <div key={bet.id} className="bet-outside-row">
                <img
                  src={generateAvatarUrl(bet.user)}
                  alt={bet.user}
                  className="bet-outside-avatar"
                />
                <span className="bet-outside-nickname">{bet.user}</span>
                <span className={`bet-outside-odds bet-outside-odds-${bet.player === matchData.player1.name ? 'green' : 'red'}`}>
                  {bet.player === matchData.player1.name ? matchData.player1.odds : matchData.player2.odds}
                </span>
                <span className="bet-outside-amount">{bet.amount} USDT</span>
                <span className="bet-outside-time">{new Date(bet.timestamp).toLocaleTimeString()}</span>
                {index < bets.length - 1 && <hr className="bet-outside-divider" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDetail;