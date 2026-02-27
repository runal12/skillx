import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import UserCard from './UserCard';

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('skill'); // 'skill', 'username', or 'all'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentRequests, setSentRequests] = useState(new Set());
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let url = '/search/?';
      
      if (searchType === 'skill') {
        url += `skill=${encodeURIComponent(searchTerm)}`;
      } else if (searchType === 'username') {
        url += `username=${encodeURIComponent(searchTerm)}`;
      } else {
        // General search
        url += `q=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await api.get(url);
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Search Users
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find talented professionals by skills, username, or general search
          </p>
        </div>
        
        {/* Search Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Search Type Selection */}
            <div className="mb-4">
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setSearchType('skill')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchType === 'skill'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  By Skills
                </button>
                <button
                  onClick={() => setSearchType('username')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchType === 'username'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  By Username
                </button>
                <button
                  onClick={() => setSearchType('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    searchType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Fields
                </button>
              </div>
            </div>
            
            {/* Search Input */}
            <div className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  searchType === 'skill' 
                    ? "Enter a skill (e.g., JavaScript, Python, Design)"
                    : searchType === 'username'
                    ? "Enter a username (e.g., alice, bob)"
                    : "Enter skill or username (e.g., JavaScript, alice)"
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium transition-all duration-200"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {error && <div className="mt-4 text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
          </div>
        </div>

        {/* Search Results */}
        {users.length > 0 && (
          <div className="mb-6 text-center">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Found {users.length} user{users.length !== 1 ? 's' : ''} for "{searchTerm}" ({searchType})
            </span>
          </div>
        )}

        {users.length === 0 && searchTerm && !loading && !error && (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-white rounded-full">
              <span className="text-6xl">🔍</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-700">
              No users found
            </h3>
            <p className="text-gray-600 mt-2">
              Try searching with different terms or check spelling
            </p>
          </div>
        )}

        {users.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {users.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onSendRequest={handleSendRequest}
                onMessage={handleMessage}
                isRequestSent={sentRequests.has(user.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
