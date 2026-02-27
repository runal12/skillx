import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => navigate('/messages')}
              className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              💬 Messages
            </button>
            <button
              onClick={() => navigate('/discover')}
              className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              🔍 Discover
            </button>
            <button
              onClick={() => navigate('/connections')}
              className="px-4 py-2 text-gray-700 hover:text-orange-600 font-medium transition-colors"
            >
              🤝 Connections
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.username}!</span>
            <button
              onClick={() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                navigate('/login');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
