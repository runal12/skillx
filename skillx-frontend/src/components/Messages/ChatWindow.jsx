import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ChatWindow = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch messages from API instead of localStorage
      const response = await api.get('/conversations/');
      const conversations = response.data;
      
      // Find the conversation with the current user
      const conversation = conversations.find(conv => conv.other_user_id === parseInt(userId));
      
      if (conversation) {
        // Sort messages chronologically (oldest first, newest last)
        const sortedMessages = [...(conversation.messages || [])].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
      } else {
        setMessages([]);
      }
      
      // Fetch user info
      await fetchUserInfo();
      
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await api.get(`/users/${userId}/`);
      setOtherUser(response.data);
    } catch (err) {
      // If API fails, use mock data
      setOtherUser({
        id: parseInt(userId),
        username: `User ${userId}`,
        email: `user${userId}@example.com`,
        skills_have: 'JavaScript, React',
        skills_want: 'Python, Django'
      });
    }
  }, [userId]);

  const markMessagesAsRead = useCallback(async () => {
    try {
      await api.post(`/mark-messages-read/${userId}/`);
      console.log('Messages marked as read');
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
      // Don't show error to user, just log it
    }
  }, [userId]);

  useEffect(() => {
    fetchMessages();
    fetchUserInfo();
    markMessagesAsRead();
  }, [userId, fetchMessages, fetchUserInfo, markMessagesAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const response = await api.post('/send-message/', {
        receiver_id: parseInt(userId),
        content: newMessage
      });
      
      // Add message to local state with proper timestamp
      const messageData = {
        id: Date.now(), // Use timestamp as ID
        sender_id: user.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        is_from_me: true
      };

      // Insert message in chronological order
      const updatedMessages = [...messages, messageData].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      setMessages(updatedMessages);
      setNewMessage('');
      
      // Scroll to bottom after sending
      setTimeout(scrollToBottom, 100);

    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!user) return;
    
    try {
      await api.delete(`/delete-message/${messageId}/`);
      
      // Remove message from local state and maintain order
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message');
    }
  };

  const handleDeleteConversation = async () => {
    if (!user || !window.confirm('Are you sure you want to delete this entire conversation?')) return;
    
    try {
      await api.delete(`/delete-conversation/${userId}/`);
      setMessages([]);
      
      // Navigate back to messages list
      navigate('/messages');
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation');
    }
  };

  if (loading) return <div className="text-center py-8">Loading conversation...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 h-screen flex flex-col">
      <div className="bg-white rounded-t-lg shadow-md p-4 border-b">
        <div className="flex items-center justify-between">
          {otherUser && (
            <>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {otherUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{otherUser.username}</h3>
                  <p className="text-xs text-gray-500">Active now</p>
                </div>
              </div>
              <button
                onClick={handleDeleteConversation}
                className="p-2 text-gray-500 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            const isMyLastMessage = isLastMessage && message.is_from_me;
            
            return (
            <div
              key={message.id}
              className={`mb-4 flex ${message.is_from_me ? 'justify-end' : 'justify-start'}`}
            >
              {!message.is_from_me && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0">
                  {otherUser?.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.is_from_me
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-900 border rounded-bl-none'
              }`}>
                <p className="text-sm break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.is_from_me ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {isMyLastMessage && message.is_read && (
                  <p className="text-xs mt-1 text-blue-100 italic">Seen</p>
                )}
              </div>
              
              {message.is_from_me && (
                <div className="flex items-start ml-2">
                  <button
                    onClick={() => handleDeleteMessage(message.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="bg-white rounded-b-lg shadow-md p-4 border-t">
        <div className="flex items-center space-x-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 0l6.414-6.586a2 2 0 00-2.828 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10l4.553 2.276A1 1 0 0010 13.382V8.618a1 1 0 00-.447-.764L5 6m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..."
              className="w-full px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
