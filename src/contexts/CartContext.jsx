import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Initialize cart state from localStorage if available
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('hittyCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  });
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Callback for when items are added to cart (using ref to avoid re-renders)
  const onAddToCartCallbackRef = React.useRef(null);
  
  // Function to set the callback
  const setOnAddToCartCallback = (callback) => {
    onAddToCartCallbackRef.current = callback;
  };
  
  // Function to show toast notifications
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };
  
  // Payment method state - default to cash on delivery
  const [paymentMethod, setPaymentMethod] = useState(() => {
    try {
      const savedPaymentMethod = localStorage.getItem('hittyPaymentMethod');
      return savedPaymentMethod ? JSON.parse(savedPaymentMethod) : 'cash';
    } catch (error) {
      console.error('Error loading payment method from localStorage:', error);
      return 'cash'; // Default to cash on delivery
    }
  });
  
  // Payment method form data for M-Pesa and Credit Account
  const [paymentFormData, setPaymentFormData] = useState(() => {
    try {
      const savedPaymentFormData = localStorage.getItem('hittyPaymentFormData');
      return savedPaymentFormData ? JSON.parse(savedPaymentFormData) : {
        // Mobile money fields
        mpesaPhone: '',
        mpesaTransactionId: '',
        // Credit account fields
        creditReason: '',
        expectedPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      };
    } catch (error) {
      console.error('Error loading payment form data from localStorage:', error);
      return {
        mpesaPhone: '',
        mpesaTransactionId: '',
        creditReason: '',
        expectedPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      };
    }
  });
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hittyCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);
  
  // Save payment method to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hittyPaymentMethod', JSON.stringify(paymentMethod));
    } catch (error) {
      console.error('Error saving payment method to localStorage:', error);
    }
  }, [paymentMethod]);
  
  // Save payment form data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hittyPaymentFormData', JSON.stringify(paymentFormData));
    } catch (error) {
      console.error('Error saving payment form data to localStorage:', error);
    }
  }, [paymentFormData]);
  
  // Cart functionality
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if product is already in cart
      const existingItemIndex = prevItems.findIndex(item => item.product_id === product.id);
      
      let updatedItems;
      let isNewItem = false;
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          // Only include backend fields that definitely exist
          unit_price: product.selling_price,
          subtotal: product.selling_price * newQuantity
        };
      } else {
        // Add new item to cart with structure matching backend expectations
        isNewItem = true;
        updatedItems = [...prevItems, {
          id: Date.now(), // Unique ID for cart item
          product_id: product.id,
          name: product.name,
          price: product.selling_price, // Frontend display price
          unit_price: product.selling_price, // Backend field
          image: product.image_url || `/api/placeholder/80/80?text=${encodeURIComponent(product.name.substring(0, 10))}`,
          category: product.category || '',
          quantity: quantity,
          subtotal: product.selling_price * quantity
        }];
      }
      
      // Show toast notification
      if (isNewItem) {
        showToast(`${product.name} added to cart!`, 'success');
      } else {
        showToast(`${product.name} quantity updated!`, 'success');
      }
      
      // Trigger callback if set (e.g., to open cart sidebar)
      if (onAddToCartCallbackRef.current) {
        onAddToCartCallbackRef.current();
      }
      
      return updatedItems;
    });
  };
  
  const updateCartItem = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          const subtotal = item.price * quantity;
          return { 
            ...item, 
            quantity,
            unit_price: item.price,
            subtotal
            // Remove any fields that don't exist in the database schema
          };
        }
        return item;
      })
    );
  };
  
  const removeFromCart = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };
  
  const clearCart = () => {
    setCartItems([]);
    // Reset payment method to default when cart is cleared
    setPaymentMethod('cash');
    setPaymentFormData({
      mpesaPhone: '',
      mpesaTransactionId: '',
      creditReason: '',
      expectedPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    });
  };
  
  // Calculate cart totals
  const cartItemsCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((total, item) => total + item.subtotal, 0);
  
  // Cart context value
  const value = {
    cartItems,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartItemsCount,
    cartSubtotal,
    paymentMethod,
    setPaymentMethod,
    paymentFormData,
    setPaymentFormData,
    setOnAddToCartCallback,
    showToast,
    toast
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 toast-enter ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          } max-w-sm min-w-[280px]`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast({ show: false, message: '', type: 'success' })}
              className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export default CartContext;
