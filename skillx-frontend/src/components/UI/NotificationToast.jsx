import React, { useState, useEffect } from 'react';

const NotificationToast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const typeStyles = {
    success: 'bg-green-500 border-green-500 text-green-50',
    error: 'bg-red-500 border-red-500 text-red-50',
    warning: 'bg-yellow-500 border-yellow-500 text-yellow-50',
    info: 'bg-blue-500 border-blue-500 text-blue-50'
  };

  const typeIcons = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 00-8-8v8a8 8 0 0016 16l-8-8-8z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 00-8-8v8a8 8 0 0016 16l-8-8-8z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099C3.322 3.099 1.414 0 1.414 0 1.414 0 1.657 3.993l1.239 1.239a1 1 0 01-1.414-1.414L8.257 3.099a1 1 0 01.414-1.414 1.657 1.657l1.239 1.239a1 1 0 01.414-1.414L8.257 3.099a1 1 0 01.414-1.414 1.657 1.657l1.239 1.239a1 1 0 01.414-1.414L8.257 3.099z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-8 0v8a8 8 0 018-4v8a8 8 0 004 4 4zm-2 0a6 6 0 016-6v6a6 6 0 016 6zm-2 0a6 6 0 016-6v6a6 6 0 016 6z" clipRule="evenodd" />
      </svg>
    )
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-pulse">
      <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg border ${typeStyles[type]} p-4`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {typeIcons[type]}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {message}
            </p>
            {duration > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
