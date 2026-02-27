import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    connections: 0,
    pendingRequests: 0,
    messages: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [connectionsRes, pendingRes, messagesRes, usersRes] = await Promise.all([
        api.get('/my-connections/'),
        api.get('/pending-requests/'),
        api.get('/conversations/'),
        api.get('/users/')
      ]);
      
      setStats({
        connections: connectionsRes.data.length,
        pendingRequests: pendingRes.data.length,
        messages: messagesRes.data.length,
        totalUsers: usersRes.data.length
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 shadow-2xl">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Ready to connect, learn, and grow? Your skill journey continues here.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl px-6 py-3 border border-white border-opacity-30">
                <div className="text-3xl font-bold text-white">{stats.connections}</div>
                <div className="text-sm text-blue-100">Connections</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl px-6 py-3 border border-white border-opacity-30">
                <div className="text-3xl font-bold text-white">{stats.pendingRequests}</div>
                <div className="text-sm text-blue-100">Pending</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl px-6 py-3 border border-white border-opacity-30">
                <div className="text-3xl font-bold text-white">{stats.messages}</div>
                <div className="text-sm text-blue-100">Conversations</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl px-6 py-3 border border-white border-opacity-30">
                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                <div className="text-sm text-blue-100">Total Users</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-indigo-400 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Skills Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Skills I Have */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                💪
              </div>
              <h3 className="text-xl font-bold text-gray-900">Skills I Have</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.skills_have ? (
                user.skills_have.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full text-sm font-medium border border-blue-300"
                  >
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <div className="text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
                  No skills listed yet. Add your skills to get discovered!
                </div>
              )}
            </div>
          </div>

          {/* Skills I Want */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                🎯
              </div>
              <h3 className="text-xl font-bold text-gray-900">Skills I Want</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {user?.skills_want ? (
                user.skills_want.split(',').map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-sm font-medium border border-green-300"
                  >
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <div className="text-gray-500 italic bg-gray-50 p-4 rounded-lg text-center">
                  What skills are you looking to learn?
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
              📝
            </div>
            <h3 className="text-xl font-bold text-gray-900">About Me</h3>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
            <p className="text-gray-700 leading-relaxed">
              {user?.bio || 'No bio yet. Tell others about yourself and what you\'re passionate about!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;