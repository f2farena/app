// src/components/TournamentDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * ===================================================================================
 * MODAL ĐĂNG KÝ (RegistrationModal) - Đã sửa lỗi logic đăng ký
 * ===================================================================================
 */
const RegistrationModal = ({ tournament, user, onClose, onUserUpdate }) => {
    // State nội bộ, tự quản lý
    const [newEmail, setNewEmail] = useState('');
    const [newAccount, setNewAccount] = useState({ name_account: '', server_account: '', password_account: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState('checking');

    const hasEmail = !!(user?.email && user.email !== '(NULL)'); 
    const hasBrokerAccount = user?.linkedBrokers?.includes(Number(tournament.broker_id));

    // Xác định bước cần thực hiện khi modal mở ra
    useEffect(() => {
        // CHỈ CHẠY 1 LẦN: Quyết định trạng thái ban đầu khi modal mở ra.
        if (!hasEmail) {
            setStep('need_email');
        } else if (!hasBrokerAccount) {
            setStep('need_account');
        } else {
            setStep('confirm');
        }
    }, []);

    const handleUpdateEmail = async () => {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!newEmail || !emailPattern.test(newEmail)) {
            return alert('Please enter a valid email address.');
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`https://f2farena.com/api/users/${user.telegram_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update email.');
            }
            // Sau khi thành công, gọi onUserUpdate để cập nhật dữ liệu nền
            if (onUserUpdate) onUserUpdate();

            // LUỒNG TUẦN TỰ: Chuyển thẳng sang bước tiếp theo là yêu cầu tài khoản.
            setStep('need_account');

        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Gộp logic thêm tài khoản và đăng ký vào một hàm duy nhất
    const handleAddAccountAndRegister = async () => {
        if (!newAccount.name_account || !newAccount.server_account) {
            return alert('Trading Account and Server are required.');
        }
        setIsSubmitting(true);
        try {
            // Bước 1: Thêm tài khoản
            const accResponse = await fetch('https://f2farena.com/api/accounts/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.telegram_id,
                    broker_id: tournament.broker_id,
                    ...newAccount
                })
            });
            if (!accResponse.ok) { // Kiểm tra kết quả ngay lập tức
                const errorData = await accResponse.json();
                throw new Error(errorData.detail || 'Failed to add account.');
            }

            // Bước 2: Chỉ khi thêm tài khoản thành công, mới tiến hành đăng ký giải
            const regResponse = await fetch('https://f2farena.com/api/tournament-register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.telegram_id, tournament_id: tournament.id })
            });
            if (!regResponse.ok) { // Kiểm tra kết quả
                const errorData = await regResponse.json();
                throw new Error(errorData.detail || "Registration failed after adding account.");
            }
            
            // Bước 3: Cập nhật lại thông tin user và chuyển sang màn hình thành công
            if (onUserUpdate) onUserUpdate();
            setStep('success');

        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm đăng ký trực tiếp khi đã đủ điều kiện
    const handleConfirmRegistration = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('https://f2farena.com/api/tournament-register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.telegram_id, tournament_id: tournament.id })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Registration failed.");
            }

            if (onUserUpdate) await onUserUpdate();
            setStep('success');

        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER CONTENT DỰA TRÊN TỪNG BƯỚC ---
    
    let content;
    switch (step) {
        case 'need_email':
            content = (
                <>
                    <h4>Email Required</h4>
                    <p style={{ marginBottom: '1rem' }}>Please provide your email address to continue.</p>
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Enter your email" className="form-input" style={{ marginBottom: '1rem' }} disabled={isSubmitting} />
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleUpdateEmail} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Email'}</button>
                    </div>
                </>
            );
            break;
        case 'need_account':
            content = (
                <>
                    <h4>Account Required</h4>
                    <p>You need an account with <strong>{tournament.broker}</strong> to join.</p>
                    <p style={{ marginBottom: '1rem' }}>If you don't have one, <a href={tournament.brokerRegistrationUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)' }}>register here</a>, then fill in your info below.</p>
                    <input type="text" value={newAccount.name_account} onChange={(e) => setNewAccount({ ...newAccount, name_account: e.target.value })} placeholder="Trading Account (MT5)" className="form-input" style={{ marginBottom: '1rem' }} disabled={isSubmitting} />
                    <input type="password" value={newAccount.password_account} onChange={(e) => setNewAccount({ ...newAccount, password_account: e.target.value })} placeholder="Password (Optional)" className="form-input" style={{ marginBottom: '1rem' }} disabled={isSubmitting} />
                    <input type="text" value={newAccount.server_account} onChange={(e) => setNewAccount({ ...newAccount, server_account: e.target.value })} placeholder="Server" className="form-input" style={{ marginBottom: '1rem' }} disabled={isSubmitting} />
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAddAccountAndRegister} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit & Register'}</button>
                    </div>
                </>
            );
            break;
        case 'confirm':
            content = (
                <>
                    <h4>Confirm Registration</h4>
                    <p style={{ margin: '1rem 0' }}>You have met all requirements. Do you want to register for this tournament?</p>
                    <div className="confirmation-buttons">
                        <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleConfirmRegistration} disabled={isSubmitting}>{isSubmitting ? 'Confirming...' : 'Confirm'}</button>
                    </div>
                </>
            );
            break;
        case 'success':
            content = (
                <>
                    <h4>Successful!</h4>
                    <p style={{ margin: '1rem 0' }}>You have successfully registered for the tournament.</p>
                    <div className="confirmation-buttons">
                        <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>OK</button>
                    </div>
                </>
            );
            break;
        default:
            content = <p>Checking conditions...</p>;
    }

    return (
        <>
            <div className="confirmation-overlay" onClick={!isSubmitting ? onClose : undefined}></div>
            <div className="confirmation-modal card">{content}</div>
        </>
    );
};

/**
 * ===================================================================================
 * COMPONENT CHÍNH: TRANG CHI TIẾT GIẢI ĐẤU
 * ===================================================================================
 */
const TournamentDetail = ({ user, onUserUpdate }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    useEffect(() => {
        const fetchTournamentDetail = async () => {
            try {
                const response = await fetch(`https://f2farena.com/api/tournaments/${id}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                const tournamentData = {
                    id: data.id,
                    title: data.title,
                    thumbnail: data.thumbnail,
                    date: new Date(data.event_time).toLocaleDateString(),
                    author: 'F2FArena Team',
                    description: data.description,
                    prizePool: data.prize_pool + ' USDT',
                    participants: data.participants,
                    symbol: data.symbol,
                    startTime: data.event_time,
                    broker_id: data.broker_id,
                    broker: 'Go Markets',
                    brokerRegistrationUrl: 'https://www.gomarkets.com/register',
                };
                setTournament(tournamentData);
            } catch (error) {
                console.error('Error fetching tournament detail:', error);
            }
        };
        fetchTournamentDetail();
    }, [id]);

    const isLoading = !user || !tournament;

    if (isLoading) {
        return <div className="page-padding"><h2>Loading...</h2></div>;
    }

    const tournamentId = Number(id);
    const isRegistered = user?.registeredTournaments?.includes(tournamentId);
    const isTournamentEnded = new Date(tournament.startTime) < new Date();

    return (
        <div className="detail-page-container">
            <div style={{ position: 'relative' }}>
                <img src={tournament.thumbnail} alt={tournament.title} className="detail-page-banner" />
                <button className="icon-button detail-back-button" onClick={() => navigate('/arena')}>
                    <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </button>
            </div>

            <div className="page-padding">
                <h1 className="detail-page-title">{tournament.title}</h1>
                <p className="detail-page-meta">By {tournament.author} - {tournament.date}</p>

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

                <div className="detail-page-content" dangerouslySetInnerHTML={{ __html: tournament.description }} />
            </div>

            {!isTournamentEnded && (
                <footer className="detail-page-footer">
                    {isRegistered ? (
                        <button className="btn btn-secondary" style={{ width: '90%', maxWidth: '400px' }} disabled>Registered</button>
                    ) : (
                        <button className="btn btn-accent" style={{ width: '90%', maxWidth: '400px' }} onClick={() => setShowRegisterModal(true)}>
                            Register Now
                        </button>
                    )}
                </footer>
            )}

            {showRegisterModal && (
                <RegistrationModal
                    tournament={tournament}
                    user={user}
                    onClose={() => setShowRegisterModal(false)}
                    onUserUpdate={onUserUpdate}
                />
            )}
        </div>
    );
};

export default TournamentDetail;