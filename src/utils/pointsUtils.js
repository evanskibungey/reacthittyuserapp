/**
 * Points Utility Functions
 * 
 * This file contains utility functions for handling points calculations
 * and formatting based on the updated points system where 10 points = KSh 10
 */

/**
 * Calculate the cash value of points
 * @param {number} points - Number of points
 * @returns {number} - Cash value in KSh
 */
export const calculatePointsValue = (points) => {
  if (!points || points < 0) return 0;
  return Math.floor(points / 10) * 10;
};

/**
 * Calculate how many points are needed to reach the minimum redemption threshold
 * @param {number} currentPoints - Current points balance
 * @param {number} minRedemption - Minimum points required for redemption (default: 100)
 * @returns {number} - Points needed to reach minimum
 */
export const calculatePointsNeeded = (currentPoints = 0, minRedemption = 100) => {
  if (currentPoints >= minRedemption) return 0;
  return minRedemption - currentPoints;
};

/**
 * Check if user has enough points for redemption
 * @param {number} points - Current points balance
 * @param {number} minRequired - Minimum required (default: 100)
 * @returns {boolean} - Whether user can redeem points
 */
export const canRedeemPoints = (points = 0, minRequired = 100) => {
  return points >= minRequired;
};

/**
 * Format points display with value
 * @param {number} points - Number of points
 * @returns {string} - Formatted string showing points and value
 */
export const formatPointsWithValue = (points = 0) => {
  const value = calculatePointsValue(points);
  return `${points} points (worth KSh ${value})`;
};

/**
 * Calculate points earned from order completion
 * @param {number} orderTotal - Order total amount
 * @returns {number} - Points to be earned (always 10 for completed orders)
 */
export const calculateOrderPoints = (orderTotal = 0) => {
  // For orders, customers always earn 10 points regardless of order amount
  return 10;
};

/**
 * Calculate referral bonus points
 * @param {boolean} isFirstOrder - Whether this is the referred customer's first order
 * @returns {number} - Points to be awarded for referral
 */
export const calculateReferralPoints = (isFirstOrder = false) => {
  return isFirstOrder ? 10 : 0;
};

/**
 * Get points status message
 * @param {number} points - Current points balance
 * @returns {object} - Status object with message and type
 */
export const getPointsStatus = (points = 0) => {
  if (points === 0) {
    return {
      message: "Start earning points by placing orders!",
      type: "info",
      canRedeem: false
    };
  }
  
  if (points < 100) {
    const needed = calculatePointsNeeded(points);
    return {
      message: `Need ${needed} more points to redeem`,
      type: "warning",
      canRedeem: false
    };
  }
  
  const value = calculatePointsValue(points);
  return {
    message: `Ready to redeem! Worth KSh ${value}`,
    type: "success",
    canRedeem: true
  };
};

/**
 * Format points history transaction
 * @param {object} transaction - Points transaction object
 * @returns {object} - Formatted transaction with display properties
 */
export const formatPointsTransaction = (transaction) => {
  if (!transaction) return null;
  
  const points = parseInt(transaction.points) || 0;
  const isCredit = points > 0;
  
  return {
    ...transaction,
    isCredit,
    displayPoints: isCredit ? `+${points}` : `${points}`,
    pointsValue: calculatePointsValue(Math.abs(points)),
    formattedDate: new Date(transaction.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
};

/**
 * Validate points redemption amount
 * @param {number} pointsToRedeem - Points user wants to redeem
 * @param {number} availablePoints - Points user currently has
 * @param {number} orderTotal - Total order amount
 * @returns {object} - Validation result with isValid and message
 */
export const validatePointsRedemption = (pointsToRedeem = 0, availablePoints = 0, orderTotal = 0) => {
  // Must redeem at least 100 points
  if (pointsToRedeem < 100) {
    return {
      isValid: false,
      message: "Minimum redemption is 100 points (worth KSh 100)"
    };
  }
  
  // Can't redeem more than available
  if (pointsToRedeem > availablePoints) {
    return {
      isValid: false,
      message: `You only have ${availablePoints} points available`
    };
  }
  
  // Points value cannot exceed order total
  const pointsValue = calculatePointsValue(pointsToRedeem);
  if (pointsValue > orderTotal) {
    return {
      isValid: false,
      message: `Points value (KSh ${pointsValue}) cannot exceed order total (KSh ${orderTotal})`
    };
  }
  
  return {
    isValid: true,
    message: `Redeeming ${pointsToRedeem} points for KSh ${pointsValue} discount`
  };
};

/**
 * Get motivational messages for points earning
 * @param {number} currentPoints - Current points balance
 * @returns {array} - Array of motivational messages
 */
export const getMotivationalMessages = (currentPoints = 0) => {
  const messages = [];
  
  if (currentPoints === 0) {
    messages.push("🎯 Place your first order to earn 10 points!");
    messages.push("👥 Invite friends with your referral code to earn 10 points each!");
  } else if (currentPoints < 100) {
    const needed = calculatePointsNeeded(currentPoints);
    messages.push(`🎯 Just ${needed} more points to unlock redemptions!`);
    messages.push("🛒 Each order earns you 10 points (worth KSh 10)");
  } else {
    const value = calculatePointsValue(currentPoints);
    messages.push(`💰 You have KSh ${value} worth of points ready to use!`);
    messages.push("🎉 Keep earning - points never expire!");
  }
  
  return messages;
};

export default {
  calculatePointsValue,
  calculatePointsNeeded,
  canRedeemPoints,
  formatPointsWithValue,
  calculateOrderPoints,
  calculateReferralPoints,
  getPointsStatus,
  formatPointsTransaction,
  validatePointsRedemption,
  getMotivationalMessages
};
