import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaMobileAlt, FaMoneyBill, FaCoins } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { orderService, profileService } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, clearCart } = useCart();
  
  // Order summary calculations
  const [orderSummary, setOrderSummary] = useState({
    subtotal: cartSubtotal,
    deliveryFee: cartItems.length > 0 ? 150 : 0,
    discount: 0,
    total: 0
  });

  // Checkout form state
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    deliveryNotes: '',
    paymentMethod: 'mobile_money',
    usePoints: false,
    pointsAmount: 0,
    // Mobile money fields
    mpesaPhone: '',
    mpesaTransactionId: '',
    // Credit account fields
    creditReason: '',
    expectedPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 7 days from now
  });
  
  // Customer state
  const [customer, setCustomer] = useState(null);
  const [customerCreditEligible, setCustomerCreditEligible] = useState(false);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Calculate order summary on cart change
  useEffect(() => {
    const discount = formData.usePoints ? Math.min(formData.pointsAmount, cartSubtotal) : 0;
    const deliveryFee = cartItems.length > 0 ? 150 : 0;
    const total = cartSubtotal + deliveryFee - discount;
    
    setOrderSummary({
      subtotal: cartSubtotal,
      deliveryFee,
      discount,
      total
    });
  }, [cartItems, cartSubtotal, formData.usePoints, formData.pointsAmount]);

  // Fetch customer profile and points balance
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setLoadingCustomer(true);
        setLoadingPoints(true);

        // Get customer profile
        const profileResponse = await profileService.getProfile();
        if (profileResponse.success && profileResponse.data) {
          setCustomer(profileResponse.data);
          // Check if customer has purchase history or meets criteria for credit
          setCustomerCreditEligible(
            profileResponse.data.total_purchases > 2 || 
            (profileResponse.data.hitty_points && profileResponse.data.hitty_points > 1000)
          );
        }
        
        // Get points balance
        const pointsResponse = await profileService.getPoints();
        if (pointsResponse.success && pointsResponse.data) {
          setPointsBalance(pointsResponse.data.hitty_points || 0);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
        // Set default points for development
        setPointsBalance(1000);
        setCustomerCreditEligible(true); // For testing
      } finally {
        setLoadingCustomer(false);
        setLoadingPoints(false);
      }
    };

    fetchCustomerData();
  }, []);
  
  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      // Small delay to prevent immediate redirect during initial load
      const timer = setTimeout(() => {
        navigate('/products');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [cartItems, navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
      
      // Reset points amount if unchecking "Use Points"
      if (name === 'usePoints' && !checked) {
        setFormData({
          ...formData,
          usePoints: false,
          pointsAmount: 0
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle points input
  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const maxPoints = Math.min(pointsBalance, orderSummary.subtotal);
    
    setFormData({
      ...formData,
      pointsAmount: Math.min(value, maxPoints)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare checkout data
      const checkoutData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        })),
        payment_method: formData.paymentMethod,
        notes: `Delivery Address: ${formData.deliveryAddress}, Notes: ${formData.deliveryNotes}`,
        use_points: formData.usePoints,
        points_amount: formData.usePoints ? formData.pointsAmount : 0
      };
      
      // Add payment method specific fields
      if (formData.paymentMethod === 'mobile_money') {
        if (!formData.mpesaPhone || !formData.mpesaTransactionId) {
          throw new Error('Please enter your M-Pesa phone number and transaction ID');
        }
        checkoutData.mpesa_phone = formData.mpesaPhone;
        checkoutData.mpesa_transaction_id = formData.mpesaTransactionId;
      } else if (formData.paymentMethod === 'account') {
        if (!formData.creditReason || !formData.expectedPaymentDate) {
          throw new Error('Please enter a reason for credit and expected payment date');
        }
        checkoutData.credit_reason = formData.creditReason;
        checkoutData.expected_payment_date = formData.expectedPaymentDate;
      }
      
      // Process checkout
      try {
        const response = await orderService.processCheckout(checkoutData);
        
        if (response.success) {
        setSuccessMessage(
          `Order processed successfully! Order #${response.data.transaction_number} has been placed. ${
            response.data.points_earned > 0 ? `You've earned ${response.data.points_earned} Hitty Points!` : ''
          }`
        );
        
        // Clear cart
        clearCart();
        
        // Redirect to order confirmation after a delay
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        setError(response.message || 'Failed to process your order. Please try again.');
      }
      } catch (apiError) {
        console.error('API error during checkout:', apiError);
        setError(apiError?.response?.data?.message || 'Network error occurred. Please try again later.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to process your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-purple-700">Home</Link>
          <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/products" className="hover:text-purple-700">Products</Link>
          <svg className="h-4 w-4 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900">Checkout</span>
        </div>
        
        {/* Page Title */}
        <div className="flex items-center mb-6">
          <Link to="/products" className="mr-4 text-purple-700 hover:text-purple-800">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>
        
        {successMessage ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : null}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Delivery Information</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="deliveryAddress" className="block text-gray-700 font-medium mb-2">
                    Delivery Address
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your delivery address"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="deliveryNotes" className="block text-gray-700 font-medium mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    id="deliveryNotes"
                    name="deliveryNotes"
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Any special instructions for delivery"
                    rows="2"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <div className="space-y-4">
                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${formData.paymentMethod === 'mobile_money' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mobile_money"
                      checked={formData.paymentMethod === 'mobile_money'}
                      onChange={handleInputChange}
                      className="form-radio text-purple-700 h-5 w-5"
                    />
                    <div className="ml-3 flex items-center">
                      <FaMobileAlt className="text-purple-700 mr-2" size={20} />
                      <span className="font-medium text-gray-900">Mobile Money (M-Pesa)</span>
                    </div>
                  </div>
                  <p className="mt-2 ml-8 text-sm text-gray-500">
                    Pay securely using M-Pesa or other mobile money services
                  </p>
                  
                  {formData.paymentMethod === 'mobile_money' && (
                    <div className="mt-4 ml-8 space-y-4">
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                        Please send payment to <span className="font-bold">Pay Bill Number: 765432</span> with account number
                        <span className="font-bold"> HITTY-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                      </p>
                      
                      <div>
                        <label htmlFor="mpesaPhone" className="block text-gray-700 text-sm font-medium mb-1">
                          M-Pesa Phone Number
                        </label>
                        <input
                          type="text"
                          id="mpesaPhone"
                          name="mpesaPhone"
                          value={formData.mpesaPhone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="e.g. 0712345678"
                          required={formData.paymentMethod === 'mobile_money'}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="mpesaTransactionId" className="block text-gray-700 text-sm font-medium mb-1">
                          M-Pesa Transaction ID
                        </label>
                        <input
                          type="text"
                          id="mpesaTransactionId"
                          name="mpesaTransactionId"
                          value={formData.mpesaTransactionId}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          placeholder="e.g. PFX7YTRE29"
                          required={formData.paymentMethod === 'mobile_money'}
                        />
                      </div>
                    </div>
                  )}
                </label>
                
                <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${formData.paymentMethod === 'cash' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleInputChange}
                      className="form-radio text-purple-700 h-5 w-5"
                    />
                    <div className="ml-3 flex items-center">
                      <FaMoneyBill className="text-green-600 mr-2" size={20} />
                      <span className="font-medium text-gray-900">Cash on Delivery</span>
                    </div>
                  </div>
                  <p className="mt-2 ml-8 text-sm text-gray-500">
                    Pay with cash when your order is delivered
                  </p>
                </label>
                
                {customerCreditEligible && (
                  <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${formData.paymentMethod === 'account' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-200'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="account"
                        checked={formData.paymentMethod === 'account'}
                        onChange={handleInputChange}
                        className="form-radio text-purple-700 h-5 w-5"
                      />
                      <div className="ml-3 flex items-center">
                        <FaCreditCard className="text-blue-600 mr-2" size={20} />
                        <span className="font-medium text-gray-900">Credit Account</span>
                      </div>
                    </div>
                    <p className="mt-2 ml-8 text-sm text-gray-500">
                      Pay later - Credit account available for trusted customers
                    </p>
                    
                    {formData.paymentMethod === 'account' && (
                      <div className="mt-4 ml-8 space-y-4">
                        <div>
                          <label htmlFor="creditReason" className="block text-gray-700 text-sm font-medium mb-1">
                            Reason for Credit (Required)
                          </label>
                          <textarea
                            id="creditReason"
                            name="creditReason"
                            value={formData.creditReason}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            placeholder="Why do you need credit for this purchase?"
                            rows="2"
                            required={formData.paymentMethod === 'account'}
                          ></textarea>
                        </div>
                        
                        <div>
                          <label htmlFor="expectedPaymentDate" className="block text-gray-700 text-sm font-medium mb-1">
                            Expected Payment Date
                          </label>
                          <input
                            type="date"
                            id="expectedPaymentDate"
                            name="expectedPaymentDate"
                            value={formData.expectedPaymentDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            required={formData.paymentMethod === 'account'}
                          />
                        </div>
                      </div>
                    )}
                  </label>
                )}
              </div>
            </div>
            
            {/* Hitty Points Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Use Hitty Points</h2>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaCoins className="text-yellow-500 mr-2" size={20} />
                  <span className="font-medium text-gray-900">
                    Your Hitty Points Balance: 
                    {loadingPoints ? (
                      <span className="ml-2 text-gray-500">Loading...</span>
                    ) : (
                      <span className="ml-2 text-purple-700">{pointsBalance} points</span>
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">1 point = 1 KSh</span>
                </div>
              </div>
              
              <div className="flex items-start mb-4">
                <input
                  type="checkbox"
                  id="usePoints"
                  name="usePoints"
                  checked={formData.usePoints}
                  onChange={handleInputChange}
                  className="form-checkbox text-purple-700 h-5 w-5 mt-1"
                  disabled={pointsBalance === 0}
                />
                <div className="ml-3">
                  <label htmlFor="usePoints" className="font-medium text-gray-900">
                    Use my Hitty Points for this purchase
                  </label>
                  <p className="text-sm text-gray-500">
                    Use your points to get a discount on this order
                  </p>
                </div>
              </div>
              
              {formData.usePoints && (
                <div className="mt-4">
                  <label htmlFor="pointsAmount" className="block text-gray-700 font-medium mb-2">
                    Amount of points to use
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="pointsAmount"
                      name="pointsAmount"
                      value={formData.pointsAmount}
                      onChange={handlePointsChange}
                      min="0"
                      max={Math.min(pointsBalance, orderSummary.subtotal)}
                      className="w-1/2 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="ml-4">
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          pointsAmount: Math.min(pointsBalance, orderSummary.subtotal)
                        })}
                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        Use Max Points
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Using {formData.pointsAmount} points will save you KSh {formData.pointsAmount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="border-b pb-4 mb-4">
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-gray-800 font-medium">{item.name}</h3>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                            <p className="font-bold text-gray-900">KSh {item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                )}
              </div>
              
              {/* Price Details */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>KSh {orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>KSh {orderSummary.deliveryFee.toLocaleString()}</span>
                </div>
                {formData.usePoints && formData.pointsAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Discount</span>
                    <span>- KSh {orderSummary.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>KSh {orderSummary.total.toLocaleString()}</span>
                </div>
              </div>
              
              {/* Points earning info */}
              <div className="bg-purple-50 p-3 rounded-lg mb-6 flex items-center">
                <FaCoins className="text-yellow-500 mr-2" size={16} />
                <p className="text-sm text-purple-700">
                  You'll earn approximately <strong>{Math.round(orderSummary.subtotal * 0.1)} Hitty Points</strong> with this purchase!
                </p>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || cartItems.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
                  isSubmitting || cartItems.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
                {!isSubmitting && (
                  <FaCreditCard className="ml-2" />
                )}
              </button>
              
              <p className="mt-4 text-sm text-gray-500 text-center">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
