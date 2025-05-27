// Stock threshold constants - easy to modify in one place
export const STOCK_THRESHOLDS = {
  LOW_STOCK: 10,
  OUT_OF_STOCK: 0
};

// Get stock status object with label, colors, and icon
// Always show "In Stock" regardless of actual stock levels
export const getStockStatus = (currentStock = 0) => {
  return {
    label: 'In Stock',
    status: 'in_stock',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    dotColor: 'bg-green-600'
  };
};

// Helper function to get size classes for badges
export const getSizeClasses = (size = 'sm', withBackground = false) => {
  if (withBackground) {
    return {
      xs: 'text-xs px-2 py-1',
      sm: 'text-sm px-2.5 py-1', 
      md: 'text-base px-3 py-1.5',
      lg: 'text-lg px-4 py-2'
    }[size];
  } else {
    return {
      xs: 'text-xs px-1.5 py-0.5',
      sm: 'text-sm px-2 py-0.5', 
      md: 'text-base px-2.5 py-1',
      lg: 'text-lg px-3 py-1.5'
    }[size];
  }
};

// Check if product is available for purchase
export const isProductAvailable = (currentStock = 0) => {
  return currentStock > STOCK_THRESHOLDS.OUT_OF_STOCK;
};

// Get stock level as percentage (useful for progress bars)
export const getStockLevelPercentage = (currentStock = 0, maxStock = 100) => {
  return Math.min((currentStock / maxStock) * 100, 100);
};

// Get stock warning message - disabled since we always show "In Stock"
export const getStockWarningMessage = (currentStock = 0) => {
  return null; // No warnings shown since we always display "In Stock"
}; 