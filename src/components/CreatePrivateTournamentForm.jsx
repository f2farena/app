// src/components/CreatePrivateTournamentForm.jsx
import React, { useState, useEffect } from 'react';
import './CreatePrivateTournamentForm.css'; // BƯỚC 1: Import file CSS mới

// Component Form tạo giải đấu Private Cup
const CreatePrivateTournamentForm = ({ user, onClose, onCreationSuccess }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const isStep1Valid = () => {
        return details.title.trim() !== '' &&
               details.broker_id !== '' &&
               details.max_participants.toString().trim() !== '' &&
               details.event_time.trim() !== '' &&
               details.end_time.trim() !== '';
    };

    const isStep2Valid = () => {
        return rounds.every(round => 
            round.name.trim() !== '' &&
            round.advancement_count.toString().trim() !== ''
        );
    };

    // State cho Step 1: Thông tin chung
    const [details, setDetails] = useState({
        title: '',
        description: '',
        broker_id: '',
        symbol: 'XAUUSD',
        max_participants: '',
        event_time: '',
        end_time: '',
        registration_url: '',
        min_balance: '0',
    });

    // State cho Step 2: Các vòng đấu
    const [rounds, setRounds] = useState([
        {
            name: 'Round 1',
            duration_minutes: 15,
            competition_format: 'points',
            advancement_count: 8,
            matches_per_player: 4,
            volume_rule: 0.1,
            match_interval_minutes: 60,
            total_round_duration_minutes: 1440,
        }
    ]);

    // State cho Step 3: Cơ cấu giải thưởng
    const [prizeStructure, setPrizeStructure] = useState([
        { prize_type: 'top', rank: 1, name: 'First Place', prize: '100 USDT', quantity: 1 },
        { prize_type: 'top', rank: 2, name: 'Second Place', prize: '50 USDT', quantity: 1 },
        { prize_type: 'top', rank: 3, name: 'Third Place', prize: '25 USDT', quantity: 1 },
    ]);
    
    // State để lưu danh sách broker và dữ liệu đầy đủ
    const [brokersList, setBrokersList] = useState([]);
    const [fullBrokersData, setFullBrokersData] = useState({});
    const [estimatedRevenue, setEstimatedRevenue] = useState(0);

    // Hàm xử lý thay đổi input chung
    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
    };

    // BƯỚC 3: Thêm useEffect để tự động tính tổng Prize Pool
    useEffect(() => {
        const totalPrize = prizeStructure.reduce((total, prize) => {
            const prizeValue = parseFloat(prize.prize) || 0;
            const quantity = parseInt(prize.quantity, 10) || 0;
            return total + (prizeValue * quantity);
        }, 0);
        setDetails(prev => ({ ...prev, prize_pool: totalPrize }));
    }, [prizeStructure]); // Chạy lại mỗi khi cơ cấu giải thưởng thay đổi

    // Hook để fetch broker và tính toán doanh thu ước tính
    useEffect(() => {
        const fetchAndCalculate = async () => {
            let fetchedBrokers = fullBrokersData;
            if (Object.keys(fetchedBrokers).length === 0) {
                try {
                    const response = await fetch('https://f2farena.com/api/brokers/list');
                    if (!response.ok) throw new Error('Failed to fetch broker list');
                    const data = await response.json();
                    
                    if (!data || !Array.isArray(data.brokers)) {
                        throw new Error('Invalid broker data format.');
                    }
                    
                    const brokerMap = {};
                    data.brokers.forEach(b => { brokerMap[b.id] = b; });
                    setFullBrokersData(brokerMap);
                    setBrokersList(data.brokers.map(b => ({ id: b.id, name: b.broker_name })));
                    fetchedBrokers = brokerMap;

                    if (data.brokers.length > 0) {
                        setDetails(prev => ({ ...prev, broker_id: data.brokers[0].id }));
                    }
                } catch (error) {
                    console.error('Error fetching broker data:', error);
                    return;
                }
            }

            const { broker_id, max_participants } = details;

            // --- BẮT ĐẦU ĐẶT LOG KIỂM TRA ---
            console.groupCollapsed(`[Revenue Calculation] - ${new Date().toLocaleTimeString()}`);
            console.log("Input Data:", {
                broker_id,
                max_participants: max_participants || '<< Trống', // Hiển thị rõ nếu trống
                rounds_count: rounds.length,
                fullBrokersData_exists: Object.keys(fullBrokersData).length > 0,
            });
            // --- KẾT THÚC ĐẶT LOG KIỂM TRA ---
            
            if (!broker_id || !max_participants || rounds.length === 0 || !fetchedBrokers[broker_id]) {
                console.log("⚠️ Điều kiện tính toán không đủ. Đặt doanh thu về 0.");
                console.groupEnd();
                setEstimatedRevenue(0);
                return;
            }

            const selectedBrokerData = fetchedBrokers[broker_id];
            if (!selectedBrokerData || typeof selectedBrokerData.commission === 'undefined') {
                console.log("⚠️ Broker data or commission rate is not yet available. Skipping calculation.");
                console.groupEnd();
                setEstimatedRevenue(0);
                return;
            }

            const commissionRate = parseFloat(selectedBrokerData.commission || 0);
            let totalVolume = 0;
            let currentParticipants = parseInt(max_participants, 10);

            // --- ĐẶT LOG CHI TIẾT VÒNG LẶP (ĐÃ SỬA LỖI) ---
            console.log("Broker Commission Rate:", commissionRate);
            console.log("Initial Participants:", currentParticipants);
            
            rounds.forEach((round, index) => { // Sửa thành forEach để có 'index'
                const volumePerPlayer = parseFloat(round.volume_rule) || 0;
              const roundVolume = currentParticipants * volumePerPlayer; // Thêm biến bị thiếu
                totalVolume += roundVolume;

                console.log(`- Round ${index + 1}:`);
                console.log(`  - Participants: ${currentParticipants}`);
                console.log(`  - Volume Rule: ${volumePerPlayer}`);
                console.log(`  - Round Volume: ${roundVolume.toFixed(2)}`);
                console.log(`  - Total Volume So Far: ${totalVolume.toFixed(2)}`);
                
                let nextRoundParticipants; // Thêm biến bị thiếu
                if (round.competition_format === 'knockout') {
                    nextRoundParticipants = Math.floor(currentParticipants / 2);
                } else {
                    nextRoundParticipants = parseInt(round.advancement_count, 10) || 0;
                }
              currentParticipants = nextRoundParticipants; // Cập nhật số người chơi cho vòng sau
                console.log(`  - Next Round Participants: ${nextRoundParticipants}`);
            });

            const calculatedRevenue = totalVolume * commissionRate;
            // --- ĐẶT LOG KẾT QUẢ CUỐI CÙNG ---
            console.log("Final Calculated Volume:", totalVolume.toFixed(2));
            console.log("Final Estimated Revenue:", calculatedRevenue.toFixed(2));
            console.groupEnd();
            // --- KẾT THÚC LOG KẾT QUẢ ---
            setEstimatedRevenue(calculatedRevenue);
        };
        
        fetchAndCalculate();
        
    }, [details.broker_id, details.max_participants, rounds, fullBrokersData]);

    // === Logic quản lý Vòng đấu (Rounds) ===
    const handleRoundChange = (index, e) => {
        const { name, value } = e.target;
        const updatedRounds = [...rounds];
        updatedRounds[index][name] = value;
        setRounds(updatedRounds);
    };

    const addRound = () => {
        setRounds([...rounds, {
            name: `Round ${rounds.length + 1}`,
            duration_minutes: 15, competition_format: 'points',
            advancement_count: 4, matches_per_player: 2,
            volume_rule: 0.1, match_interval_minutes: 60,
            total_round_duration_minutes: 1440,
        }]);
    };

    const removeRound = (index) => {
        if (rounds.length > 1) {
            setRounds(rounds.filter((_, i) => i !== index));
        }
    };

    // === Logic quản lý Giải thưởng (Prizes) ===
    const handlePrizeChange = (index, e) => {
        const { name, value } = e.target;
        const updatedPrizes = [...prizeStructure];
        updatedPrizes[index][name] = value;
        setPrizeStructure(updatedPrizes);
    };

    const addPrize = () => {
        setPrizeStructure([...prizeStructure, { prize_type: 'consolation', rank: null, name: 'Consolation Prize', prize: '10 USDT', quantity: 1 }]);
    };
    
    const removePrize = (index) => {
        if (prizeStructure.length > 1) {
            setPrizeStructure(prizeStructure.filter((_, i) => i !== index));
        }
    };

    // === Logic điều hướng và Submit ===
    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!details.title || !details.max_participants || !details.event_time || !details.end_time) {
            setErrorMessage('Vui lòng điền đầy đủ các trường thông tin chung.');
            setStep(1);
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');

        const payload = {
            ...details,
            creator_id: user.telegram_id,
            broker_id: parseInt(details.broker_id, 10),
            prize_pool: parseFloat(details.prize_pool), // prize_pool đã được tính tự động
            max_participants: parseInt(details.max_participants, 10),
            rounds: rounds.map((round, index) => ({ ...round, round_number: index + 1, scheduling_timeframes: null })),
            prize_structure: prizeStructure,
        };

        try {
            const response = await fetch('https://f2farena.com/api/tournaments/private', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || 'Failed to create tournament.');
            }
            onCreationSuccess();
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="deposit-modal-wrapper" onClick={onClose}>
            <div className="deposit-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="form-header">
                    <h2>Create Your Private Cup</h2>
                    <button onClick={onClose} className="icon-button close-button" disabled={isSubmitting}>&times;</button>
                </div>
                
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                
                <div className={`form-steps-indicator ${step >= 2 ? 'step-2-active' : ''} ${step >= 3 ? 'step-3-active' : ''}`}>
                    <div className={`progress-step-item ${step >= 1 ? 'active' : ''}`}>
                        <span className="step-icon">📝</span>
                        <span className="step-label">Details</span>
                    </div>
                    <div className={`progress-step-item ${step >= 2 ? 'active' : ''}`}>
                        <span className="step-icon">⚔️</span>
                        <span className="step-label">Rounds</span>
                    </div>
                    <div className={`progress-step-item ${step >= 3 ? 'active' : ''}`}>
                        <span className="step-icon">🏆</span>
                        <span className="step-label">Prizes</span>
                    </div>
                </div>

                <div className="form-content">
                    {step === 1 && (
                        <div>
                            <div className="form-group"><label className="form-label">Title</label><input type="text" name="title" value={details.title} onChange={handleDetailChange} className="form-input" required /></div>
                            <div className="form-group"><label className="form-label">Description</label><textarea name="description" value={details.description} onChange={handleDetailChange} className="form-input" rows="3"></textarea></div>
                            <div className="form-group"><label className="form-label">Broker</label><select name="broker_id" value={details.broker_id} onChange={handleDetailChange} className="form-input" required>{brokersList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
                            <div className="form-group"><label className="form-label">Symbol</label><input type="text" name="symbol" value={details.symbol} onChange={handleDetailChange} className="form-input" required /></div>
                            <div className="form-group"><label className="form-label">Max Participants</label><input type="number" name="max_participants" value={details.max_participants} onChange={handleDetailChange} className="form-input" required /></div>
                            <div className="form-group"><label className="form-label">Start Time</label><input type="datetime-local" name="event_time" value={details.event_time} onChange={handleDetailChange} className="form-input" required /></div>
                            <div className="form-group"><label className="form-label">End Time</label><input type="datetime-local" name="end_time" value={details.end_time} onChange={handleDetailChange} className="form-input" required /></div>
                            <div className="form-group">
                                <label className="form-label">Minimum Balance (USDT)</label>
                                <input type="number" name="min_balance" value={details.min_balance} onChange={handleDetailChange} className="form-input" required />
                            </div>
                        </div>
                    )}
                    
                    {step === 2 && (
                        <div>
                            {rounds.map((round, index) => (
                                <div key={index} className="dynamic-form-item">
                                    <div className="dynamic-form-header">
                                        <h4>Round {index + 1}</h4>
                                        <button onClick={() => removeRound(index)} className="btn-remove" disabled={rounds.length <= 1}>&times;</button>
                                    </div>
                                    <div className="form-group"><label className="form-label">Name</label><input type="text" name="name" value={round.name} onChange={(e) => handleRoundChange(index, e)} className="form-input" /></div>
                                    <div className="form-group"><label className="form-label">Format</label><select name="competition_format" value={round.competition_format} onChange={(e) => handleRoundChange(index, e)} className="form-input"><option value="points">Points</option><option value="knockout">Knockout</option></select></div>
                                    <div className="form-group"><label className="form-label">Match Duration (min)</label><input type="number" name="duration_minutes" value={round.duration_minutes} onChange={(e) => handleRoundChange(index, e)} className="form-input" /></div>
                                    <div className="form-group"><label className="form-label">Players Advance</label><input type="number" name="advancement_count" value={round.advancement_count} onChange={(e) => handleRoundChange(index, e)} className="form-input" /></div>
                                    {round.competition_format === 'points' && <div className="form-group"><label className="form-label">Matches / Player</label><input type="number" name="matches_per_player" value={round.matches_per_player} onChange={(e) => handleRoundChange(index, e)} className="form-input" /></div>}
                                    <div className="form-group"><label className="form-label">Volume Rule</label><input type="number" name="volume_rule" value={round.volume_rule} onChange={(e) => handleRoundChange(index, e)} className="form-input" /></div>
                                    <div className="form-group">
                                        <label className="form-label">Total Round Duration (min)</label>
                                        <input type="number" name="total_round_duration_minutes" value={round.total_round_duration_minutes} onChange={(e) => handleRoundChange(index, e)} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Match Interval (min)</label>
                                        <input type="number" name="match_interval_minutes" value={round.match_interval_minutes} onChange={(e) => handleRoundChange(index, e)} className="form-input" />
                                    </div>
                                </div>
                            ))}
                            <button onClick={addRound} className="btn-add-more">+ Add Round</button>
                        </div>
                    )}

                    {step === 3 && (
                         <div>
                            {/* YÊU CẦU 3: Dời Estimated Revenue LÊN TRÊN CÙNG của Step 3 */}
                            <div className="form-group" style={{ marginBottom: '2rem', border: '1px solid var(--color-hover-bg)', padding: '1rem', borderRadius: '0.5rem' }}>
                                <label className="form-label" style={{ color: 'var(--color-text)' }}>Estimated Revenue (from Broker commission)</label>
                                <p className="form-input" style={{ backgroundColor: 'var(--color-input-bg)', border: '1px solid var(--color-hover-bg)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--color-success)', fontWeight: 'bold', margin: 0 }}>
                                    {estimatedRevenue.toFixed(2)} USDT
                                </p>
                                <small style={{ color: 'var(--color-secondary-text)', marginTop: '0.5rem', display: 'block' }}>
                                    This revenue is calculated based on Max Participants and Volume Rules. Use this as a reference to allocate your prizes below.
                                </small>
                            </div>
                             
                            {/* YÊU CẦU 3: Hiển thị Prize Pool được tính tự động, không cho nhập */}
                            <div className="form-group">
                                <label className="form-label" style={{ color: 'var(--color-text)' }}>Total Prize Pool (Calculated)</label>
                                <p className="form-input" style={{ backgroundColor: 'var(--color-input-bg)', border: '1px solid var(--color-hover-bg)', padding: '0.75rem', borderRadius: '0.5rem', color: 'var(--color-accent)', fontWeight: 'bold', margin: 0 }}>
                                    {details.prize_pool ? details.prize_pool.toFixed(2) : '0.00'} USDT
                                </p>
                            </div>

                            {prizeStructure.map((prize, index) => (
                                <div key={index} className="dynamic-form-item">
                                    <div className="dynamic-form-header">
                                        <h4>Prize {index + 1}</h4>
                                        <button onClick={() => removePrize(index)} className="btn-remove" disabled={prizeStructure.length <= 1}>&times;</button>
                                    </div>
                                    <div className="form-group"><label className="form-label">Type</label><select name="prize_type" value={prize.prize_type} onChange={(e) => handlePrizeChange(index, e)} className="form-input"><option value="top">Top</option><option value="consolation">Consolation</option></select></div>
                                    {prize.prize_type === 'top' && <div className="form-group"><label className="form-label">Rank</label><input type="number" name="rank" value={prize.rank || ''} onChange={(e) => handlePrizeChange(index, e)} className="form-input" /></div>}
                                    <div className="form-group"><label className="form-label">Name</label><input type="text" name="name" value={prize.name} onChange={(e) => handlePrizeChange(index, e)} className="form-input" /></div>
                                    <div className="form-group"><label className="form-label">Prize</label><input type="text" name="prize" value={prize.prize} onChange={(e) => handlePrizeChange(index, e)} className="form-input" placeholder="e.g., 100 USDT" /></div>
                                    <div className="form-group"><label className="form-label">Quantity</label><input type="number" name="quantity" value={prize.quantity} onChange={(e) => handlePrizeChange(index, e)} className="form-input" /></div>
                                </div>
                            ))}
                              <button onClick={addPrize} className="btn-add-more">+ Add Prize</button>
                         </div>
                    )}
                </div>

                <div className="form-navigation">
                    {/* YÊU CẦU 2: Dời nút Back qua trái */}
                    <div>
                        {step > 1 && <button className="btn btn-secondary" onClick={prevStep} disabled={isSubmitting}>Back</button>}
                    </div>

                    {/* YÊU CẦU 2: Dời nút Next/Create qua phải */}
                    <div className="nav-right">
                        {step === 1 && <button className="btn btn-primary" onClick={nextStep} disabled={!isStep1Valid()}>Next</button>}
                        {step === 2 && <button className="btn btn-primary" onClick={nextStep} disabled={!isStep2Valid()}>Next</button>}
                        {step === 3 && <button className="btn btn-accent" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Tournament'}</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreatePrivateTournamentForm;