import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />
  }
  
  // Render the protected component
  return children
}

export default ProtectedRoute
