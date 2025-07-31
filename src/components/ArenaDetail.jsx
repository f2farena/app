import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ArenaDetail.css';
import DraggableWebcam from './DraggableWebcam';

// DỮ LIỆU ĐẦU VÀO CHỈ CÓ 1 NGƯỜI CHƠI
const arenaMatchesData = [
    { id: 101, betAmount: 75, symbol: 'XRP/USDT', challenger: { name: 'GoldSeeker' }, waitingTime: '00:05:00' },
    { id: 102, betAmount: 200, symbol: 'SOL/USDC', challenger: { name: 'ForexGiant' }, waitingTime: '00:12:30' },
    { id: 103, betAmount: 50, symbol: 'BTC/USDT', challenger: { name: 'CryptoNewbie' }, waitingTime: '00:01:45' },
    { id: 104, betAmount: 150, symbol: 'ETH/USDT', challenger: { name: 'EthTrader' }, waitingTime: '00:08:10' },
];

const generateAvatarUrl = (seed) => `https://placehold.co/50x50/3498db/ffffff?text=${(seed.split(' ').map(n=>n[0]).join('') || 'NN').toUpperCase()}`;
const initialTrades = [ { id: 1, player: 'GoldSeeker', type: 'BUY', amount: 0.1, price: 2300, timestamp: '2025-06-11T14:00:00Z' } ];
const initialComments = [ { id: 1, user: 'SpectatorX', comment: 'Waiting for a worthy opponent!', timestamp: '2025-06-11T14:01:00Z' } ];

const ArenaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const widgetRef = useRef(null);

    const [matchData, setMatchData] = useState(null);  // State thay vì hardcode

    // useEffect mới: Fetch detail từ endpoint với sessionStorage
    useEffect(() => {
        const fetchArenaDetail = async () => {
            const cacheKey = `arena_detail_${id}`;
            console.log(`Checking sessionStorage for ${cacheKey}`);  // Log kiểm tra cache
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                console.log(`Using cached arena detail for id ${id}`);
                setMatchData(JSON.parse(cachedData));
                return;
            }
            try {
                const response = await fetch(`http://localhost:8000/api/matches/waiting/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched arena detail:', data);  // Log data fetched

                // TỰ ĐỘNG TẠO RA PLAYER 1 VÀ PLAYER 2 TỪ DỮ LIỆU FETCHED (giữ nguyên logic)
                const processedData = {
                    id: data.id,
                    pair: data.pair,
                    betAmount: data.bet,
                    player1: { name: data.owner || 'Challenger', avatar: generateAvatarUrl(data.owner || 'Challenger'), score: data.player1_score || 5, odds: data.player1_odds || '1:1.0' },  // Adjust field từ backend
                    player2: { name: 'Myself', avatar: generateAvatarUrl('Bot'), score: data.player2_score || 5, odds: data.player2_odds || '1:1.0' },
                    timeRemaining: data.timeRemaining,
                    views: data.views || Math.floor(Math.random() * 100),
                };
                setMatchData(processedData);
                sessionStorage.setItem(cacheKey, JSON.stringify(processedData));  // Lưu processed data
                console.log(`Stored arena detail for id ${id} to sessionStorage`);
            } catch (error) {
                console.error('Error fetching arena detail:', error);
                setMatchData(null);  // Để show Not Found
            }
        };
        fetchArenaDetail();
    }, [id]);

    if (!matchData) {
        return (
            <div className="match-detail-container" style={{padding: '1rem', textAlign: 'center'}}>
                <h2>Match Not Found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/arena')}>Back to Arena</button>
            </div>
        );
    }

    const [timeRemaining, setTimeRemaining] = useState(matchData.timeRemaining);
    const [trades, setTrades] = useState(initialTrades);
    const tradesEndRef = useRef(null);
    const [comments, setComments] = useState(initialComments);
    const commentsEndRef = useRef(null);
    const [commentInput, setCommentInput] = useState('');
    const [activeTab, setActiveTab] = useState('matching');

    const handleSendComment = (e) => {
        e.preventDefault();
        const trimmedInput = commentInput.trim();
        if (!trimmedInput) return;
        const newComment = { id: comments.length + 1, user: 'CurrentUser', comment: trimmedInput, timestamp: new Date().toISOString() };
        setComments((prev) => [...prev, newComment]);
        setCommentInput('');
    };

    useEffect(() => {
        if (activeTab !== 'matching' || !matchData) return;
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            const container = document.getElementById('tradingview_widget_container');
            if (container && !container.hasChildNodes()) {
                console.log("Pair for TradingView:", matchData.pair);  // Log để check trước khi init widget
                new window.TradingView.widget({
                    width: '100%', height: 400,
                    symbol: `BINANCE:${matchData.pair.split(' ')[0].replace('/', '')}`,
                    interval: '1', timezone: 'Etc/UTC', theme: 'dark', style: '1',
                    locale: 'en', enable_publishing: false, allow_symbol_change: false,
                    container_id: 'tradingview_widget_container',
                });
            }
        };
        return () => {
            const widgetDiv = document.getElementById('tradingview_widget_container');
            if (widgetDiv) widgetDiv.innerHTML = '';
        };
    }, [activeTab, matchData]);

    return (
        // DÙNG CHUNG CLASSNAME VỚI MATCHDETAIL ĐỂ KẾ THỪA STYLE
        <div className="match-detail-container">
            <DraggableWebcam />
            <div className="match-detail-header">
                <button className="icon-button back-button" onClick={() => navigate('/arena')}>&lt;</button>
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

            {/* SCORE BAR ĐẦY ĐỦ */}
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

            {/* HEADER BOTTOM ĐẦY ĐỦ */}
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

            {/* CÁC NÚT TAB - ĐÃ BỎ TAB "BET OUTSIDE" */}
            <div className="tab-buttons">
                <button className={`tab-button ${activeTab === 'matching' ? 'active' : ''}`} onClick={() => setActiveTab('matching')}>Matching</button>
                <button className={`tab-button ${activeTab === 'discussion' ? 'active' : ''}`} onClick={() => setActiveTab('discussion')}>Discussion</button>
            </div>

            {/* NỘI DUNG CÁC TAB */}
            {activeTab === 'matching' && (
                <>
                    <div className="trading-view-container">
                        <div id="tradingview_widget_container"></div>
                    </div>

                    {/* NÚT BUY/SELL ĐÃ ĐƯỢC DỜI RA ĐÂY */}
                    <div className="arena-action-buttons">
                        <button className="btn btn-buy">BUY</button>
                        <button className="btn btn-sell">SELL</button>
                    </div>

                    <div className="timeline-container">
                        <div className="timeline">
                            {trades.map((trade) => (
                                <div key={trade.id} className={`trade-box right`}>
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
                        ))}
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