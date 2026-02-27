import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

// Simple encryption functions for demo purposes
const encryptMessage = (message, key) => {
  // Simple XOR encryption for demo (in production, use proper encryption)
  let encrypted = '';
  for (let i = 0; i < message.length; i++) {
    encrypted += String.fromCharCode(message.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(encrypted);
};

const decryptMessage = (encryptedMessage, key) => {
  try {
    const encrypted = atob(encryptedMessage);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return decrypted;
  } catch (error) {
    return '[Decryption Error]';
  }
};

const MessageList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('MessageList useEffect triggered, user:', user);
    if (user) {
      console.log('User is authenticated, fetching conversations...');
      const fetchConversations = async () => {
        try {
          console.log('Fetching conversations from API...');
          // Fetch real conversations for logged-in user
          const response = await api.get('/conversations/');
          console.log('API response:', response);
          
          // Use conversations directly without decryption since they're not encrypted
          const conversationsData = response.data.map(conv => ({
            ...conv,
            messages: conv.messages.map(msg => ({
              ...msg,
              // Keep content as-is since it's not encrypted
              content: msg.content
            }))
          }));
          
          setConversations(conversationsData);
          
        } catch (err) {
          console.error('Failed to fetch conversations:', err);
          setError('Failed to fetch conversations');
        } finally {
          setLoading(false);
        }
      };
      
      fetchConversations();
    } else {
      console.log('User is not authenticated');
      setLoading(false);
    }
  }, [user]);

  const openConversation = (userId) => {
    navigate(`/messages/${userId}`);
  };

  const refreshConversations = async () => {
    try {
      const response = await api.get('/conversations/');
      const conversationsData = response.data.map(conv => ({
        ...conv,
        messages: conv.messages.map(msg => ({
          ...msg,
          content: msg.content
        }))
      }));
      setConversations(conversationsData);
    } catch (err) {
      console.error('Failed to refresh conversations:', err);
    }
  };

  // Refresh conversations when component gets focus (when returning from chat)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        refreshConversations();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        refreshConversations();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const handleDeleteConversation = async (e, userId, username) => {
    e.stopPropagation(); // Prevent opening conversation when clicking delete
    
    if (!window.confirm(`Are you sure you want to delete the conversation with ${username}?`)) return;
    
    try {
      await api.delete(`/delete-conversation/${userId}/`);
      
      // Update local state
      setConversations(prev => prev.filter(conv => conv.other_user_id !== userId));
      
      // Update localStorage
      const storedConversations = JSON.parse(localStorage.getItem(`conversations_${user.id}`) || '[]');
      const updatedConversations = storedConversations.filter(conv => conv.other_user_id !== userId);
      localStorage.setItem(`conversations_${user.id}`, JSON.stringify(updatedConversations));
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      setError('Failed to delete conversation');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading your conversations...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-lg mb-4">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Please log in to view messages</h3>
        <p className="text-gray-600">You need to be authenticated to access your conversations.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Messages
          </h1>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-gray-600">End-to-End Encrypted</p>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure conversations with {conversations.length} connection{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-white rounded-full">
              <span className="text-6xl">💬</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-700">
              No encrypted conversations yet
            </h3>
            <p className="text-gray-600 mt-2">
              Start connecting with people to begin secure messaging!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conversation => {
              // Determine the other user in this conversation
              const otherUserId = conversation.other_user_id;
              const otherUsername = conversation.other_user_username;
              const otherUserSkills = conversation.other_user_skills;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => openConversation(otherUserId)}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-center p-3">
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg mr-3">
                      {otherUsername?.charAt(0).toUpperCase() || '?'}
                    </div>
                    
                    {/* Conversation Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 text-sm">{otherUsername}</h3>
                          {conversation.unread_count > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-medium">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(conversation.last_message_timestamp)}
                          </span>
                          <button
                            onClick={(e) => handleDeleteConversation(e, otherUserId, otherUsername)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                      {/* Skills Preview */}
                      <div className="flex items-center mt-1">
                        <div className="flex flex-wrap gap-1">
                          {otherUserSkills ? (
                            otherUserSkills.split(',').slice(0, 2).map((skill, index) => (
                              <span
                                key={index}
                                className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                              >
                                {skill.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 italic text-xs">No skills</span>
                          )}
                          {otherUserSkills && otherUserSkills.split(',').length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              +{otherUserSkills.split(',').length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrow Indicator */}
                    <div className="ml-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
