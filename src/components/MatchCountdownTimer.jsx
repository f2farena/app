// src/components/MatchCCountdownTimer.jsx
import React, { useState, useEffect } from 'react';

// Ghi chú: Đây là component dùng chung, đã được cải tiến để ổn định hơn
const MatchCountdownTimer = ({ startTime, durationMinutes }) => {
    const calculateInitialSeconds = () => {
        if (!startTime || typeof durationMinutes !== 'number') {
            return null; // Trả về null để hiển thị 'Waiting...'
        }
        const endTime = new Date(startTime).getTime() + durationMinutes * 60 * 1000;
        const now = new Date().getTime();
        const remainingMilliseconds = endTime - now;
        return remainingMilliseconds > 0 ? Math.floor(remainingMilliseconds / 1000) : 0;
    };

    const [secondsLeft, setSecondsLeft] = useState(calculateInitialSeconds);

    useEffect(() => {
        // Chỉ chạy interval khi secondsLeft là một số và lớn hơn 0
        if (typeof secondsLeft !== 'number' || secondsLeft <= 0) {
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft]);

    if (typeof secondsLeft !== 'number') {
        return <div className="time-remaining">Waiting...</div>;
    }

    const hours = Math.floor(secondsLeft / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');

    return <div className="time-remaining">{`${hours}:${minutes}:${seconds}`}</div>;
};

export default MatchCountdownTimer;