import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch both all users and current connections
      const [usersResponse, connectionsResponse] = await Promise.all([
        api.get('/users/'),
        api.get('/my-connections/')
      ]);
      
      // Get connected user IDs
      const connectedUserIds = new Set();
      connectionsResponse.data.forEach(conn => {
        // Add both the requester and addressee to connected users
        if (conn.sender_id !== user?.id) {
          connectedUserIds.add(conn.sender_id);
        }
        if (conn.receiver_id !== user?.id) {
          connectedUserIds.add(conn.receiver_id);
        }
      });
      
      // Filter out logged-in user and already connected users from discover list
      const filteredUsers = usersResponse.data.filter(u => 
        u.id !== user?.id && !connectedUserIds.has(u.id)
      );
      
      setUsers(filteredUsers);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSendRequest = async (userId) => {
    try {
      await api.post('/send-request/', { receiver_id: userId });
      setSentRequests(prev => new Set([...prev, userId]));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleMessage = (user) => {
    navigate(`/messages/${user.id}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading amazing people...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-lg mb-4">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Amazing People
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with talented individuals and expand your skill network
          </p>
        </div>

        {/* Users Grid */}
        {users.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-white rounded-full">
              <span className="text-6xl">🌟</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-700">
              No users found yet
            </h3>
            <p className="text-gray-600 mt-2">
              Be the first to join and start connecting!
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {users.map(user => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* User Header */}
                <div className="relative h-20 bg-gradient-to-r from-blue-500 to-purple-600 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-lg font-bold text-blue-600 shadow-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-2">
                        <h3 className="text-base font-bold text-white">{user.username}</h3>
                        <p className="text-blue-100 text-xs">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => navigate(`/users/${user.id}`)}
                        className="p-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                        title="View Profile"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 003-3v2a3 3 0 00-3 3v2a3 3 0 00-3-3h-4l-4 4v6h4a2 2 0 002-2V7a2 2 0 002-2H7a2 2 0 002-2V5a2 2 0 002-2h4l-4-4V7a2 2 0 002-2h4l4-4z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMessage(user)}
                        className="p-1.5 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                        title="Send Message"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 1.664-1.344 3-3 3-3s3 1.344 3 3c0 1.104.896 2-2 2h8c1.104 0 2 .896 2 2 2s.896-2 2-2h8c-1.104 0-2-.896-2-2-2 2-2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* User Body */}
                <div className="p-4">
                  {/* Skills Section */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-green-600 font-bold text-xs">💪</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Skills I Have</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.skills_have ? (
                        user.skills_have.split(',').map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic text-xs">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Looking For Section */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-orange-600 font-bold text-xs">🎯</span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">Looking For</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {user.skills_want ? (
                        user.skills_want.split(',').map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic text-xs">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-purple-600 font-bold text-xs">📝</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm">About</h4>
                      </div>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm">
                        {user.bio.length > 50 ? `${user.bio.substring(0, 50)}...` : user.bio}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/users/${user.id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleSendRequest(user.id)}
                      disabled={sentRequests.has(user.id)}
                      className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                        sentRequests.has(user.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {sentRequests.has(user.id) ? 'Request Sent' : 'Connect'}
                    </button>
                    <button
                      onClick={() => handleMessage(user)}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
