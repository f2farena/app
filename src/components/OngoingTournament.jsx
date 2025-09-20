// src/components/OngoingTournament.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import MatchCountdownTimer from './MatchCountdownTimer';
import goldCup from '../assets/gold-cup.png';
import silverCup from '../assets/silver-cup.png';
import bronzeCup from '../assets/bronze-cup.png';
import tournamentBanner from '../assets/banner-tournament.jpg';

const generateAvatarUrl = (seed) => `https://placehold.co/50x50/3498db/ffffff?text=${(String(seed).split(' ').map(n=>n[0]).join('') || 'NN').toUpperCase()}`;

const UpcomingMatchCountdown = ({ matchTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const targetTime = new Date(matchTime).getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft("Starting...");
                clearInterval(interval);
                onTimeUp(); // Gọi callback khi hết giờ
                return;
            }

            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            const seconds = Math.floor((difference % (1000 * 60)) / 1000).toString().padStart(2, '0');

            setTimeLeft(`${hours}:${minutes}:${seconds}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [matchTime, onTimeUp]);

    return <div className="match-time accent">{timeLeft || 'Calculating...'}</div>;
};

// --- Component Countdown Timer ---
const TournamentCountdown = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(endTime);
      const difference = end - now;
      if (difference <= 0) {
        setTimeLeft('Finished');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime]);
  return <div className="tournament-countdown">{timeLeft || 'Calculating...'}</div>;
};

// --- Component Tab Kết quả ---
const ResultsTab = ({ results, prizeStructure }) => {
    const topPrizesFromStructure = prizeStructure ? prizeStructure.filter(p => p.prize_type === 'top') : [];

    const defaultTopPrizes = [
        { rank: 2, name: 'Anonymous', prize: topPrizesFromStructure.find(p => p.rank === 2)?.prize || 'Unknown', avatar: 'https://i.imgur.com/6VBx3io.png' },
        { rank: 1, name: 'Anonymous', prize: topPrizesFromStructure.find(p => p.rank === 1)?.prize || 'Unknown', avatar: 'https://i.imgur.com/6VBx3io.png' },
        { rank: 3, name: 'Anonymous', prize: topPrizesFromStructure.find(p => p.rank === 3)?.prize || 'Unknown', avatar: 'https://i.imgur.com/6VBx3io.png' },
    ];

    // Kiểm tra xem results.topPrizes có dữ liệu thực không
    const hasRealData = results && results.topPrizes && results.topPrizes.length > 0;

    // Sử dụng dữ liệu thật nếu có, nếu không thì dùng dữ liệu mặc định
    const topThreeData = hasRealData ? [
        results.topPrizes.find(p => p.rank === 2),
        results.topPrizes.find(p => p.rank === 1),
        results.topPrizes.find(p => p.rank === 3)
    ].filter(Boolean) : defaultTopPrizes;

    // Nếu dữ liệu thật ít hơn 3 người, điền vào bằng dữ liệu mặc định
    if (hasRealData && topThreeData.length < 3) {
        const ranksPresent = topThreeData.map(p => p.rank);
        if (!ranksPresent.includes(1)) topThreeData.splice(1, 0, defaultTopPrizes[1]);
        if (!ranksPresent.includes(2)) topThreeData.splice(0, 0, defaultTopPrizes[0]);
        if (!ranksPresent.includes(3)) topThreeData.push(defaultTopPrizes[2]);
    }

    return (
        <div className="results-tab">
            <div className="top-prizes-container">
                {topThreeData.map(winner => (
                    <div key={winner.rank} className={`prize-item prize-rank-${winner.rank}`}>
                        <img 
                            src={winner.rank === 1 ? goldCup : (winner.rank === 2 ? silverCup : bronzeCup)} 
                            alt={`Rank ${winner.rank}`} 
                            className="prize-cup"
                        />
                        <img 
                            src={winner.avatar || 'https://i.imgur.com/6VBx3io.png'} 
                            alt={winner.name} 
                            className="trader-avatar prize-avatar" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/6VBx3io.png'; }}
                        />
                        <p className="prize-winner-name">{winner.name}</p>
                        <span className="prize-amount">{winner.prize}</span>
                    </div>
                ))}
            </div>
            {/* Giữ nguyên phần giải khuyến khích và giải đội */}
            <div className="card prize-list-card">
                <h3 className="section-title">Consolation Prizes</h3>
                {results && results.consolationPrizes && results.consolationPrizes.length > 0 ? (
                    <div className="prize-list">
                        {results.consolationPrizes.map(item => (
                            <div key={item.id} className="prize-list-item">
                                <span>{item.name}</span>
                                <span className="prize-amount">{item.prize}</span>
                            </div>
                        ))}
                    </div>
                ) : <p className="no-data-message" style={{padding: '0 1rem 1rem'}}>Not yet available.</p>}
            </div>
            <div className="card prize-list-card">
                <h3 className="section-title">Team Prizes</h3>
                {results && results.teamPrizes && results.teamPrizes.length > 0 ? (
                    <div className="prize-list">
                        {results.teamPrizes.map(item => (
                            <div key={item.id} className="prize-list-item">
                                <span>{item.name}</span>
                                <span className="prize-amount">{item.prize}</span>
                            </div>
                        ))}
                    </div>
                ) : <p className="no-data-message" style={{padding: '0 1rem 1rem'}}>Not yet available.</p>}
            </div>
        </div>
    );
};

// --- Component Danh sách các vòng đấu ---
const RoundsTab = ({ rounds, currentDay }) => {
  const currentRoundName = rounds[currentDay - 1]?.name || null;
  const [expandedRound, setExpandedRound] = useState(currentRoundName);
  const toggleRound = (roundName) => {
    setExpandedRound(expandedRound === roundName ? null : roundName);
  };
  const reversedRounds = rounds.slice().reverse();
  return (
    <div>
      <div className="rounds-container">
        {reversedRounds.map((round, index) => (
          <div key={index} className="round-card card">
            <button className="round-header" onClick={() => toggleRound(round.name)}>
              <span>{round.name}</span>
              <svg className={`filter-arrow ${expandedRound === round.name ? 'open' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {expandedRound === round.name && (
                <div className="round-participants">
                    {round.participants.map(user => (
                        <div key={user.id} className="participant-item">
                            <img
                                src={user.avatar || 'https://i.imgur.com/6VBx3io.png'}
                                alt={user.name}
                                className="trader-avatar"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/6VBx3io.png'; }}
                            />
                            <div className="participant-details">
                                <span className="participant-name">{user.name}</span>
                                <span className="participant-score">{user.score.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Component cho các trận đấu Live ---
const LiveMatchCard = ({ match }) => {
    const navigate = useNavigate(); // Thêm hook useNavigate
    const { player1, player2, startTime, durationMinutes } = match;
    
    // Hàm phụ trợ để lấy avatar an toàn
    const getAvatar = (player) => player?.avatar || generateAvatarUrl(player?.name || '?');

    return (
        // Bọc component trong một thẻ div có thể click
        <div className="live-tournament-match card" onClick={() => navigate(`/match/${match.id}`, { state: { matchType: 'tournament' } })} style={{cursor: 'pointer'}}>
            <div className="live-match-player">
                <img src={getAvatar(player1)} alt={player1.name} className="trader-avatar" />
                <span className="live-match-player-name">{player1.name}</span>
                <p className="live-match-score">{player1.score.toLocaleString()} pts</p>
            </div>
            <div className="live-match-center">
                <div className="live-indicator">Live</div>
                <div className="vs-text">VS</div>
                <MatchCountdownTimer startTime={startTime} durationMinutes={durationMinutes} />
            </div>
            <div className="live-match-player">
                <img src={getAvatar(player2)} alt={player2.name} className="trader-avatar" />
                <span className="live-match-player-name">{player2.name}</span>
                <p className="live-match-score">{player2.score.toLocaleString()} pts</p>
            </div>
        </div>
    );
};

// --- Component cho tab Match Schedule mới ---
const MatchScheduleTab = ({ myMatches, liveMatches, currentUser, navigate })  => {
    const matchesByDay = myMatches.reduce((acc, match) => {
        // Lấy ngày từ 'time' của trận đấu và chuyển thành một chuỗi định dạng dễ đọc
        // Ví dụ: 'September 7, 2025'
        const matchDate = new Date(match.time).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Nếu ngày này chưa có trong accumulator, tạo một mảng rỗng cho nó
        if (!acc[matchDate]) {
            acc[matchDate] = [];
        }

        // Thêm trận đấu hiện tại vào mảng của ngày tương ứng
        acc[matchDate].push(match);
        return acc;
    }, {});

    return (
        <div>
            {currentUser && (
                <div className="my-matches-section card">
                    <h3 className="section-title">⚔️ Your Matches</h3>
                    {/* GHI CHÚ: Thay đổi logic render từ lặp qua mảng phẳng sang lặp qua đối tượng đã nhóm */}
                    {Object.keys(matchesByDay).length > 0 ? (
                        // Dùng Object.entries để lặp qua cả key (ngày) và value (mảng trận đấu)
                        Object.entries(matchesByDay).map(([date, matchesOnDate]) => (
                            <div key={date} className="match-day-group">
                                {/* Hiển thị tiêu đề cho mỗi ngày */}
                                <h4 className="match-day-header">{date}</h4>
                                {matchesOnDate.map((match, index) => {
                                const opponent = match.player1.id === currentUser.id ? match.player2 : match.player1;
                                const isCompleted = match.status === 'completed';
                                const isWinner = isCompleted && match.winner === currentUser.id;
                                return (
                                    <div 
                                        key={match.id} 
                                        className="my-match-item clickable" // Thêm class để tạo hiệu ứng hover
                                        onClick={() => navigate(`/match/${match.id}`, { state: { matchType: 'tournament' } })}
                                    >
                                        <div className="opponent-info">
                                            <span className="match-number">{index + 1}.</span>
                                            <img 
                                                src={opponent.avatar || 'https://i.imgur.com/6VBx3io.png'} 
                                                alt="Opponent" 
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/6VBx3io.png'; }}
                                            />
                                            <strong>{opponent.name}</strong>
                                        </div>
                                        {isCompleted ? (
                                            <div className={`match-result ${isWinner ? 'win' : 'loss'}`}>
                                                <span>{isWinner ? 'Win' : 'Loss'}</span>
                                                <p>{isWinner ? `+${match.scoreChange}` : `${match.scoreChange}`} pts</p>
                                            </div>
                                        ) : ( 
                                            myMatches.filter(m => m.status === 'upcoming')[0]?.id === match.id ? (
                                                <UpcomingMatchCountdown 
                                                    matchTime={match.time} 
                                                    onTimeUp={() => { /* Logic được quản lý ở App.jsx */ }} 
                                                />
                                            ) : (
                                                <div className="match-time">
                                                    {new Date(match.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )
                                        )}
                                    </div>
                                );
                                })}
                            </div>
                        ))
                    ) : (
                        <p className="no-data-message">You have no upcoming or completed matches in this tournament.</p>
                    )}
                </div>
            )}
            
            <h3 className="section-title" style={{ marginTop: '1.5rem' }}>🔵 Live Matches</h3>
            <div className="live-matches-container">
                {liveMatches.length > 0 ? (
                    liveMatches.map(match => (
                        <LiveMatchCard key={match.id} match={match} />
                    ))
                ) : (
                    <div className="card">
                        <p className="no-data-message">There are no live matches at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Component Chính ---
const OngoingTournament = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { sendMessage, isConnected } = useWebSocket();
    const [tournament, setTournament] = useState(null);
    const [activeTab, setActiveTab] = useState('schedule');
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState('');
    const commentsEndRef = useRef(null);

    useEffect(() => {
        // Chỉ fetch dữ liệu khi có ID giải đấu và thông tin người dùng
        if (id && user?.telegram_id) {
            const fetchTournamentData = async () => {
                try {
                    // Gọi đến endpoint mới, truyền ID giải đấu và ID người dùng hiện tại
                    const response = await fetch(`https://f2farena.com/api/tournaments/ongoing/${id}?current_user_id=${user.telegram_id}`);
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    setTournament(data);
                } catch (err) {
                    console.error("Failed to fetch tournament data:", err);
                    setError(err.message);
                }
            };

            fetchTournamentData();
        }
    // Dependency array bao gồm id và user.telegram_id
    }, [id, user]);

    // useEffect để join phòng WebSocket và lắng nghe tin nhắn
    useEffect(() => {
        // 1. Join phòng khi kết nối WebSocket sẵn sàng
        if (isConnected) {
            console.log(`Joining tournament discussion room for ID: ${id}`);
            sendMessage({
                action: 'join_tournament',
                tournament_id: parseInt(id, 10)
            });
        }

        // 2. Lắng nghe tin nhắn mới
        const handleWebSocketMessage = (event) => {
            const message = event.detail;
            if (message.type === 'NEW_TOURNAMENT_DISCUSSION_COMMENT' && message.tournament_id === parseInt(id, 10)) {
                // Thêm user_id và isCurrentUser để hiển thị đúng
                const newComment = {
                    ...message.data,
                    isCurrentUser: user && user.telegram_id === message.data.user_id,
                };
                setComments(prev => [...prev, newComment]);
            }
        };

        window.addEventListener('websocket-message', handleWebSocketMessage);

        return () => {
            window.removeEventListener('websocket-message', handleWebSocketMessage);
            // Có thể thêm logic "leave_tournament" nếu cần
        };
    }, [id, isConnected, sendMessage, user]);

    // useEffect để fetch lịch sử comments khi activeTab là 'discussion'
    useEffect(() => {
        const fetchComments = async () => {
            if (activeTab === 'discussion' && user?.telegram_id) {
                try {
                    const response = await fetch(`https://f2farena.com/api/tournaments/${id}/discussion?user_id=${user.telegram_id}`);
                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.detail || 'Failed to fetch comments');
                    }
                    const data = await response.json();
                    const formattedComments = data.map(c => ({
                        ...c,
                        isCurrentUser: user.telegram_id === c.user_id
                    }));
                    setComments(formattedComments);
                } catch (err) {
                    console.error("Error fetching discussion comments:", err);
                    // Hiển thị lỗi cho người dùng nếu cần
                }
            }
        };

        fetchComments();
    }, [activeTab, id, user]);

    // useEffect để cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        if (activeTab === 'discussion') {
            commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments, activeTab]);

    const handleSendComment = async (e) => {
        e.preventDefault();
        const trimmedInput = commentInput.trim();
        if (!trimmedInput || !user || !user.telegram_id) return;

        try {
            const response = await fetch(`https://f2farena.com/api/tournaments/${id}/discussion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.telegram_id,
                    comment: trimmedInput
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to post comment.');
            }
            setCommentInput('');
            // Tin nhắn sẽ được thêm vào state thông qua WebSocket broadcast
        } catch (error) {
            console.error('Error sending comment:', error);
            alert(error.message);
        }
    };

    if (error) {
        return <div className="page-padding"><h2>Error: {error}</h2></div>;
    }

    if (!tournament) {
        return <div className="page-padding"><h2>Loading Tournament Data...</h2></div>;
    }

    // Dữ liệu giờ đây đã có cấu trúc chuẩn từ API, không cần đổi tên hay xử lý gì thêm
    const { title, endTime, users = [], rounds = [], currentUser, results = {}, currentDay, liveMatches = [], myMatches = [] } = tournament;
    const currentRound = rounds[currentDay - 1];

    return (
        <div className="detail-page-container ongoing-tournament">
            <div 
                className="ongoing-header"
                style={{ backgroundImage: `linear-gradient(to top, rgba(10, 23, 93, 0.85), rgba(29, 50, 157, 0.6)), url(${tournamentBanner})` }}
            >
                <button className="icon-button detail-back-button" onClick={() => navigate('/arena')}>
                    <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
                <div className="header-info">
                    <h1>{title}</h1>
                    
                    <div className="header-meta-info">
                        {currentRound && (
                            <div className="meta-item current-round-text">
                                <svg xmlns="http://www.w3.org/2000/svg" className="meta-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                                </svg>
                                <span>{currentRound.name}</span>
                            </div>
                        )}
                        <TournamentCountdown endTime={endTime} />
                    </div>
                </div>
            </div>
            <div className="wallet-tabs tournament-tabs" style={{ margin: '1rem' }}>
                <button className={`wallet-tab-button ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
                    <span className="tab-icon">⚔️</span>
                    <span>Matches</span>
                </button>
                <button className={`wallet-tab-button ${activeTab === 'rounds' ? 'active' : ''}`} onClick={() => setActiveTab('rounds')}>
                    <span className="tab-icon">🔄</span>
                    <span>Rounds</span>
                </button>
                <button className={`wallet-tab-button ${activeTab === 'discussion' ? 'active' : ''}`} onClick={() => setActiveTab('discussion')}>
                    <span className="tab-icon">💬</span>
                    <span>Discussion</span>
                </button>
                <button className={`wallet-tab-button ${activeTab === 'scores' ? 'active' : ''}`} onClick={() => setActiveTab('scores')}>
                    <span className="tab-icon">🏆</span>
                    <span>Leaderboard</span>
                </button>
                <button className={`wallet-tab-button ${activeTab === 'result' ? 'active' : ''}`} onClick={() => setActiveTab('result')}>
                    <span className="tab-icon">🏅</span>
                    <span>Result</span>
                </button>
            </div>

            <div className="tab-content page-padding">
                 {activeTab === 'schedule' && (
                    <MatchScheduleTab 
                        myMatches={myMatches} 
                        liveMatches={liveMatches} 
                        currentUser={currentUser} 
                        navigate={navigate}
                    />
                )}

                {activeTab === 'rounds' && (
                    <RoundsTab rounds={rounds} currentDay={currentDay} />
                )}

                {activeTab === 'discussion' && (
                    <div className="discussion-container" style={{height: '60vh', display: 'flex', flexDirection: 'column'}}>
                        <div className="discussion-messages" style={{flexGrow: 1, overflowY: 'auto', padding: '0.5rem'}}>
                            {comments.map((comment) => (
                                <div key={comment.id} className={`discussion-bubble-row ${comment.isCurrentUser ? 'user' : 'other'}`}>
                                    <div className="discussion-bubble-container">
                                        {!comment.isCurrentUser && (
                                            <img 
                                                src={comment.user_avatar || generateAvatarUrl(comment.user_name)} 
                                                alt={comment.user_name} 
                                                className="discussion-avatar"
                                            />
                                        )}
                                        <div className={`discussion-bubble ${comment.isCurrentUser ? 'user' : 'other'}`}>
                                            {!comment.isCurrentUser && (
                                                <span className="discussion-user">{comment.user_name}</span>
                                            )}
                                            <span className="discussion-text">{comment.comment}</span>
                                            <span className="discussion-time">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={commentsEndRef} />
                        </div>
                        <form className="discussion-input-area" onSubmit={handleSendComment}>
                            <input 
                                type="text" 
                                className="discussion-input form-input" 
                                placeholder="Type your message..." 
                                value={commentInput} 
                                onChange={(e) => setCommentInput(e.target.value)} 
                            />
                            <button type="submit" className="discussion-send-btn btn btn-primary">
                                Send
                            </button>
                        </form>
                    </div>
                )}
                
                {activeTab === 'scores' && (
                    <>
                        {currentUser && (
                            <div className="user-stats-summary card">
                                <div className="stat-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stat-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span>Your Score: <strong className="accent-value">{currentUser.score.toLocaleString()}</strong></span>
                                </div>
                                <div className="stat-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stat-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M11.293 2.293a1 1 0 011.414 0l2 2a1 1 0 01-1.414 1.414L12 4.414V11a1 1 0 11-2 0V4.414L8.707 5.707a1 1 0 01-1.414-1.414l2-2zM3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>Your Rank: <strong className="accent-value">{currentUser.rank}</strong></span>
                                </div>
                                <div className="stat-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stat-icon" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span>Status: <strong className="accent-value">{currentUser.status_text}</strong></span>
                                </div>
                            </div>
                        )}

                        <div className="leaderboard-table card">
                            <div className="leaderboard-header ongoing-leaderboard-header">
                                <div>Rank</div>
                                <div>Trader</div>
                                <div className="text-right">Score</div>
                                <div className="text-right">Volume</div>
                            </div>
                            {users.map(u => (
                                <div key={u.id} className="leaderboard-row ongoing-leaderboard-row">
                                    <div className={`leaderboard-rank ${u.rank <= 3 ? 'top-rank' : ''}`}>{u.rank}</div>
                                    <div className="trader-info">
                                        <img 
                                            src={u.avatar || 'https://i.imgur.com/6VBx3io.png'} 
                                            alt={u.name} 
                                            className="trader-avatar" 
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://i.imgur.com/6VBx3io.png'; }}
                                        />
                                        <span>{u.name}</span>
                                    </div>
                                    <div className="text-right profit-text">{u.score.toLocaleString()}</div>
                                    <div className="text-right">{(u.volume || 0).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'result' && (
                    <ResultsTab results={results} prizeStructure={tournament.prize_structure} />
                )}
            </div>
        </div>
    );
};

export default OngoingTournament;