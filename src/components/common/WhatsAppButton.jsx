import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { openWhatsApp } from '../../utils/whatsappUtils';

/**
 * Reusable WhatsApp Button Component
 * Provides consistent WhatsApp functionality across the app
 */
const WhatsAppButton = ({
  message = '',
  phone = undefined,
  children,
  className = '',
  size = 'md',
  variant = 'primary',
  disabled = false,
  showIcon = true,
  iconSize,
  onClick,
  ariaLabel = 'Chat on WhatsApp',
  title,
  ...props
}) => {
  // Default size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-2',
      iconSize: iconSize || 14,
      textSize: 'text-sm',
      width: 'w-8 h-8'
    },
    md: {
      padding: 'p-3',
      iconSize: iconSize || 16,
      textSize: 'text-base',
      width: 'w-10 h-10'
    },
    lg: {
      padding: 'p-4',
      iconSize: iconSize || 20,
      textSize: 'text-lg',
      width: 'w-12 h-12'
    }
  };

  // Variant configurations
  const variantConfig = {
    primary: 'bg-green-500 hover:bg-green-600 text-white',
    secondary: 'bg-green-100 hover:bg-green-200 text-green-700',
    outline: 'border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white',
    ghost: 'text-green-500 hover:bg-green-50',
    floating: 'bg-green-500 hover:bg-green-600 text-white shadow-xl hover:shadow-2xl'
  };

  const config = sizeConfig[size];
  const variantClasses = variantConfig[variant];

  // Handle click event
  const handleClick = (e) => {
    e.preventDefault();
    
    if (disabled) return;
    
    // Custom onClick handler if provided
    if (onClick) {
      onClick(e);
      return;
    }
    
    // Default WhatsApp functionality
    openWhatsApp(phone, message);
  };

  // Determine if it's an icon-only button or has text
  const isIconOnly = !children;

  // Base classes for all buttons
  const baseClasses = `
    inline-flex items-center justify-center
    transition-all duration-300 transform
    hover:scale-110 hover:shadow-lg
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50
  `;

  // Icon-only button classes
  const iconOnlyClasses = `
    ${config.width} rounded-full
  `;

  // Button with text classes
  const buttonWithTextClasses = `
    ${config.padding} px-6 rounded-lg space-x-2
  `;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title || ariaLabel}
      className={`
        ${baseClasses}
        ${variantClasses}
        ${isIconOnly ? iconOnlyClasses : buttonWithTextClasses}
        ${className}
      `}
      {...props}
    >
      {showIcon && (
        <FaWhatsapp 
          size={config.iconSize} 
          className={children ? 'mr-1' : ''}
        />
      )}
      {children && (
        <span className={config.textSize}>
          {children}
        </span>
      )}
    </button>
  );
};

/**
 * Pre-configured WhatsApp buttons for common use cases
 */

// Support button
export const WhatsAppSupportButton = ({ className = '', ...props }) => (
  <WhatsAppButton
    message="Hello! I need help with Hitty Deliveries service. Could you please assist me?"
    ariaLabel="Get support on WhatsApp"
    title="Get support on WhatsApp"
    className={className}
    {...props}
  >
    Chat Support
  </WhatsAppButton>
);

// Product inquiry button
export const WhatsAppProductButton = ({ product, className = '', ...props }) => {
  const message = product ? 
    `Hello! I'm interested in ${product.name} (KSh ${product.selling_price?.toLocaleString()}). Could you please provide more information?` 
    : "Hello! I'd like to know more about your products.";
    
  return (
    <WhatsAppButton
      message={message}
      ariaLabel="Ask about product on WhatsApp"
      title="Ask about this product on WhatsApp"
      size="sm"
      variant="secondary"
      className={className}
      {...props}
    />
  );
};

// Order inquiry button
export const WhatsAppOrderButton = ({ orderNumber, className = '', ...props }) => {
  const message = orderNumber 
    ? `Hello! I would like to check the status of my order #${orderNumber}. Could you please provide an update?`
    : "Hello! I would like to place an order for gas delivery. Please help me with the ordering process.";
    
  return (
    <WhatsAppButton
      message={message}
      ariaLabel="Order inquiry on WhatsApp"
      title="Contact us about your order"
      className={className}
      {...props}
    >
      Order Inquiry
    </WhatsAppButton>
  );
};

// Emergency order button
export const WhatsAppEmergencyButton = ({ className = '', ...props }) => (
  <WhatsAppButton
    message="🚨 URGENT: I need emergency gas delivery! My gas has run out and I need immediate delivery. Could you please help me with the fastest delivery option available?"
    ariaLabel="Emergency order on WhatsApp"
    title="Emergency gas delivery request"
    variant="primary"
    className={`bg-red-500 hover:bg-red-600 ${className}`}
    {...props}
  >
    Emergency Order
  </WhatsAppButton>
);

// Floating action button
export const WhatsAppFloatingButton = ({ 
  className = '',
  position = 'bottom-right',
  ...props 
}) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-20 right-6',
    'top-left': 'fixed top-20 left-6'
  };

  return (
    <WhatsAppButton
      message="Hello! I need help with Hitty Deliveries service. Could you please assist me?"
      ariaLabel="Chat on WhatsApp"
      title="Chat with us on WhatsApp"
      size="lg"
      variant="floating"
      className={`${positionClasses[position]} z-50 animate-pulse hover:animate-none ${className}`}
      {...props}
    />
  );
};

export default WhatsAppButton; 