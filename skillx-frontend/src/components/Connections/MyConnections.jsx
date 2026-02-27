import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MyConnections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/my-connections/');
      console.log('Fetched connections:', response.data);
      setConnections(response.data);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (connectionId, username) => {
    console.log('Removing connection:', { connectionId, username });
    if (window.confirm(`Are you sure you want to remove ${username} from your connections?`)) {
      try {
        console.log('Making API call to:', `/connections/${connectionId}/`);
        const response = await api.delete(`/connections/${connectionId}/`);
        console.log('API response:', response);
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      } catch (err) {
        console.error('Error removing connection:', err);
        console.error('Error response:', err.response);
        setError(err.response?.data?.error || 'Failed to remove connection');
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading connections...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Connections
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your network of skilled professionals
          </p>
        </div>
        
        {/* Connections List */}
        {connections.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-white rounded-full">
              <span className="text-6xl">🤝</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-700">
              No connections yet
            </h3>
            <p className="text-gray-600 mt-2">
              Start connecting with talented people in the Discover section!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {connections.map(connection => {
              // Extract the other user (not the current user)
              const otherUser = connection.sender.id === user.id ? connection.receiver : connection.sender;
              return (
                <React.Fragment key={connection.id}>
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                    {/* User Header */}
                    <div className="relative h-24 bg-gradient-to-r from-green-500 to-blue-600 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lg font-bold text-green-600 shadow-lg">
                            {otherUser.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-bold text-white">{otherUser.username}</h3>
                            <p className="text-green-100 text-xs">{otherUser.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => navigate(`/users/${otherUser.id}`)}
                            className="p-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                            title="View Profile"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 003-3v2a3 3 0 00-3 3v2a3 3 0 00-3-3h-4l-4 4v6h4a2 2 0 002-2V7a2 2 0 002-2H7a2 2 0 002-2V5a2 2 0 002-2h4l-4-4V7a2 2 0 002-2h4l4-4z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => navigate(`/messages/${otherUser.id}`)}
                            className="p-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                            title="Send Message"
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 1.664-1.344 3-3 3-3s3 1.344 3 3c0 1.104.896 2-2 2h8c1.104 0 2 .896 2 2 2s.896-2 2-2h8c-1.104 0-2-.896-2-2-2 2-2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveConnection(connection.id, otherUser.username)}
                            className="p-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors group"
                            title="Remove Connection"
                          >
                            <svg className="w-4 h-4 text-white group-hover:text-red-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                          {otherUser.skills_have ? (
                            otherUser.skills_have.split(',').map((skill, index) => (
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
                          {otherUser.skills_want ? (
                            otherUser.skills_want.split(',').map((skill, index) => (
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

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/users/${otherUser.id}`)}
                          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => navigate(`/messages/${otherUser.id}`)}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                        >
                          Message
                        </button>
                        <button
                          onClick={() => handleRemoveConnection(connection.id, otherUser.username)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm flex items-center justify-center"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyConnections;
