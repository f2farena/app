import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MatchDetail.css';

const generateAvatarUrl = (seed) => `https://placehold.co/50x50/3498db/ffffff?text=${(seed.split(' ').map(n => n[0]).join('') || 'NN').toUpperCase()}`;

// Mock data ban đầu, sẽ được thay thế bởi dữ liệu từ API
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

const MatchDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    // TẤT CẢ CÁC HOOKS PHẢI ĐƯỢC KHAI BÁO TRÊN CÙNG
    const widgetRef = useRef(null);
    const tradesEndRef = useRef(null);
    const commentsEndRef = useRef(null);
    
    // Thay đổi useState để khởi tạo giá trị ban đầu tránh lỗi
    const [matchData, setMatchData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("00:00:00");
    const [trades, setTrades] = useState(initialTrades);
    const [comments, setComments] = useState(initialComments);
    const [bets, setBets] = useState(initialBets);
    const [oddsTrend, setOddsTrend] = useState({ player1: 'up', player2: 'down' });
    const [commentInput, setCommentInput] = useState('');
    const [activeTab, setActiveTab] = useState('matching');

    // useEffect để fetch dữ liệu từ backend
    useEffect(() => {
        const fetchMatchDetail = async () => {
            const cacheKey = `match_detail_${id}`;
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                setMatchData(parsedData);
            }
            try {
                const response = await fetch(`https://f2farena.com/api/matches/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched match detail:', data);

                // Prepend 'server/' cho avatar nếu cần
                const updatedData = {
                    ...data,
                    player1: {
                        ...data.player1,
                        avatar: data.player1.avatar && !data.player1.avatar.startsWith('http')
                            ? `https://f2farena.com/${data.player1.avatar}`
                            : data.player1.avatar
                    },
                    player2: {
                        ...data.player2,
                        avatar: data.player2.avatar && !data.player2.avatar.startsWith('http')
                            ? `https://f2farena.com/${data.player2.avatar}`
                            : data.player2.avatar
                    },
                };
                
                setMatchData(updatedData);
                sessionStorage.setItem(cacheKey, JSON.stringify(updatedData));
            } catch (error) {
                console.error('Error fetching match detail:', error);
                setMatchData(null);
            }
        };
        fetchMatchDetail();
    }, [id]);

    // useEffect riêng để xử lý thời gian đếm ngược
    useEffect(() => {
        if (!matchData || matchData.status !== 'live' || !matchData.timeRemaining) {
            setTimeRemaining(matchData?.timeRemaining || "N/A");
            return;
        }

        let interval = null;
        // Giảm phụ thuộc vào state timeRemaining để tránh re-render liên tục
        const [hours, minutes, seconds] = matchData.timeRemaining.split(':').map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
        // Kiểm tra totalSeconds để tránh lỗi đếm ngược âm
        if (totalSeconds <= 0) {
            setTimeRemaining("00:00:00");
            return;
        }

        interval = setInterval(() => {
            totalSeconds--;
            if (totalSeconds <= 0) {
                clearInterval(interval);
                setTimeRemaining("00:00:00");
                return;
            }
            const newHours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const newMinutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const newSeconds = (totalSeconds % 60).toString().padStart(2, '0');
            setTimeRemaining(`${newHours}:${newMinutes}:${newSeconds}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [matchData]); // Dependency chỉ vào matchData để khởi động lại timer khi dữ liệu mới được fetch

    // CÁC useEffect KHÁC
    // Websocket Connection
    useEffect(() => {
        const currentUser = JSON.parse(sessionStorage.getItem('user_data'));
        if (!currentUser || !currentUser.telegram_id) {
            console.log("MatchDetail: Waiting for current user data to listen for WebSocket.");
            return;
        }

        const wsUrl = `wss://f2farena.com/ws/${currentUser.telegram_id}`;
        let ws = null;
        let reconnectInterval = null;

        const connectWebSocket = () => {
            console.log(`MatchDetail: Attempting to connect WebSocket to ${wsUrl}`);
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('MatchDetail: WebSocket connected successfully.');
                if (reconnectInterval) {
                    clearInterval(reconnectInterval);
                    reconnectInterval = null;
                }
            };

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.match_id !== parseInt(id)) {
                        console.log(`MatchDetail: Ignoring message for other match ID: ${message.match_id}`);
                        return;
                    }
                    console.log('MatchDetail: WebSocket message received:', message);
                    switch (message.type) {
                        case "NEW_TRADE":
                            setTrades(prev => [...prev, { id: prev.length + 1, ...message.data }].slice(-50));
                            break;
                        case "NEW_COMMENT":
                            setComments(prev => [...prev, { id: prev.length + 1, ...message.data }].slice(-50));
                            break;
                        case "SCORE_UPDATE":
                            setMatchData(prev => ({
                                ...prev,
                                player1: { ...prev.player1, score: message.data.player1_score },
                                player2: { ...prev.player2, score: message.data.player2_score }
                            }));
                            break;
                        default:
                            console.log("Unknown message type:", message.type);
                    }
                } catch (e) {
                    console.error("Failed to parse WebSocket message or handle:", e, event.data);
                }
            };
            ws.onclose = (event) => {
                console.log('MatchDetail: WebSocket closed:', event.code, event.reason);
                if (!reconnectInterval) {
                    reconnectInterval = setInterval(connectWebSocket, 5000);
                }
            };
            ws.onerror = (error) => {
                console.error('MatchDetail: WebSocket error:', error);
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.close();
                }
            };
        };
        connectWebSocket();
        return () => {
            console.log('MatchDetail: Cleaning up WebSocket connection...');
            if (ws) {
                ws.close();
            }
            if (reconnectInterval) {
                clearInterval(reconnectInterval);
            }
        };
    }, [id, user]);

    // useEffect để xử lý scroll đến trade mới nhất
    useEffect(() => {
        if (activeTab === 'matching' && tradesEndRef.current) {
            tradesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [trades, activeTab]);

    // useEffect để xử lý scroll đến comment mới nhất
    useEffect(() => {
        if (activeTab === 'discussion' && commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments, activeTab]);

    // useEffect để tải TradingView widget
    useEffect(() => {
        if (!matchData || activeTab !== 'matching') {
            const widgetDiv = document.getElementById('tradingview_widget');
            if (widgetDiv) widgetDiv.innerHTML = '';
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (!widgetRef.current) {
                widgetRef.current = new window.TradingView.widget({
                    width: '100%',
                    height: 400,
                    symbol: `BINANCE:${matchData.symbol.replace('/', '')}`, // Sử dụng matchData.symbol
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
            const widgetDiv = document.getElementById('tradingview_widget');
            if (widgetDiv) widgetDiv.innerHTML = '';
            widgetRef.current = null;
        };
    }, [activeTab, matchData?.symbol]);

    // Logic gửi bình luận mới
    const handleSendComment = async (e) => {
        e.preventDefault();
        const trimmedInput = commentInput.trim();
        if (!trimmedInput || !user || !user.telegram_id || !matchData) return;

        try {
            const response = await fetch(`https://f2farena.com/api/matches/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    match_id: parseInt(id),
                    user_id: user.telegram_id,
                    comment: trimmedInput
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to post comment.');
            }
            setCommentInput('');
        } catch (error) {
            console.error('Error sending comment:', error);
            alert('Failed to send comment: ' + error.message);
        }
    };

    if (!matchData) {
        return (
            <div className="match-detail-container">
                <div className="page-padding">
                    <h2>Loading Match...</h2>
                    <p>Fetching match details for ID {id}.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/home')}>Back to Home</button>
                </div>
            </div>
        );
    }
    
    const player1Width = matchData.player1.score + matchData.player2.score > 0
        ? (matchData.player1.score / (matchData.player1.score + matchData.player2.score)) * 100
        : 50;
    const player2Width = 100 - player1Width;
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
                    <div className="info-item"><p className="primary-p">{matchData.symbol}</p></div>
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
                                        <span className="trade-amount">{trade.amount} {matchData.symbol?.split('/')[0] || matchData.symbol}</span>
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