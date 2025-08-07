import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MatchDetail.css';
import { useWebSocket } from '../contexts/WebSocketContext';

const generateAvatarUrl = (seed) => `https://placehold.co/50x50/3498db/ffffff?text=${(seed.split(' ').map(n => n[0]).join('') || 'NN').toUpperCase()}`;

// Modal chờ đăng nhập
const LoginConfirmationModal = ({ matchData }) => {
    const player1Ready = matchData.player1.ready;
    const player2Ready = matchData.player2.ready;

    const StatusIndicator = ({ isReady }) => (
        <div className={`status-indicator ${isReady ? 'ready' : 'waiting'}`}>
            {isReady ? '✅ Ready' : 'Waiting...'}
        </div>
    );

    return (
        <div className="login-modal-overlay">
            <div className="login-modal-content card">
                <h3 className="login-modal-title">Awaiting Players</h3>
                <p className="login-modal-instructions">
                    Please log in to your trading account. The match will begin automatically once both players are ready.
                </p>
                <div className="player-status-list">
                    <div className="player-status-row">
                        <div className="player-info-modal">
                            <img src={matchData.player1.avatar} alt={matchData.player1.name} className="player-avatar-modal" />
                            <span>{matchData.player1.name}</span>
                        </div>
                        <StatusIndicator isReady={player1Ready} />
                    </div>
                    <div className="player-status-row">
                        <div className="player-info-modal">
                            <img src={matchData.player2.avatar} alt={matchData.player2.name} className="player-avatar-modal" />
                            <span>{matchData.player2.name}</span>
                        </div>
                        <StatusIndicator isReady={player2Ready} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component hiển thị kết quả trận đấu
const MatchResultDisplay = ({ matchData, user }) => {
    // ... (Giữ nguyên nội dung component này, không cần thay đổi)
    const { result } = matchData;
    if (!result) return null;

    const isDraw = result.winner_id === 'draw';

    if (isDraw) {
        return (
            <div className="card match-result-card" style={{ textAlign: 'center', margin: '1rem' }}>
                <h3 className="result-title">Match Result</h3>
                <div className="result-draw">
                    <p className="result-status-text">DRAW</p>
                    <p>Both players had the same score. The bet amount has been refunded.</p>
                </div>
            </div>
        );
    }

    const winner = result.winner_id === matchData.player1.id ? matchData.player1 : matchData.player2;
    const isCurrentUserWinner = user?.telegram_id === result.winner_id;

    const StarIcon = (props) => (
        <svg className="winner-star-icon" viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );

    return (
        <div className="page-padding">
            <div className="winner-showcase">
                <div className="winner-stars">
                    <StarIcon style={{ animationDelay: '0.2s' }} />
                    <StarIcon style={{ transform: 'scale(1.3)', animationDelay: '0s' }} />
                    <StarIcon style={{ animationDelay: '0.4s' }}/>
                </div>
                <img src={winner.avatar} alt={winner.name} className="winner-showcase-avatar" />
                <h2 className="winner-showcase-label">VICTORIOUS</h2>
                <h3 className="winner-showcase-name">{winner.name}</h3>
                <div className="winner-final-stats">
                    <div className="winner-stat-item">
                        <span>Final Score</span>
                        <p>{winner.score.toFixed(2)}</p>
                    </div>
                    <div className="winner-stat-item">
                        <span>Winnings</span>
                        <p>{result.winning_amount.toFixed(2)} USDT</p>
                    </div>
                </div>
                {isCurrentUserWinner && (
                    <p className="congrats-message">Congratulations! The winnings have been added to your wallet.</p>
                )}
            </div>
        </div>
    );
};

// Component chính
const MatchDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { sendMessage, isConnected } = useWebSocket();

    const widgetRef = useRef(null);
    const tradesEndRef = useRef(null);
    const commentsEndRef = useRef(null);

    const [matchData, setMatchData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("00:00:00");
    const [trades, setTrades] = useState([]);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const [activeTab, setActiveTab] = useState('matching');
    const [views, setViews] = useState(0);
    const [outsideBetsTotal, setOutsideBetsTotal] = useState(0);
    const [showResultModal, setShowResultModal] = useState(false);
    const [matchResult, setMatchResult] = useState(null);

    // =================================================================
    // BƯỚC 1: ĐỊNH NGHĨA fetchMatchDetail BẰNG useCallback
    // =================================================================
    const fetchMatchDetail = useCallback(async () => {
        try {
            const response = await fetch(`https://f2farena.com/api/matches/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched match detail:', data);

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
            sessionStorage.setItem(`match_detail_${id}`, JSON.stringify(updatedData));

        } catch (error) {
            console.error('Error fetching match detail:', error);
            setMatchData(null);
        }
    }, [id]);


    // =================================================================
    // BƯỚC 2: SỬA LẠI CÁC useEffect
    // =================================================================

    // useEffect để kết nối WebSocket room
    useEffect(() => {
        const handleWebSocketOpen = () => {
            console.log(`[MatchDetail] WebSocket is confirmed open. Sending join request for match ${id}.`);
            sendMessage({
                action: "join",
                match_id: parseInt(id)
            });
        };

        if (isConnected) {
            handleWebSocketOpen();
        }

        window.addEventListener('websocket-open', handleWebSocketOpen);
        return () => {
            window.removeEventListener('websocket-open', handleWebSocketOpen);
        };
    }, [id, isConnected, sendMessage]);
    
    // useEffect xử lý tin nhắn WebSocket
    useEffect(() => {
        const handleWebSocketMessage = (event) => {
            const message = event.detail;

            if (message.match_id !== parseInt(id)) {
                return;
            }

            console.log('[MatchDetail] Received relevant WebSocket message:', message);

            switch (message.type) {
                case "PLAYER_READY_UPDATE":
                    setMatchData(prevData => {
                        if (!prevData) return prevData;
                        return {
                            ...prevData,
                            player1: { ...prevData.player1, ready: message.data.player1_ready },
                            player2: { ...prevData.player2, ready: message.data.player2_ready },
                        };
                    });
                    break;
                
                case "MATCH_STARTED":
                    console.log('[WebSocket] Match started! Fetching latest details.');
                    fetchMatchDetail();
                    break;

                case "NEW_TRADE":
                    setTrades(prevTrades => {
                        const playerName = matchData
                            ? (message.data.player_id === matchData.player1.id ? matchData.player1.name : matchData.player2.name)
                            : 'Unknown Player';
                        
                        const newTrade = { ...message.data, player: playerName };
                        return [...prevTrades, newTrade];
                    });
                    break;
                case "NEW_COMMENT":
                    setComments(prev => [...prev, { id: prev.length + 1, ...message.data }].slice(-50));
                    break;
                case "SCORE_UPDATE":
                    setMatchData(prevData => {
                        if (!prevData) return null;
                        return {
                            ...prevData,
                            player1: { ...prevData.player1, score: message.data.player1_score },
                            player2: { ...prevData.player2, score: message.data.player2_score },
                        };
                    });
                    break;
                case "MATCH_DONE":
                    setMatchResult(message.data);
                    setShowResultModal(true);
                    break;
            }
        };

        window.addEventListener('websocket-message', handleWebSocketMessage);
        
        return () => {
            window.removeEventListener('websocket-message', handleWebSocketMessage);
        };
    }, [id, fetchMatchDetail, matchData]); // Thêm matchData để logic NEW_TRADE lấy được tên

    // useEffect để fetch dữ liệu lần đầu khi vào trang
    useEffect(() => {
        fetchMatchDetail();
    }, [id, fetchMatchDetail]); 

    // Các useEffect khác giữ nguyên...

    useEffect(() => {
        if (matchData) {
            setViews(matchData.views || 0);
            setOutsideBetsTotal(matchData.outsideBetsTotal || 0);
        }
    }, [matchData]);

    useEffect(() => {
        if (!matchData || matchData.status !== 'live' || !matchData.timeRemaining) {
            setTimeRemaining(matchData?.timeRemaining || "N/A");
            return;
        }

        let interval = null;
        const [hours, minutes, seconds] = matchData.timeRemaining.split(':').map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;
        
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
    }, [matchData]); 

    useEffect(() => {
        const fetchComments = async () => {
            if (!matchData) return;
            try {
                const response = await fetch(`https://f2farena.com/api/matches/${id}/comments`);
                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }
                const data = await response.json();
                setComments(data);
            } catch (error) {
                console.error("Error fetching comments history:", error);
            }
        };

        fetchComments();
    }, [id, matchData]); 

    useEffect(() => {
        if (activeTab === 'matching' && tradesEndRef.current) {
            tradesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [trades, activeTab]);

    useEffect(() => {
        if (activeTab === 'discussion' && commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments, activeTab]);

    useEffect(() => {
        const fetchTradeHistory = async () => {
            if (!id || !matchData) return;
            try {
                const response = await fetch(`https://f2farena.com/api/matches/${id}/trades`);
                if (!response.ok) {
                    throw new Error('Failed to fetch trade history');
                }
                const data = await response.json();
                
                const tradesWithPlayerNames = data.map(trade => ({
                    ...trade,
                    player: trade.player_id === matchData.player1.id ? matchData.player1.name : matchData.player2.name
                }));

                setTrades(tradesWithPlayerNames);
            } catch (error) {
                console.error("Error fetching trade history:", error);
            }
        };
        fetchTradeHistory();
    }, [id, matchData]);

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
                    symbol: `BINANCE:${matchData.symbol.replace('/', '')}`,
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
            // Bỏ alert
        }
    };
    
    // JSX trả về
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

    return (
        <div className="match-detail-container">
            {/* Header */}
            <div className="match-detail-header">
                <button className="icon-button back-button" onClick={() => navigate(-1)}>&lt;</button>
                <div className="player-info">
                    <img src={matchData.player1.avatar} alt={matchData.player1.name} className="player-avatar" />
                    <span className="player-name">{matchData.player1.name}</span>
                    {matchData.player1.odds && <span className="player-odds">{matchData.player1.odds}</span>}
                </div>
                <div className="center-details">
                    <div className="time-remaining">
                        {matchData.status === 'done' ? 'Finished' : timeRemaining}
                    </div>
                    <div className="vs-text">VS</div>
                </div>
                <div className="player-info">
                    <img src={matchData.player2.avatar} alt={matchData.player2.name} className="player-avatar" />
                    <span className="player-name">{matchData.player2.name}</span>
                    {matchData.player2.odds && <span className="player-odds">{matchData.player2.odds}</span>}
                </div>
            </div>

            {/* Score Bar */}
            <div className="score-bar-container">
                <div className="score-bar">
                    <div className="score-bar-player1" style={{ width: `${player1Width}%` }}></div>
                    <div className="score-bar-player2" style={{ width: `${player2Width}%` }}></div>
                </div>
                <div className="score-text">
                    <span>Score: {matchData.player1.score}</span>
                    <span>Score: {matchData.player2.score}</span>
                </div>
            </div>
            
            {/* Match Info */}
            <div className="header-bottom-section">
                <div className="info-group">
                    <div className="info-item"><p className="primary-p">{matchData.symbol}</p></div>
                    <div className="info-item"><p className="accent-p">{matchData.betAmount} USDT</p></div>
                </div>
                <div className="info-group">
                    <div className="info-item icon-info">
                        <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        <span>{views}</span>
                    </div>
                    <div className="info-item icon-info">
                        <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                        <span>{outsideBetsTotal.toFixed(2)} USDT</span>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            {matchData.status === 'done' ? (
                <MatchResultDisplay matchData={matchData} user={user} />
            ) : (
                <>
                    {matchData.status === 'pending_confirmation' && <LoginConfirmationModal matchData={matchData} />}
                    
                    <div className="tab-buttons">
                        <button className={`tab-button ${activeTab === 'matching' ? 'active' : ''}`} onClick={() => setActiveTab('matching')}>
                            Matching
                        </button>
                        <button className={`tab-button ${activeTab === 'discussion' ? 'active' : ''}`} onClick={() => setActiveTab('discussion')}>
                            Discussion
                        </button>
                    </div>

                    {activeTab === 'matching' && (
                        <>
                            <div className="trading-view-container">
                                <div id="tradingview_widget"></div>
                            </div>
                            <div className="timeline-container">
                                <div className="timeline">
                                    {trades.map((trade, index) => (
                                        <div key={trade.id || index} className={`trade-box ${trade.player === matchData.player1.name ? 'left' : 'right'}`}>
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
                                    <div key={comment.id} className={`discussion-bubble-row ${comment.user === 'CurrentUser' ? 'user' : 'other'}`}>
                                        <div className="discussion-bubble-container">
                                            {comment.user !== 'CurrentUser' && (
                                                <img src={generateAvatarUrl(comment.user)} alt={comment.user} className="discussion-avatar" />
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
                            <form className="discussion-input-area" onSubmit={handleSendComment}>
                                <input type="text" className="discussion-input form-input" placeholder="Type your comment..." value={commentInput} onChange={(e) => setCommentInput(e.target.value)} />
                                <button type="submit" className="discussion-send-btn btn btn-primary">
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                </>
            )}
            
            {showResultModal && matchResult && (
                // ... (Giữ nguyên component ResultModal đã có)
                <div className="modal-overlay">
                    <div className="modal-content card">
                        {/* Nội dung modal kết quả */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchDetail;