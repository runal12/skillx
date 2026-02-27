import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionId, setConnectionId] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}/`);
      setUser(response.data);
      
      // Check if already connected
      if (currentUser && currentUser.id !== parseInt(userId)) {
        const connectionsResponse = await api.get('/my-connections/');
        const connection = connectionsResponse.data.find(conn => 
          (conn.sender_id === currentUser.id && conn.receiver_id === parseInt(userId)) ||
          (conn.receiver_id === currentUser.id && conn.sender_id === parseInt(userId))
        );
        
        if (connection) {
          setIsConnected(true);
          setConnectionId(connection.id);
        }
      }
    } catch (err) {
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [userId, currentUser]);

  const handleSendRequest = async () => {
    try {
      await api.post('/send-request/', { receiver_id: userId });
      setIsRequestSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request');
    }
  };

  const handleRemoveConnection = async () => {
    if (!window.confirm('Are you sure you want to remove this connection?')) return;
    
    try {
      await api.delete(`/connections/${connectionId}/`);
      setIsConnected(false);
      setConnectionId(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove connection');
    }
  };

  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!user) return <div className="text-center py-8">User not found</div>;

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
            {!isOwnProfile && isConnected && (
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                  Friend
                </span>
              </div>
            )}
          </div>
          {!isOwnProfile && (
            <div className="flex gap-2">
              {isConnected ? (
                <>
                  <button
                    onClick={handleRemoveConnection}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Remove Connection
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium cursor-not-allowed"
                    disabled
                  >
                    Friend
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSendRequest}
                  disabled={isRequestSent}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isRequestSent
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isRequestSent ? 'Request Sent' : 'Send Connection Request'}
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700">
                {user.bio || 'No bio available'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills I Have</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills_have ? (
                  user.skills_have.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No skills listed</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills I Want</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills_want ? (
                  user.skills_want.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No skills listed</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">Recently</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills offered:</span>
                  <span className="font-medium">
                    {user.skills_have ? user.skills_have.split(',').length : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills seeking:</span>
                  <span className="font-medium">
                    {user.skills_want ? user.skills_want.split(',').length : 0}
                  </span>
                </div>
              </div>
            </div>
      </div>
    </div>
  );
};

export default UserProfile;
