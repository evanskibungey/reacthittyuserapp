import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaLock, FaUser, FaPhone, FaTimes, FaFacebook, FaGoogle } from 'react-icons/fa';

const AuthModal = ({ isOpen, onClose, setIsLoggedIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const modalRef = useRef();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset form when toggling between login and register
  useEffect(() => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
  }, [isLogin]);

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    console.log('Logging in with:', { email, password, rememberMe });
    
    // For demo purposes, just set as logged in
    localStorage.setItem('authToken', 'demo-token');
    setIsLoggedIn(true);
    onClose();
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // Simulate registration
    console.log('Registering with:', { name, email, phone, password });
    
    // For demo purposes, just set as logged in
    localStorage.setItem('authToken', 'demo-token');
    setIsLoggedIn(true);
    onClose();
  };

  // Animation classes
  const modalClasses = isOpen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 opacity-100' 
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 opacity-0 pointer-events-none';

  const modalContentClasses = isOpen
    ? 'bg-white rounded-xl shadow-xl transform transition-all duration-300 ease-out w-full max-w-md mx-4'
    : 'bg-white rounded-xl shadow-xl transform transition-all duration-300 scale-95 opacity-0 w-full max-w-md mx-4';

  if (!isOpen) return null;

  return (
    <div className={modalClasses}>
      <div 
        ref={modalRef}
        className={modalContentClasses}
      >
        {/* Modal Header */}
        <div className="relative p-6 border-b">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
              <FaFacebook className="mr-2" />
              <span>Facebook</span>
            </button>
            <button className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors">
              <FaGoogle className="mr-2" />
              <span>Google</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Email Address"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="ml-2 text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-sm text-purple-600 hover:text-purple-800 transition-colors">
                  Forgot password?
                </a>
              </div>
              <button 
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Email Address"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Phone Number"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input 
                  id="terms"
                  type="checkbox" 
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                  I agree to the <a href="#" className="text-purple-600 hover:text-purple-800">Terms of Service</a> and <a href="#" className="text-purple-600 hover:text-purple-800">Privacy Policy</a>
                </label>
              </div>
              <button 
                type="submit"
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors transform hover:-translate-y-0.5"
              >
                Create Account
              </button>
            </form>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-6 bg-gray-50 border-t rounded-b-xl">
          <p className="text-center text-gray-700">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
