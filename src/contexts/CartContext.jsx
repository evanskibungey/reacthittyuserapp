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
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('hittyCart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cartItems]);
  
  // Cart functionality
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if product is already in cart
      const existingItemIndex = prevItems.findIndex(item => item.product_id === product.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          subtotal: product.selling_price * newQuantity,
          total: product.selling_price * newQuantity
        };
        return updatedItems;
      } else {
        // Add new item to cart with structure matching backend expectations
        return [...prevItems, {
          id: Date.now(), // Unique ID for cart item
          product_id: product.id,
          name: product.name,
          price: product.selling_price,
          image: product.image_url || `/api/placeholder/80/80?text=${encodeURIComponent(product.name.substring(0, 10))}`,
          category: product.category || '',
          quantity: quantity,
          // Include these fields to match backend calculation format
          subtotal: product.selling_price * quantity,
          discount: 0,
          total: product.selling_price * quantity
        }];
      }
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
            subtotal,
            discount: 0, // Reset any discount
            total: subtotal // Update total
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
    cartSubtotal
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
