import React, { useState } from 'react';
import { testConnection } from '../services/api';

const ConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const result = await testConnection();
      setResult(result);
    } catch (error) {
      setResult({
        success: false,
        message: 'Test failed',
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBg = (success) => {
    return success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Connection Test
      </h2>
      
      <p className="text-gray-600 mb-4 text-sm">
        Test the connection between React frontend and Laravel backend.
      </p>

      <button
        onClick={handleTestConnection}
        disabled={testing}
        className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
          testing
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {testing ? 'Testing Connection...' : 'Test Connection'}
      </button>

      {result && (
        <div
          className={`mt-4 p-4 rounded-md border ${getStatusBg(result.success)}`}
        >
          <div className={`font-medium ${getStatusColor(result.success)}`}>
            {result.success ? '✅ Success' : '❌ Failed'}
          </div>
          
          <div className="mt-2 text-sm text-gray-700">
            <strong>Message:</strong> {result.message}
          </div>
          
          {result.error && (
            <div className="mt-2 text-sm text-red-600">
              <strong>Error:</strong> {result.error}
            </div>
          )}
          
          {result.data && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Response:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
          
          {result.details && (
            <div className="mt-2 text-sm text-gray-600">
              <strong>Details:</strong>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2">Current Configuration:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div><strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}</div>
          <div><strong>Laravel Base:</strong> {import.meta.env.VITE_LARAVEL_BASE_URL || 'http://127.0.0.1:8000'}</div>
          <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;
