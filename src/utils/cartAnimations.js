// Cart animation utilities
export const animateCartItem = (element, type = 'bounce') => {
  if (!element) return;
  
  switch (type) {
    case 'bounce':
      element.style.transform = 'scale(1.05)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 150);
      break;
      
    case 'shake':
      element.style.animation = 'shake 0.5s ease-in-out';
      setTimeout(() => {
        element.style.animation = '';
      }, 500);
      break;
      
    case 'fadeIn':
      element.style.opacity = '0';
      element.style.transform = 'translateY(10px)';
      setTimeout(() => {
        element.style.transition = 'all 0.3s ease-out';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 50);
      break;
      
    default:
      break;
  }
};

// Stagger animation for cart items
export const staggerAnimation = (elements, delay = 100) => {
  elements.forEach((element, index) => {
    if (element) {
      setTimeout(() => {
        animateCartItem(element, 'fadeIn');
      }, index * delay);
    }
  });
};

// Success feedback animation
export const successFeedback = (element) => {
  if (!element) return;
  
  element.style.background = 'linear-gradient(45deg, #10b981, #059669)';
  element.style.transform = 'scale(1.02)';
  
  setTimeout(() => {
    element.style.transition = 'all 0.3s ease-out';
    element.style.background = '';
    element.style.transform = 'scale(1)';
  }, 200);
};

// Cart item removal animation
export const removeItemAnimation = (element, callback) => {
  if (!element) return;
  
  element.style.transition = 'all 0.3s ease-out';
  element.style.transform = 'translateX(100%)';
  element.style.opacity = '0';
  
  setTimeout(() => {
    if (callback) callback();
  }, 300);
};

// Quantity change visual feedback
export const quantityChangeFeedback = (element, increase = true) => {
  if (!element) return;
  
  const color = increase ? '#10b981' : '#ef4444';
  element.style.boxShadow = `0 0 0 2px ${color}40`;
  
  setTimeout(() => {
    element.style.boxShadow = '';
  }, 300);
};
