// WhatsApp Configuration for Hitty Deliveries
// Update these settings according to your business needs

export const WHATSAPP_CONFIG = {
  // Your WhatsApp Business phone number (without + sign)
  // Format: Country code + phone number (e.g., 254712345678 for Kenya)
  BUSINESS_PHONE: "254712345678",
  
  // Business hours configuration
  BUSINESS_HOURS: {
    timezone: "Africa/Nairobi",
    days: {
      monday: { open: "08:00", close: "18:00", isOpen: true },
      tuesday: { open: "08:00", close: "18:00", isOpen: true },
      wednesday: { open: "08:00", close: "18:00", isOpen: true },
      thursday: { open: "08:00", close: "18:00", isOpen: true },
      friday: { open: "08:00", close: "18:00", isOpen: true },
      saturday: { open: "09:00", close: "17:00", isOpen: true },
      sunday: { open: "10:00", close: "16:00", isOpen: false }
    }
  },
  
  // Default messages configuration
  MESSAGES: {
    // General support message
    SUPPORT: "Hello! I need help with Hitty Deliveries service. Could you please assist me?",
    
    // When customer wants to place an order
    ORDER_INQUIRY: "Hello! I would like to place an order for gas delivery. Please help me with the ordering process and delivery details.",
    
    // Emergency delivery request
    EMERGENCY: "🚨 URGENT: I need emergency gas delivery! My gas has run out and I need immediate delivery. Could you please help me with the fastest delivery option available?",
    
    // Business hours auto-response
    AFTER_HOURS: "Hello! Thank you for contacting Hitty Deliveries. We're currently closed but will respond to your message as soon as possible during business hours (Monday-Friday: 8AM-6PM, Saturday: 9AM-5PM).",
    
    // Welcome message for new customers
    WELCOME: "Hello and welcome to Hitty Deliveries! 🎉 We're here to provide you with fast and reliable gas delivery service. How can we help you today?",
  },
  
  // Feature flags
  FEATURES: {
    // Show business hours indicator
    SHOW_BUSINESS_HOURS: true,
    
    // Auto-append business info to messages
    AUTO_APPEND_INFO: true,
    
    // Show floating WhatsApp button
    SHOW_FLOATING_BUTTON: true,
    
    // Enable click-to-call functionality
    ENABLE_CLICK_TO_CALL: true,
    
    // Track WhatsApp interactions (for analytics)
    TRACK_INTERACTIONS: true
  },
  
  // Business information to append to messages
  BUSINESS_INFO: {
    name: "Hitty Deliveries",
    website: "https://hittydeliveries.com",
    email: "support@hittydeliveries.com",
    deliveryAreas: ["Nairobi", "Kiambu", "Machakos", "Kajiado"],
    averageDeliveryTime: "30-60 minutes"
  }
};

// Helper function to check if business is currently open
export const isBusinessOpen = () => {
  if (!WHATSAPP_CONFIG.FEATURES.SHOW_BUSINESS_HOURS) return true;
  
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = WHATSAPP_CONFIG.BUSINESS_HOURS.days[dayName];
  
  if (!todayHours || !todayHours.isOpen) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Helper function to get next opening time
export const getNextOpeningTime = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const checkDate = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
    const dayName = days[checkDate.getDay()];
    const dayHours = WHATSAPP_CONFIG.BUSINESS_HOURS.days[dayName];
    
    if (dayHours && dayHours.isOpen) {
      return {
        day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        time: dayHours.open,
        date: checkDate.toLocaleDateString()
      };
    }
  }
  
  return null;
};

// Helper function to format business hours for display
export const getBusinessHoursText = () => {
  const hours = WHATSAPP_CONFIG.BUSINESS_HOURS.days;
  let text = "Business Hours:\n";
  
  Object.entries(hours).forEach(([day, info]) => {
    const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
    if (info.isOpen) {
      text += `${dayCapitalized}: ${info.open} - ${info.close}\n`;
    } else {
      text += `${dayCapitalized}: Closed\n`;
    }
  });
  
  return text.trim();
};

export default WHATSAPP_CONFIG; 