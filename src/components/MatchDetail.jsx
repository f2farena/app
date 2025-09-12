// scr/component/MatcchDetail.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './MatchDetail.css';
import { useWebSocket } from '../contexts/WebSocketContext';
import defaultAvatar from '../assets/avatar.jpg';

const MatchCountdownTimer = ({ initialSeconds, onFinish }) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const onFinishCalled = useRef(false);

    useEffect(() => {
        // Nếu không có số giây ban đầu hoặc đã hết giờ, thì dừng lại
        if (typeof secondsLeft !== 'number' || secondsLeft < 0) {
            return;
        }

        // Nếu đếm về 0, gọi onFinish và dừng
        if (secondsLeft === 0) {
            if (onFinish && !onFinishCalled.current) {
                onFinish();
                onFinishCalled.current = true;
            }
            return;
        }

        // Thiết lập bộ đếm ngược mỗi giây
        const interval = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft, onFinish]); // Phụ thuộc vào secondsLeft để chạy lại mỗi khi nó thay đổi

    // Định dạng lại thời gian từ số giây
    const hours = Math.floor(secondsLeft / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');
    
    return <>{`${hours}:${minutes}:${seconds}`}</>;
};

const generateAvatarUrl = (seed) => `https://placehold.co/50x50/3498db/ffffff?text=${(seed.split(' ').map(n => n[0]).join('') || 'NN').toUpperCase()}`;
const getAvatarSource = (player) => {
    return player?.avatar || generateAvatarUrl(player ? player.name : 'Unknown');
};

