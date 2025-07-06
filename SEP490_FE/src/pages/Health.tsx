import React from 'react';

const Health: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ Healthy
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          Khanh An Neurology Clinic Frontend
        </p>
        <p className="text-sm text-gray-500">
          Version: 1.0.0 | Timestamp: {new Date().toISOString()}
        </p>
        <div className="mt-6">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Service is running
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health; 