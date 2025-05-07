import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'  // Use env variable or fallback to relative path

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
      const response = await api.post('/customers/login', credentials)
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/customers/register', userData)
      if (response.data.data?.token) {
        localStorage.setItem('authToken', response.data.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.data))
      }
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
    }
  },
  
  logout: async () => {
    try {
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
      const response = await api.get('/products', { params })
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
    }
  },
  
  getProduct: async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
    }
  }
}

// Order Services
export const orderService = {
  getOrders: async () => {
    try {
      const response = await api.get('/orders')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
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
  }
}

// Customer Profile Services
export const profileService = {
  getProfile: async () => {
    try {
      const response = await api.get('/customers/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Network error occurred' }
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