// Modal chờ đăng nhập
const LoginConfirmationModal = ({ matchData, cancellationReason, navigate }) => {
    // Nếu có lý do hủy trận, hiển thị thông báo hủy
    if (cancellationReason) {
        return (
            <div className="login-modal-overlay">
                <div className="login-modal-content card">
                    <h3 className="login-modal-title" style={{color: 'var(--color-loss)'}}>⚔️ Match Canceled</h3>
                    <p className="login-modal-instructions" style={{marginTop: '1rem'}}>
                        {cancellationReason}
                    </p>
                    <button className="btn btn-secondary" onClick={() => navigate('/arena')}>
                       Back to Arena
                    </button>
                </div>
            </div>
        );
    }
    
    const player1Ready = matchData.player1.ready;
    const player2Ready = matchData.player2.ready;

    const StatusIndicator = ({ readyStatus }) => {
        if (readyStatus === 1) {
            return <div className="status-indicator ready">✅ Ready</div>;
        }
        if (readyStatus === -1) {
            return <div className="status-indicator failed">❌ Failed</div>;
        }
        // Mặc định là trạng thái chờ (readyStatus === 0 hoặc undefined)
        return <div className="status-indicator waiting">Waiting...</div>;
    };

    return (
        <div className="login-modal-overlay">
            <div className="login-modal-content card">
                <h3 className="login-modal-title">Awaiting Players</h3>
                <p className="login-modal-instructions">
                    The system is verifying and connecting to your trading account. Please wait a few minutes.
                </p>
                <div className="player-status-list">
                    <div className="player-status-row">
                        <div className="player-info-modal">
                            <img 
                                src={getAvatarSource(matchData.player1)} 
                                alt={matchData.player1.name} 
                                className="player-avatar-modal" 
                                onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                            />
                            <span>{matchData.player1.name}</span>
                        </div>
                        <StatusIndicator readyStatus={player1Ready} />
                    </div>
                    <div className="player-status-row">
                        <div className="player-info-modal">
                            <img 
                                src={getAvatarSource(matchData.player2)} 
                                alt={matchData.player2.name} 
                                className="player-avatar-modal" 
                                onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                            />
                            <span>{matchData.player2.name}</span>
                        </div>
                        <StatusIndicator readyStatus={player2Ready} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component hiển thị kết quả trận đấu
const MatchResultDisplay = ({ matchData, user }) => {
    const { result } = matchData;
    // Nếu không có object 'result' thì không hiển thị gì cả
    if (!result) {
        console.error("MatchResultDisplay missing 'result' object in matchData", matchData);
        return <div className="page-padding"><h2>Result data is not available.</h2></div>;
    }

    const isDraw = result.winner_id === null || result.winner_id === 'draw';

    if (isDraw) {
        return (
            <div className="card match-result-card" style={{ textAlign: 'center', margin: '1rem' }}>
                <h3 className="result-title">Match Result</h3>
                <div className="result-draw">
                    <p className="result-status-text">DRAW</p>
                    <p>Both players had the same score.</p>
                </div>
            </div>
        );
    }

    // Xác định người thắng và người thua
    const winnerInfo = result.winner_id === matchData.player1.id ? matchData.player1 : matchData.player2;
    // Lấy điểm số cuối cùng của người thắng từ dữ liệu player tương ứng
    const winnerFinalScore = result.winner_id === matchData.player1.id ? matchData.player1.score : matchData.player2.score;

    const isCurrentUserWinner = user?.telegram_id === result.winner_id;

    const StarIcon = (props) => (
        <svg className="winner-star-icon" viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
    );

    const winnerAvatarUrl = getAvatarSource(winnerInfo);

    return (
        <div className="page-padding">
            <div className="winner-showcase">
                <div className="winner-stars">
                    <StarIcon style={{ animationDelay: '0.2s' }} />
                    <StarIcon style={{ transform: 'scale(1.3)', animationDelay: '0s' }} />
                    <StarIcon style={{ animationDelay: '0.4s' }}/>
                </div>
                <div 
                    className="winner-showcase-avatar" 
                    style={{
                        backgroundImage: `url(${winnerAvatarUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        backgroundRepeat: 'no-repeat',
                    }}
                    role="img"
                    aria-label={winnerInfo.name}
                ></div>
                <h2 className="winner-showcase-label">VICTORIOUS</h2>
                <h3 className="winner-showcase-name">{winnerInfo.name}</h3>
                <div className="winner-final-stats">
                    <div className="winner-stat-item">
                        <span>Final Score</span>
                        {/* Sử dụng điểm số đã xác định ở trên */}
                        <p>{winnerFinalScore.toFixed(2)}</p>
                    </div>
                    <div className="winner-stat-item">
                        <span>{matchData.type === 'tournament' ? 'Score Change' : 'Winnings'}</span>
                        <p>
                            {matchData.type === 'tournament' 
                                ? `${result.winning_amount > 0 ? '+' : ''}${result.winning_amount.toFixed(2)} pts`
                                : `${result.winning_amount.toFixed(2)} USDT`
                            }
                        </p>
                    </div>
                </div>
                {isCurrentUserWinner && (
                    <p className="congrats-message">Congratulations! The winnings have been added to your wallet.</p>
                )}
            </div>
        </div>
    );
};

const WaitingForResultModal = () => (
    <div className="login-modal-overlay">
        <div className="login-modal-content card" style={{ textAlign: 'center' }}>
            <h3 className="login-modal-title">Match Finished</h3>
            <div className="loading-pulse" style={{ margin: '1.5rem auto' }}></div>
            <p className="login-modal-instructions">
                The match has concluded. Waiting for the final results from the server...
            </p>
        </div>
        </div>
);

const VolumeProgressBar = ({ player1Volume, player2Volume, volumeRule }) => {
    // Tính toán chiều rộng thanh progress cho mỗi player
    const p1Progress = volumeRule > 0 ? Math.min((player1Volume / (volumeRule * 2)) * 100, 100) : 0;
    const p2Progress = volumeRule > 0 ? Math.min((player2Volume / (volumeRule * 2)) * 100, 100) : 0;

    const p1Achieved = player1Volume >= volumeRule;
    const p2Achieved = player2Volume >= volumeRule;
    
    return (
        <div className="volume-axis-container">
            {/* Thanh của Player 1 (bên trái) */}
            <div className="volume-axis-bar left">
                <div 
                    className={`volume-axis-fill ${!p1Achieved ? 'red' : 'green'}`} 
                    style={{ width: `${p1Progress}%` }}
                ></div>
                <span className="volume-axis-rule-marker">{volumeRule?.toFixed(2)}</span>
            </div>
            
            {/* Dùng một container riêng để căn lề hai con số ra hai bên */}
            <div className="volume-values-wrapper">
                <span className={`volume-axis-value left ${p1Achieved ? 'achieved' : ''}`}>
                    {player1Volume?.toFixed(2)}
                </span>
                <span className={`volume-axis-value right ${p2Achieved ? 'achieved' : ''}`}>
                    {player2Volume?.toFixed(2)}
                </span>
            </div>

            {/* Điểm chia ở giữa */}
            <div className="volume-axis-center">
                <div className="volume-axis-title">Volume</div>
            </div>

            {/* Thanh của Player 2 (bên phải) */}
            <div className="volume-axis-bar right">
                <div 
                    className={`volume-axis-fill ${!p2Achieved ? 'red' : 'green'}`} 
                    style={{ width: `${p2Progress}%` }}
                ></div>
                <span className="volume-axis-rule-marker">{volumeRule?.toFixed(2)}</span>
            </div>
        </div>
    );
};

// Component chính
const MatchDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); 
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
    const [cancellationReason, setCancellationReason] = useState(null);
    const [matchResultFromSocket, setMatchResultFromSocket] = useState(null);
    const [showWaitingModal, setShowWaitingModal] = useState(false);

    // =================================================================
    // BƯỚC 1: ĐỊNH NGHĨA fetchMatchDetail BẰNG useCallback
    // =================================================================
    const fetchMatchDetail = useCallback(async () => {
        // Xác định loại trận đấu từ state được truyền qua navigate
        const matchType = location.state?.matchType || 'personal'; // Mặc định là 'personal' (1vs1)
        
        // Xây dựng URL API động
        const apiUrl = matchType === 'tournament'
            ? `https://f2farena.com/api/tournaments/matches/${id}`
            : `https://f2farena.com/api/matches/${id}`;

        console.log(`Fetching ${matchType} match detail from: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Fetched match detail:', data);

            setMatchData(data); // Sửa lại từ updatedData thành data
            sessionStorage.setItem(`match_detail_${id}`, JSON.stringify(data));

        } catch (error) {
            console.error('Error fetching match detail:', error);
            setMatchData(null);
        }
    }, [id, location.state]);

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

                case "OPPONENT_LOGIN_FAILED":
                    setCancellationReason(message.data.message);
                    break;
                
                case "BOTH_PLAYERS_LOGIN_FAILED":
                    setCancellationReason(message.data.message);
                    break;

                case "NEW_TRADE":
                    setTrades(prevTrades => {
                        const newTrade = { ...message.data, player: message.data.player };
                        return [...prevTrades, newTrade];
                    });
                    break;
                case "NEW_COMMENT":
                case "NEW_TOURNAMENT_COMMENT":
                    const newCommentData = message.data;
                    const commentUser = newCommentData.user_name || newCommentData.user || 'Guest';
                    const commentAvatar = newCommentData.user_avatar || generateAvatarUrl(commentUser);
                    const isCurrentUser = user && user.telegram_id === newCommentData.user_id;

                    const newComment = {
                        id: newCommentData.id,
                        user: commentUser,
                        avatar: commentAvatar,
                        comment: newCommentData.comment,
                        timestamp: newCommentData.created_at || newCommentData.timestamp,
                        isCurrentUser: isCurrentUser
                    };
                    
                    setComments(prev => [...prev, newComment].slice(-50));
                    break;
                case "VOLUME_UPDATE":
                    setMatchData(prevData => {
                        if (!prevData) return null;
                        console.log(`[MatchDetail] Received VOLUME_UPDATE for match ${id}: P1=${message.data.player1_volume}, P2=${message.data.player2_volume}`);
                        return {
                            ...prevData,
                            player1: { ...prevData.player1, volume: message.data.player1_volume },
                            player2: { ...prevData.player2, volume: message.data.player2_volume },
                        };
                    });
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
                case "VIEW_COUNT_UPDATE":
                    setViews(message.data.views);
                    break;
                case "MATCH_DONE":
                    console.log("Received match results from WebSocket:", message.data);
                    setMatchResultFromSocket(message.data);
                    
                    // Cập nhật trạng thái hiển thị kết quả và tắt modal
                    setShowWaitingModal(false);
                    // Force fetch lại dữ liệu để cập nhật trạng thái 'completed' và kết quả
                    fetchMatchDetail();
                    break;
            }
        };

        window.addEventListener('websocket-message', handleWebSocketMessage);
        
        return () => {
            window.removeEventListener('websocket-message', handleWebSocketMessage);
        };
    }, [id, fetchMatchDetail, user]);

    useEffect(() => {
        fetchMatchDetail();
    }, [id, fetchMatchDetail]); 

    useEffect(() => {
        if (matchData) {
            // Chỉ set giá trị ban đầu MỘT LẦN khi matchData được fetch lần đầu
            setViews(prevViews => prevViews > 0 ? prevViews : (matchData.views || 0));
            setOutsideBetsTotal(matchData.outsideBetsTotal || 0);
        }
        // Phụ thuộc vào ID để chỉ chạy khi đổi trận đấu, không chạy khi score thay đổi
    }, [id, matchData?.player1, matchData?.player2]);

    useEffect(() => {
        const fetchComments = async () => {
            if (!matchData) return;
            const matchType = matchData.type;
            const apiUrl = matchType === 'tournament'
                ? `https://f2farena.com/api/tournaments/matches/${id}/comments`
                : `https://f2farena.com/api/matches/${id}/comments`;

            console.log(`Fetching initial comments from: ${apiUrl}`);

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Failed to fetch comments');
                const data = await response.json();
                
                // Chuẩn hóa dữ liệu nhận được trước khi lưu vào state
                const formattedComments = data.map(comment => ({
                    id: comment.id,
                    // Lấy user_name cho tournament, hoặc username cho 1vs1
                    user: comment.user_name || comment.username || `User_${comment.user_id}`,
                    avatar: comment.user_avatar || generateAvatarUrl(comment.user_name || comment.username || ''),
                    comment: comment.comment,
                    timestamp: comment.created_at || comment.timestamp,
                    isCurrentUser: user && user.telegram_id === comment.user_id,
                }));

                setComments(formattedComments);
            } catch (error) {
                console.error("Error fetching comments history:", error);
            }
        };
        
        // Chỉ fetch khi `matchData` đã có
        if (matchData) {
            fetchComments();
        }
    }, [id, matchData, user]);

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
            
            const matchType = matchData.type || 'personal';
            const apiUrl = matchType === 'tournament'
                ? `https://f2farena.com/api/tournaments/matches/${id}/trades`
                : `https://f2farena.com/api/matches/${id}/trades`;
            
            console.log(`Fetching trade history from: ${apiUrl}`);

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch trade history');
                }
                const data = await response.json();
                
                // GHI CHÚ: API backend mới đã trả về `player_name`
                // nên ta không cần map lại tên nữa, chỉ cần chuẩn bị dữ liệu.
                const tradesWithPlayerNames = data.map(trade => ({
                    ...trade,
                    player: trade.player_name || 'Unknown Player' // Đảm bảo có fallback name
                }));

                setTrades(tradesWithPlayerNames);
            } catch (error) {
                console.error("Error fetching trade history:", error);
            }
        };
        
        if (id && matchData) {
            fetchTradeHistory();
        }
    }, [id, matchData]);

    useEffect(() => {
        // Chỉ chạy khi tab 'matching' active và có dữ liệu symbol để vẽ
        if (activeTab === 'matching' && matchData && matchData.tradingview_symbol && matchData.status === 'live') {
            // Chỉ tạo widget nếu nó chưa được khởi tạo
            if (!widgetRef.current) {
                console.log("Creating TradingView Widget for the first time.");
                const script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/tv.js';
                script.async = true;
                script.onload = () => {
                    if (document.getElementById('tradingview_widget')) {
                        widgetRef.current = new window.TradingView.widget({
                            width: '100%',
                            height: 400,
                            symbol: matchData.tradingview_symbol,
                            interval: '1',
                            timezone: 'Etc/UTC',
                            theme: 'dark',
                            style: '1',
                            locale: 'en',
                            toolbar_bg: '#f1f3f6',
                            enable_publishing: false,
                            allow_symbol_change: true,
                            container_id: 'tradingview_widget',
                        });
                    }
                };
                document.body.appendChild(script);
            }
        }

        // Hàm dọn dẹp: Sẽ chạy khi component unmount hoặc khi activeTab thay đổi
        return () => {
            // Nếu người dùng chuyển tab hoặc rời trang, xóa widget
            if (widgetRef.current) {
                console.log("Cleaning up TradingView Widget.");
                const widgetDiv = document.getElementById('tradingview_widget');
                if (widgetDiv) widgetDiv.innerHTML = '';
                widgetRef.current = null;
            }
        };

    }, [activeTab, matchData?.tradingview_symbol, matchData?.status]);

    const handleSendComment = async (e) => {
        e.preventDefault();
        const trimmedInput = commentInput.trim();
        if (!trimmedInput || !user || !user.telegram_id || !matchData) return;

        // GHI CHÚ: Sửa lỗi post comment. Lấy type từ `matchData`
        const matchType = matchData.type;
        const apiUrl = matchType === 'tournament'
            ? `https://f2farena.com/api/tournaments/matches/${id}/comments`
            : `https://f2farena.com/api/matches/${id}/comments`;

        console.log(`Posting comment to: ${apiUrl}`);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // match_id: parseInt(id), // match_id đã được lấy từ URL
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
        }
    };

    useEffect(() => {
        // Hàm cleanup sẽ được gọi khi người dùng rời khỏi trang MatchDetail
        return () => {
            console.log("Leaving MatchDetail page, clearing Arena's match cache.");
            sessionStorage.removeItem('active_matches');
        };
    }, []);
    
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
                    <img 
                        src={getAvatarSource(matchData.player1)} 
                        alt={matchData.player1.name} 
                        className="player-avatar" 
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                    />
                    <span className="player-name">{matchData.player1.name}</span>
                    {matchData.player1.odds && <span className="player-odds">{matchData.player1.odds}</span>}
                </div>
                <div className="center-details">
                    <div className="time-remaining">
                        {matchData.status === 'live' && typeof matchData.timeRemaining === 'number'
                            ?   <MatchCountdownTimer 
                                initialSeconds={matchData.timeRemaining} // <-- SỬA PROP TẠI ĐÂY
                                onFinish={() => {
                                    // Khi timer về 0, kiểm tra ngay lập tức
                                    // Dùng `setMatchResultFromSocket` với một callback để lấy giá trị state mới nhất
                                    setMatchResultFromSocket(currentResult => {
                                        if (currentResult) {
                                            // Nếu đã có kết quả -> gọi fetch để cập nhật UI
                                            console.log("Timer finished. Result was already received. Fetching details.");
                                            fetchMatchDetail(); 
                                        } else {
                                            // Nếu chưa có kết quả -> hiện modal chờ
                                            console.log("Timer finished. No result yet. Showing waiting modal.");
                                            setShowWaitingModal(true);
                                        }
                                        return currentResult; // return lại state không đổi
                                    });
                                }} 
                            />
                            : (matchData.status === 'completed' || matchData.status === 'done' ? 'Finished' : 'Pending') 
                        }
                    </div>
                    <div className="vs-text">VS</div>
                </div>
                <div className="player-info">
                    <img 
                        src={getAvatarSource(matchData.player2)} 
                        alt={matchData.player2.name} 
                        className="player-avatar" 
                        onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                    />
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

            {/* Thanh tiến trình Volume */}
            {matchData.type === 'tournament' && matchData.player1 && matchData.player2 && matchData.volume_rule !== undefined && (
                <div className="page-padding" style={{ paddingTop: '1rem' }}>
                    <VolumeProgressBar 
                        player1Volume={matchData.player1.volume}
                        player2Volume={matchData.player2.volume}
                        volumeRule={matchData.volume_rule}
                    />
                </div>
            )}
            
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
            {matchData.status === 'completed' || matchData.status === 'done' ? (
                <MatchResultDisplay matchData={matchData} user={user} />
            ) : (
                <>
                    {(matchData.status === 'pending_confirmation' || (matchData.type === 'tournament' && matchData.status === 'upcoming')) && (
                        <LoginConfirmationModal matchData={matchData} cancellationReason={cancellationReason} navigate={navigate} />
                    )}
                    
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
                                        <div key={trade.id || `trade-${index}`} className={`trade-box ${Number(trade.player_id) === Number(matchData.player1.id) ? 'left' : 'right'}`}>
                                            <div className="trade-info">
                                                <span className="trade-type">{trade.type}</span>
                                                <span className="trade-amount">{trade.amount} {trade.symbol || (matchData.symbol?.split('/')[0] || matchData.symbol)}</span>
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
                                                <img 
                                                    src={generateAvatarUrl(comment.user)} 
                                                    alt={comment.user} 
                                                    className="discussion-avatar" 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }}
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
            
            {showWaitingModal && <WaitingForResultModal />}
        </div>
    );
};

export default MatchDetail;