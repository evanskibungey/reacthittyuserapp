// WhatsApp utility functions for Hitty Deliveries
const BUSINESS_PHONE = "254705898672"; // Replace with your actual WhatsApp business number

/**
 * Generate WhatsApp URL with pre-filled message
 * @param {string} phone - Phone number in international format (without +)
 * @param {string} message - Pre-filled message
 * @returns {string} WhatsApp URL
 */
export const createWhatsAppUrl = (phone = BUSINESS_PHONE, message = "") => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}${message ? `?text=${encodedMessage}` : ''}`;
};

/**
 * Open WhatsApp with pre-filled message
 * @param {string} phone - Phone number in international format (without +)
 * @param {string} message - Pre-filled message
 */
export const openWhatsApp = (phone = BUSINESS_PHONE, message = "") => {
  const url = createWhatsAppUrl(phone, message);
  window.open(url, '_blank');
};

/**
 * Generate general support message
 */
export const getSupportMessage = () => {
  return "Hello! I need help with Hitty Deliveries service. Could you please assist me?";
};

/**
 * Generate order inquiry message
 * @param {Array} products - Array of products user is interested in
 */
export const getOrderInquiryMessage = (products = []) => {
  let message = "Hello! I would like to place an order for gas delivery.\n\n";
  
  if (products.length > 0) {
    message += "Products I'm interested in:\n";
    products.forEach((product, index) => {
      message += `${index + 1}. ${product.name} - KSh ${product.selling_price.toLocaleString()}\n`;
    });
    message += "\n";
  }
  
  message += "Please help me with the ordering process and delivery details.";
  return message;
};

/**
 * Generate order status inquiry message
 * @param {string} orderNumber - Order number
 */
export const getOrderStatusMessage = (orderNumber) => {
  return `Hello! I would like to check the status of my order #${orderNumber}. Could you please provide an update?`;
};

/**
 * Generate delivery inquiry message
 * @param {string} location - Delivery location
 */
export const getDeliveryInquiryMessage = (location = "") => {
  let message = "Hello! I would like to know more about your delivery service.\n\n";
  
  if (location) {
    message += `Delivery location: ${location}\n\n`;
  }
  
  message += "Could you please provide information about:\n";
  message += "• Delivery time\n";
  message += "• Delivery charges\n";
  message += "• Available payment methods\n\n";
  message += "Thank you!";
  
  return message;
};

/**
 * Generate referral sharing message
 * @param {string} referralCode - User's referral code
 */
export const getReferralMessage = (referralCode) => {
  return `🎉 Join Hitty Deliveries and get 10 points (worth KSh 10) on your first order!\n\n` +
         `🚚 Fast gas delivery to your doorstep\n` +
         `💰 Great prices and quality service\n` +
         `📱 Easy ordering through our app\n\n` +
         `Use my referral code: *${referralCode}*\n\n` +
         `Download the app and start saving today!`;
};

/**
 * Generate payment inquiry message
 * @param {string} paymentMethod - Payment method user is asking about
 */
export const getPaymentInquiryMessage = (paymentMethod = "") => {
  let message = "Hello! I have a question about payment methods for my gas delivery order.\n\n";
  
  if (paymentMethod) {
    message += `Specifically, I'd like to know more about: ${paymentMethod}\n\n`;
  }
  
  message += "Could you please provide details about available payment options and how they work?";
  
  return message;
};

/**
 * Generate product inquiry message
 * @param {Object} product - Product details
 */
export const getProductInquiryMessage = (product) => {
  let message = `Hello! I'm interested in the following product:\n\n`;
  message += `📦 Product: ${product.name}\n`;
  message += `💰 Price: KSh ${product.selling_price.toLocaleString()}\n`;
  
  if (product.category) {
    message += `🏷️ Category: ${product.category}\n`;
  }
  
  message += `\nCould you please provide more information about this product and help me place an order?`;
  
  return message;
};

/**
 * Generate emergency gas request message
 */
export const getEmergencyOrderMessage = () => {
  return "🚨 URGENT: I need emergency gas delivery!\n\n" +
         "My gas has run out and I need immediate delivery. " +
         "Could you please help me with the fastest delivery option available?\n\n" +
         "Thank you!";
};

/**
 * Generate feedback/complaint message
 * @param {string} type - 'feedback' or 'complaint'
 * @param {string} orderNumber - Order number (optional)
 */
export const getFeedbackMessage = (type = 'feedback', orderNumber = '') => {
  let message = `Hello! I would like to share ${type} about my experience with Hitty Deliveries.\n\n`;
  
  if (orderNumber) {
    message += `Order Number: #${orderNumber}\n\n`;
  }
  
  message += `Please let me know the best way to provide this ${type}.`;
  
  return message;
};

/**
 * Generate business inquiry message
 */
export const getBusinessInquiryMessage = () => {
  return "Hello! I'm interested in your business/bulk delivery services.\n\n" +
         "Could you please provide information about:\n" +
         "• Bulk pricing\n" +
         "• Regular delivery schedules\n" +
         "• Business account options\n" +
         "• Payment terms\n\n" +
         "Thank you!";
};

/**
 * Get business WhatsApp phone number
 */
export const getBusinessPhone = () => BUSINESS_PHONE;

/**
 * Format phone number to international format
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneForWhatsApp = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 0, replace with 254 (Kenya country code)
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }
  
  // If it doesn't start with 254, add it
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

// Export all functions as named exports and also as default
const whatsappUtils = {
  createWhatsAppUrl,
  openWhatsApp,
  getSupportMessage,
  getOrderInquiryMessage,
  getOrderStatusMessage,
  getDeliveryInquiryMessage,
  getReferralMessage,
  getPaymentInquiryMessage,
  getProductInquiryMessage,
  getEmergencyOrderMessage,
  getFeedbackMessage,
  getBusinessInquiryMessage,
  getBusinessPhone,
  formatPhoneForWhatsApp,
  BUSINESS_PHONE
};

export default whatsappUtils; 