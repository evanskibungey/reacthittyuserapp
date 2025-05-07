import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { orderService } from '../services/api'

const OrderDetail = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        
        try {
          // Try to fetch from API
          const response = await orderService.getOrder(id)
          setOrder(response.order || null)
        } catch (err) {
          console.log('API not available, using sample data')
          // Sample data for development
          setOrder({
            order_number: `ORD-2025-000${id}`,
            status: ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)],
            payment_method: 'M-Pesa',
            subtotal: 3000,
            discount: 200,
            total: 2800,
            delivery_address: '123 Main St, Nairobi, Kenya',
            notes: 'Please deliver in the afternoon',
            created_at: '2025-05-01T10:30:00',
            completed_at: '2025-05-01T14:30:00',
            customer: {
              id: 1,
              name: 'John Doe',
              phone: '+254712345678',
              email: 'john@example.com'
            },
            items: [
              {
                product_id: 1,
                product_name: 'LPG 6kg Cylinder',
                quantity: 1,
                unit_price: 1200,
                total: 1200
              },
              {
                product_id: 4,
                product_name: 'Gas Regulator',
                quantity: 1,
                unit_price: 500,
                total: 500
              }
            ]
          })
        }
      } catch (error) {
        console.error('Error fetching order details:', error)
        setError('Failed to load order details. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id])

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    
    return `px-3 py-1 rounded-full text-sm font-medium ${statusMap[status] || 'bg-gray-100 text-gray-800'}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="container mx-auto text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-2"></div>
        Loading order details...
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <Link to="/orders" className="text-blue-600 hover:underline">
            &larr; Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Order not found.
        </div>
        <div className="mt-4">
          <Link to="/orders" className="text-blue-600 hover:underline">
            &larr; Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <Link to="/orders" className="text-blue-600 hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b">
          <div className="flex flex-wrap justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{order.order_number}</h2>
              <p className="text-gray-600">Placed on {formatDate(order.created_at)}</p>
            </div>
            <div>
              <span className={getStatusBadge(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Customer Information</h3>
              <p>{order.customer.name}</p>
              <p>{order.customer.phone}</p>
              {order.customer.email && <p>{order.customer.email}</p>}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Delivery Address</h3>
              <p>{order.delivery_address}</p>
              
              {order.notes && (
                <>
                  <h3 className="font-semibold text-gray-800 mt-4 mb-2">Notes</h3>
                  <p>{order.notes}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right">
                      KSh {item.unit_price.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                      KSh {item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>KSh {order.subtotal.toLocaleString()}</span>
            </div>
            
            {order.discount > 0 && (
              <div className="flex justify-between mb-2 text-green-600">
                <span>Discount</span>
                <span>- KSh {order.discount.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
              <span>Total</span>
              <span>KSh {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 border-t">
          <div className="flex flex-wrap justify-between">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Payment Method</h3>
              <p>{order.payment_method}</p>
            </div>
            
            {order.completed_at && (
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Completed On</h3>
                <p>{formatDate(order.completed_at)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {order.status === 'pending' && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
          <p className="text-yellow-800 mb-2">Your order is pending confirmation.</p>
          <p className="text-gray-600 text-sm">We'll notify you once it's being processed.</p>
        </div>
      )}
      
      {order.status === 'processing' && (
        <div className="text-center p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-blue-800 mb-2">Your order is being prepared for delivery.</p>
          <p className="text-gray-600 text-sm">We'll update you when it's on the way.</p>
        </div>
      )}
      
      {order.status === 'completed' && (
        <div className="text-center p-4 bg-green-50 border border-green-100 rounded-lg">
          <p className="text-green-800 mb-2">Your order has been completed.</p>
          <p className="text-gray-600 text-sm">Thank you for shopping with Hitty Deliveries!</p>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
