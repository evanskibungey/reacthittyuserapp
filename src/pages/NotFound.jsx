import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="container mx-auto text-center py-16">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
      <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-block"
      >
        Go Home
      </Link>
    </div>
  )
}

export default NotFound
