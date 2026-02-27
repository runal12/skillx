import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ConnectionRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/pending-requests/');
      setPendingRequests(response.data);
    } catch (err) {
      setError('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post('/accept-request/', { request_id: requestId });
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post('/reject-request/', { request_id: requestId });
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject request');
    }
  };

  if (loading) return <div className="text-center py-8">Loading requests...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Connection Requests
          </h1>
          <p className="text-gray-600">
            {pendingRequests.length} pending request{pendingRequests.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Requests List */}
        {pendingRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-8 bg-white rounded-full">
              <span className="text-6xl">📬</span>
            </div>
            <h3 className="mt-6 text-xl font-semibold text-gray-700">
              No pending connection requests
            </h3>
            <p className="text-gray-600 mt-2">
              You're all caught up! Check back later for new requests.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingRequests.map(request => (
              <React.Fragment key={request.id}>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
                  {/* Compact Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold shadow-lg">
                          {request.sender.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="font-bold text-white text-sm">{request.sender.username}</h3>
                          <p className="text-blue-100 text-xs">{request.sender.email}</p>
                        </div>
                      </div>
                      <div className="text-white text-xs">
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Compact Body */}
                  <div className="p-4">
                    {/* Skills */}
                    <div className="mb-3">
                      <div className="flex items-center mb-2">
                        <span className="text-blue-600 font-bold text-xs mr-2">💪</span>
                        <h4 className="font-semibold text-gray-900 text-xs">Skills</h4>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {request.sender.skills_have ? (
                          request.sender.skills_have.split(',').slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 italic text-xs">No skills listed</span>
                        )}
                        {request.sender.skills_have && request.sender.skills_have.split(',').length > 3 && (
                          <span className="text-gray-500 text-xs">+{request.sender.skills_have.split(',').length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-xs"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="flex-1 px-2 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-xs"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionRequests;
