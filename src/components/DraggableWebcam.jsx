import React, { useState, useEffect, useRef } from 'react';
import './DraggableWebcam.css';

// --- Icons SVG ---
const MicOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5m-6 1.5v-1.5m-6-6.75v4.5m6-4.5v4.5m6-4.5v4.5M12 19.5v-4.5m-6-6.75v-1.5a6 6 0 1 1 12 0v1.5" /></svg>;
const MicOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l-2.25 2.25M19.5 12l2.25-2.25M12.75 15v6.75h2.25v-6.75h-2.25Zm-4.5 0v6.75h2.25v-6.75h-2.25Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5m-6 1.5V6.75A2.25 2.25 0 0 1 12 4.5h.008c1.241 0 2.242 1.002 2.242 2.25v1.5M12 18.75a6 6 0 0 0-6-6v-1.5c0-1.248 1.002-2.25 2.242-2.25h.008a2.25 2.25 0 0 1 2.25 2.25v1.5" /></svg>;
const CamOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>;
const CamOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5-4.72-4.72a.75.75 0 0 0-1.28.53v11.38a.75.75 0 0 0 1.28.53l4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V7.5A2.25 2.25 0 0 1 4.5 5.25h7.5A2.25 2.25 0 0 1 14.25 7.5v1.5M16.5 13.5L21 9m0 9-4.5-4.5" /></svg>;
const CollapseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>;
const ExpandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{transform: 'rotate(180deg)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>;

const DraggableWebcam = ({ stream, isMuted, displayName, onToggleCam, onToggleMic, isRemote = false }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const videoRef = useRef(null);
    const dragNode = useRef(null);
    const [position, setPosition] = useState(isRemote ? { x: 10, y: 150 } : null); // Remote cam có vị trí cố định ban đầu
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const handleDragStart = (e) => {
        if (isRemote || e.target.closest('button')) return;
        const node = dragNode.current;
        if (!node) return;
        const eventX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const eventY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        const rect = node.getBoundingClientRect();
        dragOffset.current.x = eventX - rect.left;
        dragOffset.current.y = eventY - rect.top;
        setIsDragging(true);
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const eventX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const eventY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        setPosition({
            x: eventX - dragOffset.current.x,
            y: eventY - dragOffset.current.y
        });
    };

    const handleDragEnd = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleDragMove, { passive: false });
            document.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging]);

    const handleToggleCollapse = () => setIsCollapsed(!isCollapsed);
    const handleToggleCam = () => {
        const newState = !isCamOn;
        setIsCamOn(newState);
        onToggleCam?.(newState);
    };
    const handleToggleMic = () => {
        const newState = !isMicOn;
        setIsMicOn(newState);
        onToggleMic?.(newState);
    };

    const style = position ? { top: `${position.y}px`, left: `${position.x}px`, right: 'auto', bottom: 'auto' } : {};

    if (isCollapsed && !isRemote) {
        return <div ref={dragNode} className="webcam-collapsed-button" style={style} onMouseDown={handleDragStart} onTouchStart={handleDragStart} onClick={handleToggleCollapse}><ExpandIcon /></div>;
    }

    return (
        <div ref={dragNode} className={`webcam-container ${isRemote ? 'remote' : 'local'}`} style={style} onMouseDown={handleDragStart} onTouchStart={handleDragStart}>
            <div className="webcam-header"><span>{displayName}</span></div>
            <div className="webcam-video-placeholder">
                <video ref={videoRef} autoPlay playsInline muted={isMuted}></video>
                {!isCamOn && !isRemote && <div className="cam-off-overlay">Cam Off</div>}
            </div>
            {!isRemote && (
                <div className="webcam-controls">
                    <button className={`webcam-button ${isCamOn ? 'on' : 'off'}`} onClick={handleToggleCam}>{isCamOn ? <CamOnIcon /> : <CamOffIcon />}</button>
                    <button className={`webcam-button ${isMicOn ? 'on' : 'off'}`} onClick={handleToggleMic}>{isMicOn ? <MicOnIcon /> : <MicOffIcon />}</button>
                    <button className="webcam-button neutral" onClick={handleToggleCollapse}><CollapseIcon /></button>
                </div>
            )}
        </div>
    );
};

export default DraggableWebcam;