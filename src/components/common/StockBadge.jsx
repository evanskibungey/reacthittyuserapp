import React from 'react';
import { FaCheck } from 'react-icons/fa';
import { getStockStatus, getSizeClasses } from '../../utils/stockUtils';

// Stock badge component for consistent display
export const StockBadge = ({ 
  currentStock, 
  className = '', 
  showIcon = true, 
  showDot = true,
  size = 'sm' 
}) => {
  const status = getStockStatus(currentStock);
  const sizeClass = getSizeClasses(size, false);
  
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${status.color} ${sizeClass} ${className}`}>
      {showIcon && <FaCheck className="mr-1" size={12} />}
      {showDot && !showIcon && (
        <div className={`w-2 h-2 ${status.dotColor} rounded-full mr-1`}></div>
      )}
      {status.label}
    </span>
  );
};

// Alternative badge with background color
export const StockBadgeWithBg = ({ 
  currentStock, 
  className = '', 
  showIcon = true,
  size = 'sm' 
}) => {
  const status = getStockStatus(currentStock);
  const sizeClass = getSizeClasses(size, true);
  
  return (
    <span className={`inline-flex items-center font-medium rounded-md ${status.color} ${status.bgColor} ${sizeClass} ${className}`}>
      {showIcon && <FaCheck className="mr-1" size={12} />}
      {status.label}
    </span>
  );
};

export default StockBadge; 