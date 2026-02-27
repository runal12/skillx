import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user, onSendRequest, isRequestSent, onMessage }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden">
      {/* User Header */}
      <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lg font-bold text-blue-600 shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-white">{user.username}</h3>
              <p className="text-blue-100 text-xs">{user.email}</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => navigate(`/users/${user.id}`)}
              className="p-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              title="View Profile"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 003-3v2a3 3 0 00-3 3v2a3 3 0 00-3-3h-4l-4 4v6h4a2 2 0 002-2V7a2 2 0 002-2H7a2 2 0 002-2V5a2 2 0 002-2h4l-4-4V7a2 2 0 002-2h4l4-4z" />
              </svg>
            </button>
            <button
              onClick={() => onMessage(user)}
              className="p-1 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
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
              {user.bio.length > 30 ? `${user.bio.substring(0, 30)}...` : user.bio}
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
            onClick={() => onSendRequest(user.id)}
            disabled={isRequestSent}
            className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              isRequestSent
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRequestSent ? 'Request Sent' : 'Connect'}
          </button>
          <button
            onClick={() => onMessage(user)}
            className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
          >
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
