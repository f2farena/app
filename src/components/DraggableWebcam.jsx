import React, { useState, useEffect, useRef } from 'react';
import './DraggableWebcam.css';

// --- Icons SVG ---
const MicOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5m-6 1.5v-1.5m-6-6.75v4.5m6-4.5v4.5m6-4.5v4.5M12 19.5v-4.5m-6-6.75v-1.5a6 6 0 1 1 12 0v1.5" /></svg>;
const MicOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l-2.25 2.25M19.5 12l2.25-2.25M12.75 15v6.75h2.25v-6.75h-2.25Zm-4.5 0v6.75h2.25v-6.75h-2.25Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 7.5v-1.5m-6 1.5V6.75A2.25 2.25 0 0 1 12 4.5h.008c1.241 0 2.242 1.002 2.242 2.25v1.5M12 18.75a6 6 0 0 0-6-6v-1.5c0-1.248 1.002-2.25 2.242-2.25h.008a2.25 2.25 0 0 1 2.25 2.25v1.5" /></svg>;
const CamOnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" d="M15.75 10.5l4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>;
const CamOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5-4.72-4.72a.75.75 0 0 0-1.28.53v11.38a.75.75 0 0 0 1.28.53l4.72-4.72M12 18.75H4.5a2.25 2.25 0 0 1-2.25-2.25V7.5A2.25 2.25 0 0 1 4.5 5.25h7.5A2.25 2.25 0 0 1 14.25 7.5v1.5M16.5 13.5L21 9m0 9-4.5-4.5" /></svg>;
const CollapseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>;
const ExpandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{transform: 'rotate(180deg)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" /></svg>;


const DraggableWebcam = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    const [isDragging, setIsDragging] = useState(false);
    // position ban đầu là null, nghĩa là sẽ dùng vị trí mặc định trong CSS
    const [position, setPosition] = useState(null); 
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragNode = useRef(null);

    const handleDragStart = (e) => {
        if (e.target.closest('button')) return;

        const node = dragNode.current;
        if (!node) return;
        
        const eventX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const eventY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        // Nếu chưa kéo lần nào, lấy vị trí hiện tại từ getBoundingClientRect
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
        
        // Cập nhật state position, lúc này style inline sẽ được áp dụng
        setPosition({
            x: eventX - dragOffset.current.x,
            y: eventY - dragOffset.current.y
        });
    };

    const handleDragEnd = () => setIsDragging(false);

    useEffect(() => { /* ... giữ nguyên logic event listener ... */ }, [isDragging]);

    const handleToggleCollapse = () => {
        // Mỗi lần thu/mở, reset vị trí về mặc định (dùng CSS)
        setPosition(null);
        setIsCollapsed(!isCollapsed);
    };

    // Tạo style object: nếu đã có position từ state (sau khi kéo) thì dùng nó, nếu không thì dùng object rỗng (để CSS class quyết định)
    const style = position ? { top: `${position.y}px`, left: `${position.x}px` } : {};


    if (isCollapsed) {
        return (
            <div
                ref={dragNode}
                className="webcam-collapsed-button"
                style={style} // Áp dụng style vị trí
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onClick={handleToggleCollapse}
            >
                <ExpandIcon />
            </div>
        );
    }
    
    return (
        <div
            ref={dragNode}
            className="webcam-container"
            style={style} // Áp dụng style vị trí
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
        >
            <div className="webcam-header">
                <span>Your Camera</span>
            </div>
            <div className="webcam-video-placeholder">
                {isCamOn ? <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZAQvPe0jIE2OCqYg9ezRtpo1xf5u8qGJ1ZQ&s" alt="Webcam Feed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>Webcam is OFF</span>}
            </div>
            <div className="webcam-controls">
                <button className={`webcam-button ${isCamOn ? 'on' : 'off'}`} onClick={() => setIsCamOn(!isCamOn)}>
                    {isCamOn ? <CamOnIcon /> : <CamOffIcon />}
                </button>
                <button className={`webcam-button ${isMicOn ? 'on' : 'off'}`} onClick={() => setIsMicOn(!isMicOn)}>
                    {isMicOn ? <MicOnIcon /> : <MicOffIcon />}
                </button>
                <button className="webcam-button neutral" onClick={handleToggleCollapse}>
                    <CollapseIcon />
                </button>
            </div>
        </div>
    );
};

export default DraggableWebcam;