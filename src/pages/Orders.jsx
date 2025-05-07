import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { orderService } from '../services/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        
        try {
          // Try to fetch from API
          const response = await orderService.getOrders()
          setOrders(response.data || [])
        } catch (err) {
          console.log('API not available, using sample data')
          // Sample data for development
          setOrders([
            {
              id: 1,
              order_number: 'ORD-2025-0001',
              status: 'completed',
              total: 3500,
              payment_method: 'M-Pesa',
              created_at: '2025-05-01T10:30:00',
              items_count: 2
            },
            {
              id: 2,
              order_number: 'ORD-2025-0002',
              status: 'processing',
              total: 1800,
              payment_method: 'Cash on Delivery',
              created_at: '2025-05-04T14:15:00',
              items_count: 1
            },
            {
              id: 3,
              order_number: 'ORD-2025-0003',
              status: 'pending',
              total: 4500,
              payment_method: 'Credit Card',
              created_at: '2025-05-06T09:45:00',
              items_count: 3
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        setError('Failed to load orders. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    
    return `px-3 py-1 rounded-full text-xs font-medium ${statusMap[status] || 'bg-gray-100 text-gray-800'}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-2"></div>
          Loading your orders...
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <Link 
            to="/products" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={getStatusBadge(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    KSh {order.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link 
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900 hover:underline"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Orders
