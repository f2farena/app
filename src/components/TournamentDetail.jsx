import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

console.log('React version in TournamentDetail:', React.version);
console.log('useState exists:', !!useState);  // Check useState có tồn tại không
console.log('useEffect exists:', !!useEffect);  // Check useEffect (sẽ false nếu thiếu import)

// Trong handleConfirmRegistration (RegistrationModal):
const handleConfirmRegistration = async () => {
  try {
    const response = await fetch('https://f2farena.com/api/tournament-register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.telegram_id, tournament_id: tournament.id, status: 0 })
    });
    const data = await response.json();
    console.log('Registration response:', data); // Log
    alert('Registration Confirmed!');
  } catch (error) {
    console.error('Error registering:', error);
  }
  onClose();
};

const RegistrationModal = ({ tournament, user, walletData, onClose, navigate, userEmail, setUserEmail, newEmail, setNewEmail, accountInfo, setAccountInfo, newAccount, setNewAccount, onUserUpdate }) => {
  const [showDownloadStep, setShowDownloadStep] = useState(false);  
  // Logic kiểm tra
  console.log('User object in RegistrationModal:', user);  // Log thêm: Để nhìn full user (sau fix sẽ thấy linkedBrokers)
  console.log('Attempting hasBrokerAccount check, linkedBrokers exists:', !!user?.linkedBrokers);  // Log thêm: Confirm trước check
  const hasBrokerAccount = user?.linkedBrokers?.includes(tournament.broker_id) || false;
  // Lấy số từ chuỗi ví dụ '1500.50 USDT' -> 1500.50
  const currentBalance = parseFloat(walletData.currentBalance); 
  const hasSufficientBalance = currentBalance >= tournament.minBalanceRequired;

  const handleOpenBrokerSite = () => {
      window.open(tournament.brokerRegistrationUrl, '_blank', 'noopener,noreferrer');
      onClose();
  };

  const handleGoToWallet = () => {
      navigate('/wallet');
      onClose();
  };
  
  const handleConfirmRegistration = () => {
      // Đây là nơi sẽ gọi API để đăng ký giải đấu thật
      console.log(`User ${user.id} confirmed registration for tournament ${tournament.id}`);
      alert('Registration Confirmed!'); // Thông báo tạm thời
      onClose();
  };

  const handleSubmitNewAccount = async () => {
    try {
        const response = await fetch('[https://f2farena.com/api/accounts/](https://f2farena.com/api/accounts/)', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.telegram_id,
                broker_id: tournament.broker_id,
                name_account: newAccount.name_account,
                server_account: newAccount.server_account
            })
        });
        const data = await response.json();
        console.log('POST new account response:', data);
        if (data.id) {
            setAccountInfo(data);

            // Cập nhật linkedBrokers trong user object và sessionStorage
            const updatedLinkedBrokers = [...(user.linkedBrokers || []), tournament.broker_id];
            const updatedUser = { ...user, linkedBrokers: updatedLinkedBrokers };
            // Truyền updatedUser lên AppContent để cập nhật state user chính
            if (typeof onUserUpdate === 'function') { // Đảm bảo onUserUpdate là một prop có sẵn và là hàm
                onUserUpdate(updatedUser); 
            } else {
                sessionStorage.setItem('user_data', JSON.stringify(updatedUser));
            }
            
            onUserUpdate(updatedUser);
            alert('Account added successfully!');
            setShowDownloadStep(true);
        } else {
            // Xử lý trường hợp backend trả về không thành công nhưng không throw lỗi HTTP
            alert(data.detail || 'Failed to add account.');
        }
    } catch (error) {
        console.error('Error POST account:', error);
        alert('Error adding account: ' + error.message);
    }
  };

  const handleSubmitNewEmail = async () => {
    console.log('handleSubmitNewEmail called, newEmail:', newEmail);  // Log thêm: Confirm newEmail trước PUT
    // Add validate email hợp lệ
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!newEmail || !emailPattern.test(newEmail)) {
      console.log('Invalid email:', newEmail);  // Log thêm: Nếu invalid
      alert('Please enter a valid email address.');
      return;
    }
    console.log('Valid email, sending PUT:', newEmail);  // Log thêm: Nếu valid
    try {
      const response = await fetch(`https://f2farena.com/api/users/${user.telegram_id}`, {  // Sửa user.id → user.telegram_id
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      });
      console.log('PUT response status:', response.status);  // Log thêm: Check ok/fail trước json
      if (!response.ok) {
        const errorData = await response.json();
        console.error('PUT failed, detail:', errorData);  // Log thêm: Nếu !ok, nhìn detail {detail: 'Not Found'}
        alert('Failed to update email. Please try again.');
        return;
      }
      const data = await response.json();
      console.log('PUT new email response:', data); // Log để nhìn rõ PUT thành công
      setUserEmail(newEmail); // Update state chỉ nếu ok
      alert('Email updated successfully!');
    } catch (error) {
      console.error('Error PUT email:', error);
      alert('Error updating email. Please check connection.');
    }
  };

  const renderContent = () => {
    console.log('renderContent called, userEmail:', userEmail);
    if (showDownloadStep) {
      return (
        <>
          <h4>Verify Account</h4>
          <p>Download the trading software (Desktop version) to verify your account. After downloading, log in with your account details. If successful, the system will confirm your registration.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              window.open('www.f2farena.com/tradingapp', '_blank', 'noopener,noreferrer');
              onClose();  // Thoát modal sau khi mở tab tải
            }}
            style={{ marginBottom: '1rem' }}
          >
            Download F2F Trading App
          </button>
        </>
      );
    }
    // Trường hợp 1: Chưa có tài khoản sàn
    if (!hasBrokerAccount) {
      console.log('No linked broker, showing input and register button, newAccount:', newAccount, 'brokerRegistrationUrl:', tournament.brokerRegistrationUrl);  // Log thêm brokerRegistrationUrl để confirm trước render
      return (
        <>
          <h4>Account Required</h4>
          <p>You need an account with <strong>{tournament.broker}</strong> to join this tournament.</p>
          <p style={{ marginBottom: '1rem' }}>
            Click <a href={tournament.brokerRegistrationUrl} target="_blank" rel="noopener,noreferrer" style={{ color: '#007bff' }}>here</a> to register on the broker's platform if you don't have an account yet.
          </p>
          <input
            type="text"
            value={newAccount.name_account || ''}  // Add fallback ''
            onChange={(e) => setNewAccount({ ...newAccount, name_account: e.target.value })}
            placeholder="Account Name"
            className="form-input"
            style={{ marginBottom: '1rem' }}  // Thêm margin để tách
          />
          <input
            type="text"
            value={newAccount.server_account || ''}  // Add fallback ''
            onChange={(e) => setNewAccount({ ...newAccount, server_account: e.target.value })}
            placeholder="Server"
            className="form-input"
            style={{ marginBottom: '1rem' }}  // Thêm margin để tách
          />
          <div className="confirmation-buttons">
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitNewAccount}>Submit Account</button>
          </div>
        </>
      );
    }

    // Trường hợp 2: Có tài khoản nhưng không đủ số dư
    if (hasBrokerAccount && !hasSufficientBalance) {
        return (
            <>
                <h4>Insufficient Balance</h4>
                <p>Your current balance is <strong>{currentBalance.toFixed(2)} USDT</strong>, but this tournament requires a minimum of <strong>{tournament.minBalanceRequired} USDT</strong>.</p>
                <p>Please deposit more funds to your wallet.</p>
                <div className="confirmation-buttons">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleGoToWallet}>Go to Wallet</button>
                </div>
            </>
        );
    }

      // Trường hợp 3: thiếu email
    if (!userEmail) {
      return (
        <>
          <h4>Email Required</h4>
          <p>Please provide your email to register.</p>
          <input
            type="email"
            value={newEmail || ''}  // Add fallback '' nếu undefined
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter your email"
            className="form-input"
          />
          <div className="confirmation-buttons">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmitNewEmail}>Submit Email</button>
          </div>
        </>
      );
    }

    // Trường hợp 4: Đủ điều kiện
    if (hasBrokerAccount && hasSufficientBalance) {
        return (
            <>
                <h4>Confirm Registration</h4>
                <p>You are eligible to join the <strong>{tournament.title}</strong>.</p>
                <div className="wallet-info-row" style={{padding: '0.5rem 0'}}>
                    <span className="label">Required Balance</span>
                    <span className="value">{tournament.minBalanceRequired} USDT</span>
                </div>
                <div className="wallet-info-row" style={{padding: '0.5rem 0'}}>
                    <span className="label">Your Current Balance</span>
                    <span className="value win">{currentBalance.toFixed(2)} USDT</span>
                </div>
                <p style={{marginTop: '1rem', color: 'var(--color-secondary-text)', fontSize: '0.9rem'}}>
                    By confirming, you agree to the tournament's terms and conditions.
                </p>
                <div className="confirmation-buttons">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-accent" onClick={handleConfirmRegistration}>Confirm</button>
                </div>
            </>
        );
    }

    return null; // Trường hợp mặc định
  };

  return (
      <>
          <div className="confirmation-overlay" onClick={onClose}></div>
          <div className="confirmation-modal card">
              {renderContent()}
          </div>
      </>
  );
};

