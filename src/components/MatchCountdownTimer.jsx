// src/components/MatchCCountdownTimer.jsx
import React, { useState, useEffect } from 'react';

// Ghi chú: Đây là component dùng chung, đã được cải tiến để ổn định hơn
const MatchCountdownTimer = ({ startTime, durationMinutes, onTimerEnd }) => {
    const calculateSecondsLeft = () => { // Đổi tên cho rõ ràng
        if (!startTime || typeof durationMinutes !== 'number') {
            return null;
        }
        const endTime = new Date(startTime).getTime() + durationMinutes * 60 * 1000;
        const now = new Date().getTime();
        const remainingMilliseconds = endTime - now;
        return remainingMilliseconds > 0 ? Math.floor(remainingMilliseconds / 1000) : 0;
    };

    const [secondsLeft, setSecondsLeft] = useState(calculateSecondsLeft);

    // ✅ THÊM LẠI useEffect NÀY ĐỂ ĐẢM BẢO TIMER LUÔN CẬP NHẬT
    useEffect(() => {
        setSecondsLeft(calculateSecondsLeft());
    }, [startTime, durationMinutes]);

    useEffect(() => {
        if (secondsLeft === 0 && onTimerEnd) {
            onTimerEnd();
        }
        if (typeof secondsLeft !== 'number' || secondsLeft <= 0) {
            return;
        }
        const interval = setInterval(() => {
            setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft, onTimerEnd]);

    if (typeof secondsLeft !== 'number') {
        return <div className="time-remaining">Waiting...</div>;
    }

    const hours = Math.floor(secondsLeft / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((secondsLeft % 3600) / 60).toString().padStart(2, '0');
    const seconds = (secondsLeft % 60).toString().padStart(2, '0');

    return <div className="time-remaining">{`${hours}:${minutes}:${seconds}`}</div>;
};

export default MatchCountdownTimer;