import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './contexts/CartContext'
import { NotificationProvider } from './contexts/NotificationContext'

// Import Components
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load page components
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const Checkout = lazy(() => import('./pages/Checkout'))
const Orders = lazy(() => import('./pages/Orders'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Notifications = lazy(() => import('./pages/Notifications'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#663399]"></div>
    <span className="ml-3 text-lg text-[#663399] font-medium">Loading...</span>
  </div>
)

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
    return <LoadingFallback />
  }

  return (
    <NotificationProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
        <Toaster position="top-right" />
        <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/notifications" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Notifications />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </div>
      </CartProvider>
    </NotificationProvider>
  )
}

export default App