const TournamentDetail = ({ user, walletData, onUserUpdate }) => {
  const { id } = useParams();

  useEffect(() => {  
    const fetchTournamentDetail = async () => {
      const cacheKey = `tournament_detail_${id}`;  // Key động theo id
      console.log(`Checking sessionStorage for ${cacheKey}`);  // Log: Kiểm tra trước khi fetch
      const cachedDetail = sessionStorage.getItem(cacheKey);
      if (cachedDetail) {
        console.log(`Using cached tournament detail for id ${id} from sessionStorage`);
        const parsedData = JSON.parse(cachedDetail);
        setTournament(parsedData);
        return;
      }
      try {
        const response = await fetch(`https://f2farena.com/api/tournaments/${id}`);
        console.log('Fetch detail response status:', response.status, 'OK:', response.ok); // Log mới: Check status (200 OK, 404 Not Found, etc.)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`); // Throw để vào catch nếu not OK
        }
        const data = await response.json();
        console.log('Fetched raw data:', data); // Log mới: Data raw từ backend trước mapping
        if (!data || !data.id) {
          console.warn('Data invalid or empty for id:', id); // Log mới: Nếu data null hoặc thiếu id
        }
        const tournamentData = {
          id: data.id,
          title: data.title,
          thumbnail: `https://f2farena.com/${data.thumbnail}`,
          date: '2025-06-21',
          author: 'PK Team',
          description: data.description,
          prizePool: data.prize_pool + ' USDT',
          participants: data.participants,
          symbol: data.symbol,
          startTime: data.event_time,
          broker_id: data.broker_id,
          broker: 'Go Markets',
          minBalanceRequired: 500,
          brokerRegistrationUrl: 'https://www.binance.com/en/register',
          results: [],
          images: []
        };
        console.log('Mapped tournamentData:', tournamentData); // Log mới: Sau mapping, check thumbnail prepend OK
        setTournament(tournamentData);
        sessionStorage.setItem(cacheKey, JSON.stringify(tournamentData));
      } catch (error) {
        console.error('Error fetching tournament detail:', error.message, error.stack); // Cũ + message/stack để chi tiết hơn (ví dụ "HTTP error! status: 404")
      }
    };

    fetchTournamentDetail();
  }, [id]);

  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [userEmail, setUserEmail] = useState(user ? user.email || '' : '');  // Thêm check user not null trước .email
  useEffect(() => {
    const cachedUser = sessionStorage.getItem('user_data');
    if (cachedUser) {
      const parsedUser = JSON.parse(cachedUser);
      console.log('Loaded user from session in TournamentDetail:', parsedUser);  // Log để nhìn rõ data từ session
      setUserEmail(parsedUser.email || '');  // Đồng bộ email từ session
    }
  }, []);
  const [accountInfo, setAccountInfo] = useState(null);
  const [newAccount, setNewAccount] = useState({ name_account: '', server_account: '' });
  const [newEmail, setNewEmail] = useState('');

  const checkAccountAndEmail = async () => {
    if (!user.email) {
      console.log('User email missing, require input'); // Log để nhìn rõ vấn đề thiếu email
      return; // Sẽ show input trong modal
    }
    console.log('Before checkAccountAndEmail GET, linkedBrokers:', user.linkedBrokers);  // Log để xem check session trước GET, confirm nếu không sync
    try {
      const response = await fetch(`https://f2farena.com/api/accounts/?user_id=${user.telegram_id}&broker_id=${tournament.broker_id}`);
      const data = await response.json();
      console.log('Fetched account data:', data); // Log để nhìn rõ API response trước khi set
      if (data.length > 0) {
        setAccountInfo(data[0]); // Lấy account đầu tiên nếu có
      } else {
        console.log('No account found for user_id and broker_id'); // Log nếu thiếu
      }
    } catch (error) {
      console.error('Error fetching account:', error);
    }
  };

  if (!tournament) {
    return (
      <div className="page-padding detail-page-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  const isTournamentEnded = new Date(tournament.startTime) < new Date();

  if (!user || !walletData) {
    console.log('User or walletData null in TournamentDetail, user from prop/session:', user);  // Thêm log: Nhìn user null
    return <div className="page-padding">Loading user data...</div>;
  }

  return (
    <div className="detail-page-container">
      <div style={{ position: 'relative' }}>
        <img
          src={tournament.thumbnail}
          alt={tournament.title}
          className="detail-page-banner"
          loading="lazy"
          onError={(e) => {
            console.error(`Failed to load image: ${tournament.thumbnail}`);
            e.target.src = 'https://placehold.co/500x220?text=Image+Not+Found';
          }}
          onLoad={(e) => console.log(`TournamentDetail image loaded: ${tournament.thumbnail}, size: ${e.target.naturalWidth}x${e.target.naturalHeight}`)}
        />
        <button
          className="icon-button detail-back-button"
          onClick={() => navigate('/arena')}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="page-padding">
        <h1 className="detail-page-title">{tournament.title}</h1>
        <p className="detail-page-meta">
          By {tournament.author} - {tournament.date}
        </p>

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

        <div
          className="detail-page-content"
          dangerouslySetInnerHTML={{ __html: tournament.description }}
        />

        {isTournamentEnded && tournament.results.length > 0 && (
          <div className="card">
            <h2 className="section-title">Tournament Results</h2>
            <div className="leaderboard-table">
              <div className="leaderboard-header">
                <div>Rank</div>
                <div>Player</div>
                <div className="text-center">Score</div>
                <div className="text-right">Reward</div>
              </div>
              {tournament.results.map((result) => (
                <div
                  key={result.rank}
                  className={`leaderboard-row ${result.rank === 1 ? 'top-rank' : ''}`}
                >
                  <div className="leaderboard-rank">{result.rank}</div>
                  <div className="trader-info">
                    <span>{result.name}</span>
                  </div>
                  <div className="text-center">{result.score}</div>
                  <div className="text-right">{result.reward}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isTournamentEnded && (
        <footer className="detail-page-footer">
          <button 
            className="btn btn-accent" 
            style={{ width: '90%', maxWidth: '400px' }}
            onClick={async () => {
              await checkAccountAndEmail();
              setShowRegisterModal(true);
            }}
          >
            Register Now
          </button>
        </footer>
      )}

      {showRegisterModal && (
        <RegistrationModal
            tournament={tournament}
            user={user}
            walletData={walletData}
            onClose={() => setShowRegisterModal(false)}
            navigate={navigate}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            newEmail={newEmail}
            setNewEmail={setNewEmail}
            accountInfo={accountInfo}  
            setAccountInfo={setAccountInfo}
            newAccount={newAccount}
            setNewAccount={setNewAccount}
            onUserUpdate={onUserUpdate}
        />
      )}
    </div>
  );
};

export default TournamentDetail;