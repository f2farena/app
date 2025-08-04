import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ArenaDetail.css';
import DraggableWebcam from './DraggableWebcam'; // Assuming this component is handled separately

// DỮ LIỆU ĐẦU VÀO CHỈ CÓ 1 NGƯỜI CHƠI (This comment seems to be outdated given the API calls)

const generateAvatarUrl = (seed) => `https://placehold.co/50x50/3498db/ffffff?text=${(seed.split(' ').map(n=>n[0]).join('') || 'NN').toUpperCase()}`;
// Note: initialTrades and initialComments below are placeholders.
// In a real-time system, these would ideally be fetched from the backend or via WebSocket.
const initialTrades = [ { id: 1, player: 'GoldSeeker', type: 'BUY', amount: 0.1, price: 2300, timestamp: '2025-06-11T14:00:00Z' } ];
const initialComments = [ { id: 1, user: 'SpectatorX', comment: 'Waiting for a worthy opponent!', timestamp: '2025-06-11T14:01:00Z' } ];

const ArenaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const widgetRef = useRef(null);

    const [matchData, setMatchData] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("00:00:00"); // State for time, initialized with a default
    const [trades, setTrades] = useState(initialTrades); // Initialize with placeholder data
    const tradesEndRef = useRef(null);
    const [comments, setComments] = useState(initialComments); // Initialize with placeholder data
    const commentsEndRef = useRef(null);
    const [commentInput, setCommentInput] = useState('');
    const [activeTab, setActiveTab] = useState('matching');

    // Fetch detail from the backend endpoint
    useEffect(() => {
        const fetchArenaMatchDetail = async () => {
            const cacheKey = `match_detail_${id}`; // Use a common cache key with MatchDetail
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                setMatchData(parsedData);
                setTimeRemaining(parsedData.timeRemaining || "00:00:00"); // Set initial time from fetched data
                return;
            }
            try {
                // Use the general match detail endpoint, which provides all info (waiting or live)
                const response = await fetch(`https://f2farena.com/api/matches/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched Arena match detail:', data);

                // Prepend 'https://f2farena.com/server/' for avatar if path is relative
                // The backend now sends 'server/pictures/...' so we just need the base URL.
                if (data.player1 && data.player1.avatar && !data.player1.avatar.startsWith('http')) {
                    data.player1.avatar = `https://f2farena.com/${data.player1.avatar}`;
                }
                // Handle player2 avatar similarly
                if (data.player2 && data.player2.avatar && !data.player2.avatar.startsWith('http')) {
                    data.player2.avatar = `https://f2farena.com/${data.player2.avatar}`;
                }
                
                setMatchData(data);
                setTimeRemaining(data.timeRemaining || "00:00:00");
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
            } catch (error) {
                console.error('Error fetching Arena match detail:', error);
                setMatchData(null); // Set to null to show "Not Found" or loading state
            }
        };
        fetchArenaMatchDetail();
    }, [id]);

    // Logic to update time remaining (for display only)
    useEffect(() => {
        // Only count down if matchData is available and status is 'live' or 'pending_confirmation'
        // For 'waiting' status, timeRemaining is often not a countdown but a static 'N/A' or 'Waiting...'
        if (!matchData || (matchData.status !== 'live' && matchData.status !== 'pending_confirmation') || timeRemaining === "00:00:00") {
            return;
        }

        const interval = setInterval(() => {
            const [hours, minutes, seconds] = timeRemaining.split(':').map(Number);
            let totalSeconds = hours * 3600 + minutes * 60 + seconds;

            if (totalSeconds <= 0) {
                clearInterval(interval);
                setTimeRemaining("00:00:00");
                // Potentially refetch matchData here to get final status if time runs out
                return;
            }

            totalSeconds--;
            const newHours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const newMinutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const newSeconds = (totalSeconds % 60).toString().padStart(2, '0');
            setTimeRemaining(`${newHours}:${newMinutes}:${newSeconds}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeRemaining, matchData]); // Dependency on timeRemaining and matchData to re-run on updates

    // Scroll to latest trade (if active tab is 'matching')
    useEffect(() => {
        if (activeTab === 'matching' && tradesEndRef.current) {
            tradesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [trades, activeTab]);

    // Scroll to latest comment (if active tab is 'discussion')
    useEffect(() => {
        if (activeTab === 'discussion' && commentsEndRef.current) {
            commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments, activeTab]);

    const handleSendComment = (e) => {
        e.preventDefault();
        const trimmedInput = commentInput.trim();
        if (!trimmedInput) return;
        
        // In a real application, you would send this comment to your backend via API
        // and then update the comments state based on a WebSocket push or a subsequent fetch.
        // For now, this is a local update.
        const newComment = { id: comments.length + 1, user: 'CurrentUser', comment: trimmedInput, timestamp: new Date().toISOString() };
        setComments((prev) => [...prev, newComment]);
        setCommentInput('');
    };

    // TradingView Widget logic
    useEffect(() => {
        // Only load widget if matchData is available and tab is 'matching'
        if (!matchData || activeTab !== 'matching') return;

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            const container = document.getElementById('tradingview_widget_container');
            // Ensure the container exists and doesn't already have a widget initialized
            if (container && !container.hasChildNodes()) {
                console.log("Pair for TradingView in ArenaDetail:", matchData.pair);
                new window.TradingView.widget({
                    width: '100%',
                    height: 400,
                    symbol: `BINANCE:${matchData.pair.split('/')[0].replace('/', '')}USDT`, // Ensure correct symbol format for TradingView
                    interval: '1',
                    timezone: 'Etc/UTC',
                    theme: 'dark',
                    style: '1',
                    locale: 'en',
                    enable_publishing: false,
                    allow_symbol_change: false,
                    container_id: 'tradingview_widget_container',
                });
            }
        };
        return () => {
            // Clean up the widget when component unmounts or tab changes
            const widgetDiv = document.getElementById('tradingview_widget_container');
            if (widgetDiv) {
                widgetDiv.innerHTML = ''; // Clear the widget content
            }
            // Removing the script from body is generally not necessary as it might affect other pages
            // if they rely on it and it's a single page application.
        };
    }, [activeTab, matchData]); // Re-run when activeTab or matchData changes

    if (!matchData) {
        return (
            <div className="match-detail-container" style={{padding: '1rem', textAlign: 'center'}}>
                <h2>Loading Match...</h2>
                <button className="btn btn-primary" onClick={() => navigate('/arena')}>Back to Arena</button>
            </div>
        );
    }

    // Logic to redirect to MatchDetail if the match is no longer waiting
    // This handles scenarios where Player 2 joins or Player 1 confirms from Telegram.
    if (matchData.status === 'live' || matchData.player2.id !== null) {
        console.log(`Match ${id} is live or has player2, navigating to MatchDetail.`);
        navigate(`/match/${id}`);
        return null; // Don't render ArenaDetail if redirecting
    }

    // Calculate score bar width
    const player1Width = matchData.player1.score + matchData.player2.score > 0
        ? (matchData.player1.score / (matchData.player1.score + matchData.player2.score)) * 100
        : 50; // Default to 50/50 if scores are 0
    const player2Width = 100 - player1Width;


    return (
        // Reusing CSS class names from MatchDetail for consistent styling
        <div className="match-detail-container">
            <DraggableWebcam /> {/* Assuming this component is relevant here */}

            {/* Match Header Section */}
            <div className="match-detail-header">
                <button className="icon-button back-button" onClick={() => navigate('/arena')}>&lt;</button>
                <div className="player-info">
                    <img src={matchData.player1.avatar || generateAvatarUrl(matchData.player1.name)} alt={matchData.player1.name} className="player-avatar" />
                    <span className="player-name">{matchData.player1.name}</span>
                    <span className="player-odds">{matchData.player1.odds}</span>
                </div>
                <div className="center-details">
                    {/* Display 'Waiting' or actual timeRemaining based on status */}
                    <div className="time-remaining">{matchData.status === 'waiting' ? 'Waiting...' : timeRemaining}</div>
                    <div className="vs-text">VS</div>
                </div>
                <div className="player-info">
                    {/* Player 2 will be "Waiting" if not yet joined */}
                    <img src={matchData.player2.avatar || generateAvatarUrl(matchData.player2.name)} alt={matchData.player2.name} className="player-avatar" />
                    <span className="player-name">{matchData.player2.name}</span>
                    <span className="player-odds">{matchData.player2.odds}</span>
                </div>
            </div>

            {/* Score Bar Section */}
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

            {/* Header Bottom Section */}
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
                </div>
            </div>

            {/* Tab Buttons */}
            <div className="tab-buttons">
                <button className={`tab-button ${activeTab === 'matching' ? 'active' : ''}`} onClick={() => setActiveTab('matching')}>Matching</button>
                <button className={`tab-button ${activeTab === 'discussion' ? 'active' : ''}`} onClick={() => setActiveTab('discussion')}>Discussion</button>
            </div>

            {/* Tab Content */}
            {activeTab === 'matching' && (
                <>
                    <div className="trading-view-container">
                        <div id="tradingview_widget_container"></div>
                    </div>

                    {/* BUY/SELL Buttons - Only enable if the match is live (for actual trading) */}
                    {matchData.status === 'live' && (
                        <div className="arena-action-buttons">
                            <button className="btn btn-buy">BUY</button>
                            <button className="btn btn-sell">SELL</button>
                        </div>
                    )}

                    <div className="timeline-container">
                        <div className="timeline">
                            {trades.length > 0 ? (
                                trades.map((trade) => (
                                    <div key={trade.id} className={`trade-box right`}>
                                        <div className="trade-info">
                                            <span className="trade-type">{trade.type}</span>
                                            <span className="trade-amount">{trade.amount} {matchData.pair.split('/')[0]}</span>
                                            <span className="trade-price">${trade.price}</span>
                                            <span className="trade-time">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--color-secondary-text)' }}>No trades yet.</p>
                            )}
                            <div ref={tradesEndRef} />
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'discussion' && (
                <div className="discussion-container">
                    <div className="discussion-messages">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className={`discussion-bubble-row ${comment.user === 'CurrentUser' ? 'user' : 'other'}`}>
                                    <div className="discussion-bubble-container">
                                        {comment.user !== 'CurrentUser' && (<img src={generateAvatarUrl(comment.user)} alt={comment.user} className="discussion-avatar" />)}
                                        <div className={`discussion-bubble ${comment.user === 'CurrentUser' ? 'user' : 'other'}`}>
                                            {comment.user !== 'CurrentUser' && (<span className="discussion-user">{comment.user}</span>)}
                                            <span className="discussion-text">{comment.comment}</span>
                                            <span className="discussion-time">{new Date(comment.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--color-secondary-text)' }}>No comments yet. Be the first to comment!</p>
                        )}
                        <div ref={commentsEndRef} />
                    </div>
                    <form className="discussion-input-area" onSubmit={handleSendComment}>
                        <input type="text" className="discussion-input form-input" placeholder="Type your comment..." value={commentInput} onChange={(e) => setCommentInput(e.target.value)} />
                        <button type="submit" className="discussion-send-btn btn btn-primary">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ArenaDetail;