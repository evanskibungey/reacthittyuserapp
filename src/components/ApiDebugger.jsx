import React, { useState } from 'react';
import axios from 'axios';

const ApiDebugger = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState([]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const tests = [
      {
        name: 'Basic API Health Check',
        url: 'https://operations.hitisha.co.ke/api/test-connection',
        method: 'GET'
      },
      {
        name: 'Products Endpoint',
        url: 'https://operations.hitisha.co.ke/api/products',
        method: 'GET'
      },
      {
        name: 'Categories Endpoint', 
        url: 'https://operations.hitisha.co.ke/api/categories',
        method: 'GET'
      },
      {
        name: 'Base Laravel URL',
        url: 'https://operations.hitisha.co.ke',
        method: 'GET'
      }
    ];

    for (const test of tests) {
      try {
        const startTime = Date.now();
        const response = await axios({
          method: test.method,
          url: test.url,
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        const endTime = Date.now();
        
        setResults(prev => [...prev, {
          ...test,
          success: true,
          status: response.status,
          statusText: response.statusText,
          time: endTime - startTime,
          data: response.data
        }]);
      } catch (error) {
        setResults(prev => [...prev, {
          ...test,
          success: false,
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          details: error.response?.data
        }]);
      }
    }
    
    setTesting(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        🔍 API Connection Debugger
      </h2>
      
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="font-medium text-blue-800 mb-2">Current Configuration:</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}</div>
          <div><strong>VITE_LARAVEL_BASE_URL:</strong> {import.meta.env.VITE_LARAVEL_BASE_URL || 'http://127.0.0.1:8000'}</div>
          <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
        </div>
      </div>

      <button
        onClick={runTests}
        disabled={testing}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors duration-200 ${
          testing
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {testing ? 'Running Tests...' : 'Run API Connectivity Tests'}
      </button>

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Test Results:</h3>
          
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-md border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-medium ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success ? '✅' : '❌'} {result.name}
                </h4>
                {result.time && (
                  <span className="text-sm text-gray-600">{result.time}ms</span>
                )}
              </div>
              
              <div className="text-sm space-y-1">
                <div><strong>URL:</strong> {result.url}</div>
                <div><strong>Method:</strong> {result.method}</div>
                {result.status && (
                  <div><strong>Status:</strong> {result.status} {result.statusText}</div>
                )}
                {result.error && (
                  <div className="text-red-600"><strong>Error:</strong> {result.error}</div>
                )}
              </div>
              
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    View Response Data
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
              
              {result.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium text-red-700">
                    View Error Details
                  </summary>
                  <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiDebugger; 