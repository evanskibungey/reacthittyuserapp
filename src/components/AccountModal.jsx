import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaTimes, FaFacebook, FaGoogle } from 'react-icons/fa';

const AccountModal = ({ isOpen, onClose, setIsLoggedIn }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setName('');
        setConfirmPassword('');
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      return;
    }
    
    if (activeTab === 'register' && (!name || password !== confirmPassword)) {
      return;
    }
    
    // Mock login/register
    setIsLoggedIn(true);
    onClose();
    
    // You would normally call an API here
    console.log('Form submitted:', { email, password, name, activeTab });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Tabs */}
            <div className="flex border-b mb-6">
              <button 
                className={`py-2 px-4 text-lg font-medium ${activeTab === 'login' 
                  ? 'text-purple-700 border-b-2 border-purple-700' 
                  : 'text-gray-500 hover:text-purple-700'}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
              <button 
                className={`py-2 px-4 text-lg font-medium ${activeTab === 'register' 
                  ? 'text-purple-700 border-b-2 border-purple-700' 
                  : 'text-gray-500 hover:text-purple-700'}`}
                onClick={() => setActiveTab('register')}
              >
                Create Account
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit}>
              {activeTab === 'register' && (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              {activeTab === 'register' && (
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              {activeTab === 'login' && (
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="font-medium text-purple-700 hover:text-purple-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-lg transition-colors"
              >
                {activeTab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="