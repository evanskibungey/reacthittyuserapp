import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AuthModal = ({ isOpen, onClose, setIsLoggedIn, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const modalRef = useRef();
  const navigate = useNavigate();

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
    setLocation('');
    setReferralCode('');
    setConfirmPassword('');
    setError('');
    setValidationErrors({});
    setAgreeToTerms(false);
    setSuccessMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [isLogin]);

  // Format phone number as user types
  const formatPhoneNumber = (input) => {
    // Remove all non-digit characters
    const phoneNumber = input.replace(/\D/g, '');
    
    // If user inputs a number without leading 0, add it
    let formattedNumber = phoneNumber;
    if (phoneNumber.length > 0 && phoneNumber[0] !== '0') {
      formattedNumber = '0' + phoneNumber;
    }
    
    // Format the phone number with spaces (e.g., 07xx xxx xxx)
    if (formattedNumber.length > 0) {
      if (formattedNumber.length <= 4) {
        return formattedNumber;
      } else if (formattedNumber.length <= 7) {
        return `${formattedNumber.slice(0, 4)} ${formattedNumber.slice(4)}`;
      } else {
        return `${formattedNumber.slice(0, 4)} ${formattedNumber.slice(4, 7)} ${formattedNumber.slice(7)}`;
      }
    }
    return '';
  };

  // Handle phone number change with formatting
  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setSuccessMessage('');
    setLoading(true);
    
    try {
      // Prepare phone number for API by removing spaces
      const cleanPhone = phone.replace(/\s/g, '');
      
      // Call Laravel API to login customer
      const response = await authService.login({ 
        phone: cleanPhone, 
        password, 
        remember: rememberMe 
      });
      
      if (response.success) {
        setSuccessMessage('Login successful! Redirecting...');
        
        // Store user data in localStorage
        if (response.data && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Store token in localStorage
        if (response.data && response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        setTimeout(() => {
          setIsLoggedIn(true);
          onClose();
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.errors) {
        setValidationErrors(err.errors);
      } else {
        setError(err.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setSuccessMessage('');
    setLoading(true);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Prepare phone number for API by removing formatting
      const cleanPhone = phone.replace(/\D/g, '');
      
      // Call Laravel API to register customer
      const userData = { 
        name, 
        email: email || null, // Make sure null is sent if empty
        phone: cleanPhone, 
        password,
        password_confirmation: confirmPassword,
        location: location || null // Make sure null is sent if empty
      };
      
      // Only add referral code if it's provided
      if (referralCode && referralCode.trim()) {
        userData.referral_code = referralCode.trim();
      }
      
      const response = await authService.register(userData);
      
      if (response.success) {
        setSuccessMessage('Account created successfully! You will be redirected shortly...');
        
        // Store user data in localStorage
        if (response.data && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Store token in localStorage
        if (response.data && response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        
        setTimeout(() => {
          setIsLoggedIn(true);
          onClose();
          if (onLoginSuccess) {
            onLoginSuccess();
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        setError(response.message || 'Registration failed');
        
        if (response.errors) {
          setValidationErrors(response.errors);
        }
      }
    } catch (err) {
      console.error('Registration error in component:', err);
      if (err.errors) {
        setValidationErrors(err.errors);
      } else {
        setError(err.message || 'Registration failed. Check browser console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation classes
  const modalClasses = isOpen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-all duration-300 opacity-100'
    : 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 opacity-0 pointer-events-none';

  const modalContentClasses = isOpen
    ? 'bg-white rounded-xl shadow-lg transform transition-all duration-300 ease-out w-full max-w-4xl mx-4 overflow-hidden'
    : 'bg-white rounded-xl shadow-lg transform transition-all duration-300 scale-95 opacity-0 w-full max-w-4xl mx-4 overflow-hidden';

  if (!isOpen) return null;

  return (
    <div className={modalClasses}>
      <div ref={modalRef} className={modalContentClasses}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20 bg-white rounded-full p-2 hover:shadow-md"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left Panel - Branding and Welcome Message */}
          <div className="md:w-5/12 bg-gradient-to-br from-[#4a235a] to-[#663399] text-white p-8 flex flex-col justify-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>

            {/* Logo Container with solid white background */}
            <div className="bg-white rounded-xl p-4 mb-6 inline-flex items-center shadow-md">
              <img src="/logo.png" alt="Hitty Deliveries" className="h-14 mr-3" />
            </div>

            {/* Welcome message */}
            <h3 className="text-xl font-bold mb-4">{isLogin ? 'Welcome Back!' : 'Join Our Community!'}</h3>
            <p className="mb-6 text-purple-100">
              {isLogin
                ? 'Log in to access your account and enjoy fast, reliable delivery services.'
                : 'Create an account to get started with our convenient gas delivery service.'}
            </p>

            {/* Benefits list with improved colors */}
            <div className="space-y-3 mt-2">
              <div className="flex items-center">
                <div className="bg-orange-400 bg-opacity-30 p-1 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Fast delivery within 60 minutes</span>
              </div>
              <div className="flex items-center">
                <div className="bg-orange-400 bg-opacity-30 p-1 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Earn loyalty points with every order</span>
              </div>
              <div className="flex items-center">
                <div className="bg-orange-400 bg-opacity-30 p-1 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm">Quality products from trusted brands</span>
              </div>
            </div>

            {/* Toggle between login and register with improved styling */}
            <div className="mt-8 text-center">
              <p className="text-sm text-purple-200 mb-2">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="inline-flex items-center text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg transition-all duration-300"
              >
                {isLogin ? 'Create Account' : 'Sign In'}{' '}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="ml-2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="md:w-7/12 p-8 bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{isLogin ? 'Sign In' : 'Create your account'}</h2>

            {/* Success message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Error messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {/* Validation errors */}
            {Object.keys(validationErrors).length > 0 && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                <ul className="list-disc pl-5">
                  {Object.keys(validationErrors).map((field) => (
                    <li key={field}>{validationErrors[field][0]}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Login Form */}
            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Phone input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Phone Number (e.g. 07xx xxx xxx)"
                    required
                  />
                </div>

                {/* Password input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-4 h-4 text-[#663399] border-gray-300 rounded focus:ring-[#663399]"
                    />
                    <span className="ml-2 text-gray-700">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-[#663399] hover:text-[#4a235a] transition-colors">
                    Forgot password?
                  </a>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#663399] hover:bg-[#4a235a] text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md disabled:bg-purple-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="relative md:col-span-2">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Full Name"
                    required
                  />
                </div>

                {/* Email (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Email Address (optional)"
                  />
                </div>

                {/* Phone */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Phone Number (e.g. 07xx xxx xxx)"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Confirm Password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  {password !== confirmPassword && password && confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Location (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Your Location (optional)"
                  />
                </div>

                {/* Referral Code (optional) */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2m0 0v1m2 0a2 2 0 102-2m-2 2h4m-6 4h12m-6-10V4"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#663399] focus:border-transparent bg-gray-50"
                    placeholder="Referral Code (optional)"
                  />
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div className="md:col-span-2">
                    <div className="text-xs text-gray-600 mb-1">Password strength:</div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full">
                      <div 
                        className={`h-1.5 rounded-full ${
                          password.length < 6 ? 'w-1/4 bg-red-500' : 
                          password.length < 8 ? 'w-2/4 bg-yellow-500' : 
                          password.length < 10 ? 'w-3/4 bg-blue-500' : 'w-full bg-green-500'
                        }`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {password.length < 6 ? 'Weak - Please use at least 6 characters' : 
                       password.length < 8 ? 'Fair - Consider a longer password' : 
                       password.length < 10 ? 'Good - Password has decent length' : 'Strong - Great password length'}
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="flex items-start md:col-span-2 mt-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={() => setAgreeToTerms(!agreeToTerms)}
                    className="mt-1 w-4 h-4 text-[#663399] border-gray-300 rounded focus:ring-[#663399]"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-orange-500 hover:text-orange-600 underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-orange-500 hover:text-orange-600 underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit button - Consistent with brand colors */}
                <button
                  type="submit"
                  disabled={loading || !agreeToTerms}
                  className="md:col-span-2 mt-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md disabled:bg-orange-300 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}

            {/* Security note */}
            <div className="mt-6 text-xs text-gray-500 flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>
                Your information is secured with industry-standard encryption. We will never share your personal data with third parties without your consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;