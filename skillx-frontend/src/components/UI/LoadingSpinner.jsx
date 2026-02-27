import React from 'react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600">
        <svg
          className={`text-blue-600 ${sizeClasses[size]}`}
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-4v1.5M4 15a8 8 0 018-4v-1.5M12 6v8m0-8l8-8v8"
          />
        </svg>
      </div>
      {message && (
        <span className="ml-3 text-gray-600 text-sm font-medium">
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
