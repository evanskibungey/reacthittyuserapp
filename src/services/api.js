import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'  // Use env variable or fallback to localhost URL with port 8000

// Initialize CSRF protection for non-GET requests
const initializeCsrf = async () => {
  try {
    // Use environment variable for base URL or fallback
    const baseUrl = import.meta.env.VITE_LARAVEL_BASE_URL || 'http://127.0.0.1:8000';
    await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true
    });
    console.log('CSRF cookie obtained successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
    console.error('Check if Laravel server is running on the correct port');
    return false;
  }
};

// Test connection to Laravel backend
export const testConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/test-connection`, {
      timeout: 5000
    });
    return { success: true, message: 'Connection successful', data: response.data };
  } catch (error) {
    return { 
      success: false, 
      message: 'Connection failed', 
      error: error.message,
      details: error.response?.data
    };
  }
};

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // This is important for Laravel to recognize the request as AJAX
  },
  withCredentials: true // This is important for CSRF protection and cookies
})

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth Services
export const authService = {
  login: async (credentials) => {
    try {
      // Get CSRF cookie first
      await initializeCsrf();
      
      const response = await api.post('/customers/login', credentials)
      if (response.data.success && response.data.data && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
      return response.data
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data
      } else {
        throw { message: 'Network error occurred' }
      }
    }
  },
  
  register: async (userData) => {
    try {
      // Get CSRF cookie first
      await initializeCsrf();
      
      console.log('Sending registration data:', { ...userData, password: '***', password_confirmation: '***' });
      console.log('API URL:', API_URL + '/customers/register');
      
      const response = await api.post('/customers/register', userData);
      console.log('Registration response:', response);
      
      if (response.data.success && response.data.data && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Print the entire error object for debugging
      console.log('Full error object:', JSON.stringify(error, null, 2));
      
      if (error.response) {
        console.error('Server responded with:', error.response.status, error.response.data);
        return { 
          success: false, 
          message: error.response.data.message || 'Registration failed', 
          errors: error.response.data.errors 
        };
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw { message: 'No response from server. Please check your connection.' };
      } else {
        console.error('Request setup error:', error.message);
        throw { message: `Request failed: ${error.message}` };
      }
    }
  },
  
  logout: async () => {
    try {
      // Get CSRF cookie first
      await initializeCsrf();
      
      await api.post('/customers/logout')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      return { success: true }
    } catch (error) {
      // Even if the API call fails, clear local storage
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      throw error.response?.data || { message: 'Network error occurred' }
    }
  }
}

// Product Services
export const productService = {
  getProducts: async (params = {}) => {
    try {
      console.log('API call to:', API_URL + '/products', 'with params:', params);
      const response = await api.get('/products', { params });
      console.log('Raw API response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Check for different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server error response:', error.response.data);
        throw error.response.data || { message: 'Server error occurred' };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        throw { message: 'No response from server. Please check your connection.' };
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        throw { message: 'Network error occurred' };
      }
    }
  },
  
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching product details:', error)
      throw error.response?.data || { message: 'Network error occurred' }
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/categories')
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error.response?.data || { message: 'Network error occurred' }
    }
  }
}

// Notification Services
export const notificationService = {
  getNotifications: async (params = {}) => {
    try {
      // Add a timestamp to prevent caching
      const timestamp = Date.now();
      const queryParams = { ...params, _t: timestamp };
      
      const response = await api.get('/notifications', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, message: 'Failed to fetch notifications', data: [] };
    }
  },
  
  markAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: 'Failed to mark notification as read' };
    }
  },
  
  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, message: 'Failed to mark all notifications as read' };
    }
  }
}

// Inquiry Services
export const inquiryService = {
  submitInquiry: async (inquiryData) => {
    try {
      console.log('Submitting inquiry data:', inquiryData);
      const response = await api.post('/inquiries', inquiryData);
      console.log('Inquiry submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      
      // Check for different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Server error response:', error.response.data);
        return { 
          success: false, 
          message: error.response.data?.message || 'Server error occurred',
          errors: error.response.data?.errors
        };
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        return { 
          success: false, 
          message: 'No response from server. Please check your connection.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        return { 
          success: false, 
          message: 'Network error occurred'
        };
      }
    }
  }
};

// Order Services
export const orderService = {
  getOrders: async (params = {}) => {
    try {
      // Add a timestamp to prevent caching
      const timestamp = Date.now();
      const queryParams = { ...params, _t: timestamp };
      
      console.log('Fetching orders with params:', queryParams);
      const response = await api.get('/orders', { params: queryParams });
      console.log('Orders API response:', response.data);
      
      // The Laravel API returns { success: true, data: [...orders], meta: {...} }
      // Transform the response to match expected format for the React app
      if (response.data && response.data.success) {
        // Map Laravel order statuses to more user-friendly ones if needed
        const orders = (response.data.data || []).map(order => {
          // Normalize status values to match our UI expectations
          if (order.status === 'completed') {
            order.displayStatus = 'Delivered';
          } else if (order.status === 'processing') {
            order.displayStatus = 'Ready for Pickup';
          } else if (order.status === 'in_transit') {
            order.displayStatus = 'In Transit';
          } else if (order.status === 'cancelled') {
            order.displayStatus = 'Cancelled';
          } else {
            order.displayStatus = 'Order Received';
          }
          return order;
        });
        
        return {
          success: true,
          orders: orders,
          meta: response.data.meta
        };
      } else {
        console.error('Invalid order response format:', response.data);
        return { success: false, message: 'Failed to fetch orders', orders: [] };
      }
    } catch (error) {
      console.error('Order fetch error:', error);
      return { success: false, message: 'Failed to fetch orders', orders: [] };
    }
  },
  
  getOrder: async (id) => {
    try {
      // Add a timestamp to prevent caching
      const timestamp = Date.now();
      
      console.log(`Fetching order details for ID: ${id}`);
      const response = await api.get(`/orders/${id}`, { 
        params: { _t: timestamp } 
      });
      console.log('Order details API response:', response.data);
      
      // Transform the response to match the expected format
      if (response.data && response.data.success) {
        const order = response.data.data || null;
        
        // Add display status for UI
        if (order) {
          if (order.status === 'completed') {
            order.displayStatus = 'Delivered';
          } else if (order.status === 'processing') {
            order.displayStatus = 'Ready for Pickup';
          } else if (order.status === 'in_transit') {
            order.displayStatus = 'In Transit';
          } else if (order.status === 'cancelled') {
            order.displayStatus = 'Cancelled';
          } else {
            order.displayStatus = 'Order Received';
          }
          
          // Calculate progress percentage for order tracking
          if (order.status === 'completed') {
            order.progressPercentage = 100;
          } else if (order.status === 'in_transit') {
            order.progressPercentage = 75;
          } else if (order.status === 'processing') {
            order.progressPercentage = 50;
          } else if (order.status === 'pending') {
            order.progressPercentage = 25;
          } else if (order.status === 'cancelled') {
            order.progressPercentage = 100;
          } else {
            order.progressPercentage = 0;
          }
        }
        
        return {
          success: true,
          order: order
        };
      } else {
        console.error('Invalid order details response format:', response.data);
        return { 
          success: false, 
          message: response.data?.message || 'Failed to fetch order details'
        };
      }
    } catch (error) {
      console.error('Order details fetch error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to fetch order details',
        error: error.message 
      };
    }
  },
  
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
    }
  },

  processCheckout: async (checkoutData) => {
    try {
      console.log('Sending checkout data to API:', checkoutData);
      
      // Format the items to match the expected backend format
      // Remove any discount field from items to avoid the 'Column not found' error
      if (checkoutData.items && Array.isArray(checkoutData.items)) {
        checkoutData.items = checkoutData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
          // Don't include discount or other fields not in database schema
        }));
      }
      
      const response = await api.post('/checkout', checkoutData);
      console.log('Checkout API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Checkout error:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      throw error.response?.data || { message: 'Network error occurred' };
    }
  },
  
  // New method: Poll for order updates
  pollOrderStatus: async (orderId, interval = 30000) => {
    if (!orderId) return null;
    
    // Create a promise that will resolve when the order reaches a final state
    // or will be manually rejected if needed
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const response = await orderService.getOrder(orderId);
          
          if (!response.success) {
            console.error('Failed to poll order status:', response.message);
            return; // Continue polling even if there's an error
          }
          
          const order = response.order;
          
          // If order has reached a final state or payment status has updated for cash payment
          if (order.status === 'completed' || order.status === 'cancelled' || 
              (order.payment_method === 'cash' && order.payment_status === 'paid')) {
            console.log('Order reached final state or payment status updated:', order);
            resolve(order);
            return;
          }
          
          // Otherwise, continue polling
          setTimeout(checkStatus, interval);
        } catch (error) {
          console.error('Error polling order status:', error);
          // Continue polling even if there's an error
          setTimeout(checkStatus, interval);
        }
      };
      
      // Start polling
      checkStatus();
      
      // Allow manual cancellation of polling
      return {
        cancel: () => reject(new Error('Order polling cancelled'))
      };
    });
  }
}

// Customer Profile Services
export const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get('/customers/profile')
      console.log('Profile API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Profile fetch error:', error)
      // Check for different types of errors and provide clear messages
      if (error.response) {
        // The server responded with an error status
        return { 
          success: false, 
          message: error.response.data?.message || 'Server error. Please try again.'
        };
      } else if (error.request) {
        // The request was made but no response received
        return { 
          success: false, 
          message: 'No response from server. Please check your connection.'
        };
      } else {
        return { success: false, message: 'Failed to fetch profile data' }
      }
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      // Get CSRF cookie first for non-GET requests
      await initializeCsrf();
      
      const response = await api.put('/customers/profile', profileData)
      console.log('Update profile response:', response.data)
      return response.data
    } catch (error) {
      console.error('Profile update error:', error)
      if (error.response?.data) {
        return error.response.data
      } else {
        throw { message: 'Network error occurred' }
      }
    }
  },
  
  getPoints: async () => {
    try {
      const response = await api.get('/customers/points')
      console.log('Points API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Points fetch error:', error)
      return { success: false, message: 'Failed to fetch points data' }
    }
  },
  
  getPointsHistory: async (limit = 10) => {
    try {
      const response = await api.get('/customers/points/history', {
        params: { limit }
      })
      console.log('Points history API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Points history fetch error:', error)
      return { success: false, message: 'Failed to fetch points history' }
    }
  },
  
  getReferralInfo: async () => {
    try {
      const response = await api.get('/customers/referrals')
      console.log('Referral API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Referral info fetch error:', error)
      return { success: false, message: 'Failed to fetch referral information' }
    }
  }
}

export default api
