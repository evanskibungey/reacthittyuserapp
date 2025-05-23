import React, { useEffect, useRef, useState } from 'react';
import OptimizedImage from './common/OptimizedImage';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { 
  FaTimes, 
  FaTrash, 
  FaPlus, 
  FaMinus, 
  FaArrowRight, 
  FaShoppingCart,
  FaMoneyBill,
  FaMobileAlt,
  FaCreditCard,
  FaGift,
  FaShieldAlt,
  FaCheckCircle
} from 'react-icons/fa';
import CheckoutModal from './CheckoutModal';
import AuthModal from './AuthModal';

const CartSidebar = ({ isOpen, onClose, isLoggedIn, setIsLoggedIn }) => {
  const sidebarRef = useRef();
  const { 
    cartItems, 
    cartSubtotal, 
    updateCartItem, 
    removeFromCart,
    paymentMethod,
    setPaymentMethod,
    paymentFormData,
    setPaymentFormData
  } = useCart();

  // Calculate totals
  const deliveryFee = 0; // Free delivery for all products
  const total = cartSubtotal + deliveryFee;

  // Transaction notes state
  const [transactionNotes, setTransactionNotes] = useState('');

  // Modal visibility state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
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

  // Prevent body scrolling when sidebar is open
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

  // Drawer overlay classes
  const overlayClasses = isOpen
    ? 'fixed inset-0 bg-black bg-opacity-60 z-40 transition-all duration-300 ease-in-out opacity-100 backdrop-blur-sm'
    : 'fixed inset-0 bg-black bg-opacity-60 z-40 transition-all duration-300 ease-in-out opacity-0 pointer-events-none backdrop-blur-sm';

  // Drawer container classes (slide in from right)
  const drawerClasses = isOpen
    ? 'fixed top-0 right-0 h-full bg-white w-full max-w-md md:w-96 z-50 flex flex-col shadow-2xl transform transition-all duration-300 ease-in-out translate-x-0'
    : 'fixed top-0 right-0 h-full bg-white w-full max-w-md md:w-96 z-50 flex flex-col shadow-2xl transform transition-all duration-300 ease-in-out translate-x-full';

  // Handle quantity update with animation
  const handleQuantityUpdate = (itemId, quantity) => {
    setIsAnimating(true);
    updateCartItem(itemId, quantity);
    setTimeout(() => setIsAnimating(false), 200);
  };

  // Handle payment processing: check auth first, then open modal
  const handleProcessPayment = () => {
    if (isLoggedIn) {
      setShowCheckoutModal(true); // Show checkout modal
    } else {
      setShowAuthModal(true); // Show login/signup modal
    }
  };

  // Payment method options with enhanced styling
  const paymentOptions = [
    {
      id: 'cash',
      label: 'Cash on Delivery',
      icon: FaMoneyBill,
      color: 'emerald',
      description: 'Pay when your order arrives',
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      id: 'mobile_money',
      label: 'M-Pesa',
      icon: FaMobileAlt,
      color: 'purple',
      description: 'Quick & secure mobile payment',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'account',
      label: 'Credit Account',
      icon: FaCreditCard,
      color: 'blue',
      description: 'Buy now, pay later option',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <>
      {/* Overlay for background dimming */}
      <div className={overlayClasses} onClick={onClose} />

      {/* Drawer container: slides in from right */}
      <div className={drawerClasses} ref={sidebarRef}>
        {/* Drawer header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white p-6 pb-8">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <FaShoppingCart className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <p className="text-purple-100 text-sm">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} • {cartItems.reduce((sum, item) => sum + item.quantity, 0)} total
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close cart"
              className="p-2 hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-xl transition-all duration-200"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Drawer content: scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 cart-scroll">
          {/* Cart Items */}
          {cartItems.length > 0 ? (
            <div className="p-4 space-y-3">
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition-all duration-300 hover:shadow-md animate-slide-in ${
                    isAnimating ? 'scale-98' : 'scale-100'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex gap-4">
                    {/* Product image */}
                    <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                      <OptimizedImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                        width={80}
                        height={80}
                      />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10"></div>
                    </div>
                    
                    {/* Product details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-gray-900 font-semibold text-sm leading-tight truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                            {item.category}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
                          aria-label={`Remove ${item.name}`}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                      
                      {/* Quantity controls and price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                          <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                            className="px-3 py-2 text-gray-600 hover:text-purple-700 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors quantity-btn"
                            aria-label="Decrease quantity"
                          >
                            <FaMinus size={10} />
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-semibold text-sm bg-white">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                            className="px-3 py-2 text-gray-600 hover:text-purple-700 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors quantity-btn"
                            aria-label="Increase quantity"
                          >
                            <FaPlus size={10} />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-700 text-sm">KSh {item.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Cart summary */}
              <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-purple-100">
                  <h3 className="font-semibold text-purple-900 flex items-center">
                    <FaGift className="mr-2 text-purple-600" />
                    Order Summary
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">KSh {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center">
                      <FaShieldAlt className="mr-1 text-xs" />
                      Delivery Fee
                    </span>
                    <span className="font-semibold">FREE</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                  <div className="flex justify-between font-bold text-purple-700 text-lg">
                    <span>Total</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-purple-100">
                  <h3 className="font-semibold text-purple-900">Payment Method</h3>
                </div>
                <div className="p-4">
                  {/* Payment method grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {paymentOptions.map((option) => {
                      const isSelected = paymentMethod === option.id;
                      const IconComponent = option.icon;
                      
                      return (
                        <div
                          key={option.id}
                          onClick={() => setPaymentMethod(option.id)}
                          className={`relative border-2 rounded-xl p-3 cursor-pointer payment-card text-center transition-all duration-200 ${
                            isSelected
                              ? option.id === 'cash' 
                                ? 'border-emerald-400 bg-emerald-50'
                                : option.id === 'mobile_money'
                                ? 'border-purple-400 bg-purple-50'
                                : 'border-blue-400 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          {/* Radio button indicator */}
                          <div className="absolute top-2 right-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? option.id === 'cash'
                                  ? 'border-emerald-500 bg-emerald-500'
                                  : option.id === 'mobile_money'
                                  ? 'border-purple-500 bg-purple-500'
                                  : 'border-blue-500 bg-blue-500'
                                : 'border-gray-300 bg-white'
                            }`}>
                              {isSelected && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          {/* Icon */}
                          <div className={`mx-auto mb-2 p-2 rounded-lg inline-flex ${
                            isSelected
                              ? option.id === 'cash'
                                ? 'bg-emerald-100'
                                : option.id === 'mobile_money'
                                ? 'bg-purple-100'
                                : 'bg-blue-100'
                              : 'bg-gray-100'
                          }`}>
                            <IconComponent className={`text-xl ${
                              isSelected
                                ? option.id === 'cash'
                                  ? 'text-emerald-600'
                                  : option.id === 'mobile_money'
                                  ? 'text-purple-600'
                                  : 'text-blue-600'
                                : 'text-gray-500'
                            }`} />
                          </div>
                          
                          {/* Label */}
                          <h4 className={`font-medium text-xs leading-tight ${
                            isSelected
                              ? option.id === 'cash'
                                ? 'text-emerald-900'
                                : option.id === 'mobile_money'
                                ? 'text-purple-900'
                                : 'text-blue-900'
                              : 'text-gray-700'
                          }`}>
                            {option.label}
                          </h4>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Payment method specific fields */}
                  {paymentMethod === 'mobile_money' && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <h5 className="font-medium text-purple-900 mb-3 text-sm flex items-center">
                        <FaMobileAlt className="mr-2" />
                        M-Pesa Payment Details
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-purple-800 mb-1">Phone Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 0712345678"
                            value={paymentFormData.mpesaPhone}
                            onChange={(e) => setPaymentFormData({
                              ...paymentFormData,
                              mpesaPhone: e.target.value
                            })}
                            className="w-full text-sm border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-purple-800 mb-1">Transaction ID</label>
                          <input
                            type="text"
                            placeholder="e.g. QJI12345XZ"
                            value={paymentFormData.mpesaTransactionId}
                            onChange={(e) => setPaymentFormData({
                              ...paymentFormData,
                              mpesaTransactionId: e.target.value
                            })}
                            className="w-full text-sm border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div className="bg-purple-100 rounded-lg p-3">
                          <p className="text-xs text-purple-800 font-medium">
                            📱 Send payment to: <span className="font-bold">Till Number 123456</span>
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Enter the transaction ID you receive after payment
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {paymentMethod === 'account' && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h5 className="font-medium text-blue-900 mb-3 text-sm flex items-center">
                        <FaCreditCard className="mr-2" />
                        Credit Account Details
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-blue-800 mb-1">Reason for Credit</label>
                          <textarea
                            placeholder="Please provide a reason for credit purchase"
                            value={paymentFormData.creditReason}
                            onChange={(e) => setPaymentFormData({
                              ...paymentFormData,
                              creditReason: e.target.value
                            })}
                            rows="3"
                            className="w-full text-sm border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-blue-800 mb-1">Expected Payment Date</label>
                          <input
                            type="date"
                            value={paymentFormData.expectedPaymentDate}
                            onChange={(e) => setPaymentFormData({
                              ...paymentFormData,
                              expectedPaymentDate: e.target.value
                            })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full text-sm border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="bg-blue-100 rounded-lg p-3">
                          <p className="text-xs text-blue-800 font-medium">
                            ⚠️ Credit purchases require approval
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Your order will be processed after approval
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction notes section */}
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-purple-100">
                  <h3 className="font-semibold text-purple-900">Additional Notes</h3>
                  <p className="text-xs text-purple-600 mt-1">Any special instructions or comments</p>
                </div>
                <div className="p-4">
                  <textarea
                    className="w-full border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                    placeholder="Add any special instructions for your order..."
                    value={transactionNotes}
                    onChange={(e) => setTransactionNotes(e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </div>
          ) : (
            // Empty cart message
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <FaShoppingCart className="text-3xl text-purple-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-500 text-sm">😔</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6 max-w-xs">
                Discover our amazing LPG products and start adding items to your cart!
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 animate-pulse-soft"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Drawer footer: actions */}
        {cartItems.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="space-y-3">
              {/* Process payment button */}
              <button
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:transform active:translate-y-0 focus-ring"
                onClick={handleProcessPayment}
                disabled={false}
              >
                <FaCheckCircle className="mr-3 text-lg" />
                <span className="text-lg">Confirm Order • KSh {total.toLocaleString()}</span>
              </button>

              {/* Continue shopping button */}
              <button
                onClick={onClose}
                className="w-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center focus-ring"
              >
                <FaArrowRight className="mr-2 transform rotate-180" />
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        transactionNotes={transactionNotes}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        setIsLoggedIn={setIsLoggedIn}
        onLoginSuccess={() => {
          setShowAuthModal(false);
          setShowCheckoutModal(true);
        }}
      />
    </>
  );
};

export default CartSidebar;