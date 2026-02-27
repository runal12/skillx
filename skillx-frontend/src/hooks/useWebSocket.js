import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const useWebSocket = (userId) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  const connect = () => {
    try {
      const wsUrl = `ws://127.0.0.1:8000/ws/chat/${userId}/`;
      console.log('Connecting to WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setSocket(ws);
        
        // Clear any pending reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          // Handle different message types
          switch (data.type) {
            case 'new_message':
              // Dispatch custom event or use callback
              window.dispatchEvent(new CustomEvent('newMessage', { detail: data.payload }));
              break;
              
            case 'message_read':
              window.dispatchEvent(new CustomEvent('messageRead', { detail: data.payload }));
              break;
              
            case 'typing':
              window.dispatchEvent(new CustomEvent('userTyping', { detail: data.payload }));
              break;
              
            case 'user_online':
              window.dispatchEvent(new CustomEvent('userOnline', { detail: data.payload }));
              break;
              
            case 'user_offline':
              window.dispatchEvent(new CustomEvent('userOffline', { detail: data.payload }));
              break;
              
            case 'friend_request':
              window.dispatchEvent(new CustomEvent('friendRequest', { detail: data.payload }));
              break;
              
            case 'friend_accepted':
              window.dispatchEvent(new CustomEvent('friendAccepted', { detail: data.payload }));
              break;
              
            case 'friend_rejected':
              window.dispatchEvent(new CustomEvent('friendRejected', { detail: data.payload }));
              break;
          }
          
          setLastMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setSocket(null);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000) {
          attemptReconnect();
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setSocket(null);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const attemptReconnect = () => {
    if (reconnectTimeoutRef.current) {
      return; // Already attempting to reconnect
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      connect();
    }, reconnectDelay);
  };

  const disconnect = () => {
    if (socket) {
      socket.close(1000); // Normal closure
      setSocket(null);
      setIsConnected(false);
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const sendMessage = (message) => {
    if (socket && isConnected) {
      try {
        socket.send(JSON.stringify(message));
        console.log('WebSocket message sent:', message);
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket not connected');
    }
  };

  // Auto-connect when userId changes
  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [userId]);

  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    disconnect
  };
};

export default useWebSocket;
