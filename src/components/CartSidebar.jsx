import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaTrash, FaPlus, FaMinus, FaArrowRight } from 'react-icons/fa';

const CartSidebar = ({ isOpen, onClose }) => {
  const sidebarRef = useRef();

  // Sample cart data - in a real app, this would come from a context or state management
  const cartItems = [
    {
      id: 1,
      name: 'LPG 6kg Cylinder',
      image: '/api/placeholder/80/80?text=6kg+Cylinder',
      price: 1299,
      quantity: 1,
      category: 'Home Cylinders'
    },
    {
      id: 2,
      name: 'Standard Gas Regulator',
      image: '/api/placeholder/80/80?text=Gas+Regulator',
      price: 899,
      quantity: 1,
      category: 'Accessories'
    },
    {
      id: 3,
      name: 'Gas Hose (1.5m)',
      image: '/api/placeholder/80/80?text=Gas+Hose',
      price: 699,
      quantity: 1,
      category: 'Accessories'
    }
  ];

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 150;
  const total = subtotal + deliveryFee;

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

  // Sidebar animation classes
  const overlayClasses = isOpen 
    ? 'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out opacity-100' 
    : 'fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none';

  const sidebarClasses = isOpen
    ? 'fixed top-0 right-0 h-full bg-white w-full md:w-96 z-50 transform transition-transform duration-300 ease-in-out translate-x-0 shadow-xl'
    : 'fixed top-0 right-0 h-full bg-white w-full md:w-96 z-50 transform transition-transform duration-300 ease-in-out translate-x-full shadow-xl';

  return (
    <>
      <div className={overlayClasses} onClick={onClose}></div>
      <div className={sidebarClasses} ref={sidebarRef}>
        {/* Cart Header */}
        <div className="flex items-center justify-between bg-purple-700 text-white p-4">
          <h2 className="text-xl font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Your Cart ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)
          </h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-180px)]">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex border-b pb-4">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-gray-800 font-medium">{item.name}</h3>
                        <p className="text-gray-500 text-sm">{item.category}</p>
                      </div>
                      <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <FaTrash />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-lg">
                        <button className="px-2 py-1 text-gray-600 hover:text-purple-700">
                          <FaMinus size={12} />
                        </button>
                        <span className="px-2 text-gray-800">{item.quantity}</span>
                        <button className="px-2 py-1 text-gray-600 hover:text-purple-700">
                          <FaPlus size={12} />
                        </button>
                      </div>
                      <p className="font-bold text-gray-900">KSh {item.price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="mt-1 text-gray-500">Looks like you haven't added any products to your cart yet.</p>
              <button
                onClick={onClose}
                className="mt-4 bg-purple-700 text-white py-2 px-4 rounded-lg hover:bg-purple-800 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>KSh {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>KSh {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t">
                <span>Total</span>
                <span>KSh {total.toLocaleString()}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={onClose}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors transform hover:-translate-y-0.5"
            >
              Proceed to Checkout
              <FaArrowRight className="ml-2" />
            </Link>
            
            <button
              onClick={onClose}
              className="w-full mt-2 border border-purple-700 text-purple-700 hover:bg-purple-50 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
