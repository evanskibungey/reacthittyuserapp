import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './contexts/CartContext'

// Import Pages
import Home from './pages/Home'
import Products from './pages/Products'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import NotFound from './pages/NotFound'

// Import Components
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('authToken')
    setIsLoggedIn(!!token)
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/products" element={<Products setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/checkout" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Checkout />
            </ProtectedRoute>
          } />
          
          {/* Protected Routes */}
          <Route path="/orders" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <OrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
          </Routes>
      </div>
    </CartProvider>
  )
}

export default App
