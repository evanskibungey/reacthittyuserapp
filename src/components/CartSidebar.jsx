import React, { useEffect, useRef, useState } from 'react';
import OptimizedImage from './common/OptimizedImage';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { FaTimes, FaTrash, FaPlus, FaMinus, FaArrowRight, FaShoppingCart } from 'react-icons/fa';
import CheckoutModal from './CheckoutModal';
import AuthModal from './AuthModal';

const CartSidebar = ({ isOpen, onClose, isLoggedIn, setIsLoggedIn }) => {
  const sidebarRef = useRef();
  const { cartItems, cartSubtotal, updateCartItem, removeFromCart } = useCart();

  // Calculate totals
  const deliveryFee = cartItems.length > 0 ? 150 : 0;
  const total = cartSubtotal + deliveryFee;

  // Transaction notes state
  const [transactionNotes, setTransactionNotes] = useState('');

  // Modal visibility state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

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
    ? 'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out opacity-100'
    : 'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none';

  // Drawer container classes (slide in from right)
  const drawerClasses = isOpen
    ? 'fixed top-0 right-0 h-full bg-white w-full max-w-md md:w-96 z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-0'
    : 'fixed top-0 right-0 h-full bg-white w-full max-w-md md:w-96 z-50 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out translate-x-full';

  // Handle payment processing: check auth first, then open modal
  const handleProcessPayment = () => {
    if (isLoggedIn) {
      setShowCheckoutModal(true); // Show checkout modal
    } else {
      setShowAuthModal(true); // Show login/signup modal
    }
  };

  return (
    <>
      {/* Overlay for background dimming */}
      <div className={overlayClasses} onClick={onClose} />

      {/* Drawer container: slides in from right */}
      <div className={drawerClasses} ref={sidebarRef}>
        {/* Drawer header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4">
          <h2 className="text-xl font-bold flex items-center">
            <FaShoppingCart className="mr-2" />
            Your Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
          </h2>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Drawer content: scrollable */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {/* Cart Items */}
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex gap-3">
                  {/* Product image */}
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <OptimizedImage
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full p-2"
                      objectFit="contain"
                      width={64}
                      height={64}
                    />
                  </div>
                  {/* Product details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-gray-800 font-medium leading-tight">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                        aria-label={`Remove ${item.name}`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                    {/* Quantity controls and price */}
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border rounded-lg bg-gray-100">
                        {/* Decrease quantity */}
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-600 hover:text-purple-700 focus:outline-none"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="px-3 text-gray-800 font-semibold">{item.quantity}</span>
                        {/* Increase quantity */}
                        <button
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-600 hover:text-purple-700 focus:outline-none"
                          aria-label="Increase quantity"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                      {/* Item price */}
                      <p className="font-bold text-purple-700 whitespace-nowrap">KSh {item.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty cart message
            <div className="flex flex-col items-center justify-center text-center py-16 px-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-gray-500">Looks like you haven't added any products yet.</p>
              <button
                onClick={onClose}
                className="mt-4 bg-purple-700 hover:bg-purple-800 text-white py-2 px-6 rounded-lg transition-colors shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          )}

          {/* Cart summary */}
          {cartItems.length > 0 && (
            <div className="mt-6 mb-4 p-4 bg-white rounded-lg shadow-sm space-y-2 border border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>KSh {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>KSh {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-purple-700 text-lg pt-2 border-t">
                <span>Total</span>
                <span>KSh {total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Transaction notes section */}
          {cartItems.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Add Notes (Optional)</h3>
              <textarea
                className="w-full border rounded-lg p-2 min-h-[48px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                placeholder="Any additional notes about this transaction"
                value={transactionNotes}
                onChange={(e) => setTransactionNotes(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Drawer footer: actions */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t flex flex-col gap-3">
            {/* Process payment button: opens modal */}
            <button
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg"
              onClick={handleProcessPayment}
              disabled={false}
            >
              <span className="mr-2">✔</span> Process Payment
            </button>

            {/* Continue shopping button */}
            <button
              onClick={onClose}
              className="w-full border border-purple-700 text-purple-700 hover:bg-purple-50 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
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