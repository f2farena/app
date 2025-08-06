import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ user, children }) => {
    const wsRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();

    const connectWebSocket = useCallback(() => {
        if (!user || !user.telegram_id || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
            return;
        }

        const wsUrl = `wss://f2farena.com/ws/${user.telegram_id}`;
        console.log(`[WebSocketProvider] Attempting to connect to ${wsUrl}`);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('[WebSocketProvider] Connected successfully.');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            console.log('[WebSocketProvider] Message received:', event.data);
            try {
                // Logic xử lý tin nhắn dạng string cũ
                if (event.data.startsWith("MATCH_STARTED:")) {
                    const matchId = event.data.split(":")[1];
                    // Thay vì alert, ta tạo custom event để component khác có thể bắt và xử lý linh hoạt
                    window.dispatchEvent(new CustomEvent('match-started', { detail: { matchId } }));
                    return;
                }
                
                // Logic cho tin nhắn JSON
                const message = JSON.parse(event.data);
                // Bắn sự kiện chung cho toàn app
                window.dispatchEvent(new CustomEvent('websocket-message', { detail: message }));
            } catch (e) {
                console.error("[WebSocketProvider] Failed to handle message:", e, event.data);
            }
        };

        ws.onclose = () => {
            console.log('[WebSocketProvider] Disconnected.');
            setIsConnected(false);
            // Tự động kết nối lại sau 5 giây
            setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
            console.error('[WebSocketProvider] Error:', error);
            ws.close(); // Kích hoạt onclose để retry
        };

        wsRef.current = ws;

    }, [user, navigate]);

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (wsRef.current) {
                console.log('[WebSocketProvider] Cleaning up connection.');
                wsRef.current.onclose = null; // Ngăn retry khi component unmount
                wsRef.current.close();
            }
        };
    }, [connectWebSocket]);

    const sendMessage = useCallback((message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        }
        console.error("[WebSocketProvider] Cannot send message, WebSocket is not open.");
        return false;
    }, []);

    const value = { sendMessage, isConnected };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};