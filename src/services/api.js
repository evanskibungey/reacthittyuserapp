import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'  // Use env variable or fallback to localhost URL with port 8000

// Initialize CSRF protection for non-GET requests
const initializeCsrf = async () => {
  try {
    // Laravel's route to get the CSRF cookie
    await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
      withCredentials: true
    });
    console.log('CSRF cookie obtained');
    return true;
  } catch (error) {
    console.error('Failed to initialize CSRF protection:', error);
    return false;
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

// Order Services
export const orderService = {
  getOrders: async () => {
    try {
      const response = await api.get('/orders')
      console.log('Orders API response:', response.data)
      return response.data
    } catch (error) {
      console.error('Order fetch error:', error)
      return { success: false, message: 'Failed to fetch orders', orders: [] }
    }
  },
  
  getOrder: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
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
      return { success: false, message: 'Failed to fetch profile data' }
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/customers/profile', profileData)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
    }
  },
  
  getPoints: async () => {
    try {
      const response = await api.get('/customers/points')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
    }
  },
  
  getPointsHistory: async () => {
    try {
      const response = await api.get('/customers/points/history')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
    }
  }
}

export default api
