import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaCreditCard, FaMobileAlt, FaMoneyBill, FaCoins, FaTimes } from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { orderService, profileService } from '../services/api';

// CheckoutModal: Centered modal for full checkout experience
const CheckoutModal = ({ isOpen, onClose, transactionNotes }) => {
  // Cart context
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
    deliveryNotes: transactionNotes || '',
    paymentMethod: 'mobile_money',
    usePoints: false,
    pointsAmount: 0,
    // Mobile money fields
    mpesaPhone: '',
    mpesaTransactionId: '',
    // Credit account fields
    creditReason: '',
    expectedPaymentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
    if (!isOpen) return;
    const fetchCustomerData = async () => {
      try {
        setLoadingCustomer(true);
        setLoadingPoints(true);
        // Get customer profile
        const profileResponse = await profileService.getProfile();
        console.log('Customer profile response:', profileResponse);
        if (profileResponse.success && profileResponse.data) {
          setCustomer(profileResponse.data);
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
        // Don't set fake data in production
      } finally {
        setLoadingCustomer(false);
        setLoadingPoints(false);
      }
    };
    fetchCustomerData();
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'usePoints') {
        // When enabling points, set initial amount to minimum 100 if available
        if (checked && pointsBalance >= 100) {
          setFormData({
            ...formData,
            usePoints: checked,
            pointsAmount: 100 // Start with minimum 100 points
          });
        } else if (!checked) {
          // When disabling, reset points amount
          setFormData({
            ...formData,
            usePoints: false,
            pointsAmount: 0
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: checked
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
    // Enforce minimum 100 points if using points
    const validValue = Math.max(value, 100);
    setFormData({
      ...formData,
      pointsAmount: Math.min(validValue, maxPoints)
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validate form based on payment method
    if (formData.paymentMethod === 'mobile_money' && (!formData.mpesaPhone || !formData.mpesaTransactionId)) {
      setError('Please enter your M-Pesa phone number and transaction ID');
      return;
    } else if (formData.paymentMethod === 'account' && (!formData.creditReason || !formData.expectedPaymentDate)) {
      setError('Please enter a reason for credit and expected payment date');
      return;
    }
    
    // Validate points usage - minimum 100 points required
    if (formData.usePoints && pointsBalance < 100) {
      setError('You need at least 100 points to use this feature');
      return;
    }
    
    try {
    setIsSubmitting(true);
    setError(null);
    
    // Prepare checkout data with items formatted exactly as backend expects
    const checkoutData = {
    items: cartItems.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
    })),
    payment_method: formData.paymentMethod,
    use_points: formData.usePoints
    };
    
    // Format delivery information and notes
    let notesText = '';
    
    // Add delivery location if available
    if (customer && customer.location) {
      notesText += `Delivery to: ${customer.location}\n`;
    } else {
      notesText += 'No delivery address provided\n';
    }
    
    // Add delivery notes if provided
    if (formData.deliveryNotes && formData.deliveryNotes.trim()) {
      notesText += `Notes: ${formData.deliveryNotes.trim()}`;
    }
    
    // Set the notes in the checkout data
    checkoutData.notes = notesText.trim() || 'Customer Web Order';
    
    // Only include points_amount if use_points is true
    if (formData.usePoints && formData.pointsAmount >= 100) {
      checkoutData.points_amount = formData.pointsAmount;
    }
    
    // Add payment method specific fields
    if (formData.paymentMethod === 'mobile_money') {
    checkoutData.mpesa_phone = formData.mpesaPhone;
    checkoutData.mpesa_transaction_id = formData.mpesaTransactionId;
    } else if (formData.paymentMethod === 'account') {
    checkoutData.credit_reason = formData.creditReason;
    checkoutData.expected_payment_date = formData.expectedPaymentDate;
    }
    
    console.log('Sending checkout data:', checkoutData);
    
    // Process checkout
    const response = await orderService.processCheckout(checkoutData);
      
      if (response.success) {
        const pointsMessage = response.data.points_earned > 0 
          ? `You've earned ${response.data.points_earned} Hitty Points!` 
          : '';
          
        const statusMessage = response.data.status === 'completed'
          ? 'Your order has been confirmed.'
          : 'Your order is pending payment confirmation.';
        
        setSuccessMessage(
          `Order processed successfully! Order #${response.data.transaction_number} has been placed. ${statusMessage} ${pointsMessage}`
        );
        
        clearCart();
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(response.message || 'Failed to process your order. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Handle authentication error specifically
      if (error.message === 'Unauthenticated.') {
        setError('You need to log in to complete your order.');
      } else {
        setError(error.message || 'Failed to process your order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}></div>
      {/* Modal container */}
      <div className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto p-6 transform -translate-x-1/2 -translate-y-1/2 flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-purple-700">Checkout</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <FaTimes size={28} />
          </button>
        </div>
        {/* Success/Error Messages */}
        {successMessage ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : null}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
          {/* Left: Delivery, Points */}
          <div className="flex-1 min-w-0">
            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Delivery Information</h3>
              {/* Show delivery address from profile and option to add a new one */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Delivery Address
                </label>
                
                {/* Customer location display or input */}
                {loadingCustomer ? (
                  <div className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500 min-h-[42px]">
                    Loading address...
                  </div>
                ) : customer && customer.location ? (
                  <div className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-700 min-h-[42px]">
                    {customer.location}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full border border-gray-300 rounded-lg p-3 bg-gray-100 text-gray-500">
                      No address found in your profile
                    </div>
                    
                    {/* Allow customer to enter a temporary address */}
                    <input
                      type="text"
                      name="tempAddress"
                      value={formData.tempAddress || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your delivery address for this order"
                    />
                    <p className="text-xs text-gray-500">
                      This address will only be used for this order. Update your profile to save an address permanently.
                    </p>
                  </div>
                )}
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
            </div>
            {/* Payment Method Section */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Payment Method</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {/* Cash on Delivery */}
                <div 
                  className={`border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-200 bg-white'}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'cash'})}
                >
                  <FaMoneyBill className="text-green-600 text-xl mb-2" />
                  <span className="font-bold text-green-700">Cash on Delivery</span>
                </div>
                {/* M-Pesa */}
                <div 
                  className={`border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.paymentMethod === 'mobile_money' ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 bg-white'}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'mobile_money'})}
                >
                  <FaMobileAlt className="text-purple-600 text-xl mb-2" />
                  <span className="font-bold text-purple-700">M-Pesa</span>
                </div>
                {/* Credit Account */}
                <div 
                  className={`border rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer transition-all ${formData.paymentMethod === 'account' ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 bg-white'}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'account'})}
                >
                  <FaCreditCard className="text-blue-600 text-xl mb-2" />
                  <span className="font-bold text-blue-700">Credit</span>
                </div>
              </div>
              
              {/* Payment method specific fields */}
              {formData.paymentMethod === 'mobile_money' && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-3">M-Pesa Payment Details</h4>
                  <div className="mb-3">
                    <label htmlFor="mpesaPhone" className="block text-gray-700 text-sm font-medium mb-1">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="text"
                      id="mpesaPhone"
                      name="mpesaPhone"
                      value={formData.mpesaPhone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. 0712345678"
                    />
                  </div>
                  <div className="mb-1">
                    <label htmlFor="mpesaTransactionId" className="block text-gray-700 text-sm font-medium mb-1">
                      M-Pesa Transaction ID
                    </label>
                    <input
                      type="text"
                      id="mpesaTransactionId"
                      name="mpesaTransactionId"
                      value={formData.mpesaTransactionId}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. QJI12345XZ"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    First make the payment via M-Pesa to Till Number <strong>123456</strong> and enter the details here.
                  </p>
                </div>
              )}
              
              {formData.paymentMethod === 'account' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Credit Account Details</h4>
                  <div className="mb-3">
                    <label htmlFor="creditReason" className="block text-gray-700 text-sm font-medium mb-1">
                      Reason for Credit
                    </label>
                    <textarea
                      id="creditReason"
                      name="creditReason"
                      value={formData.creditReason}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please explain why you need credit for this purchase"
                      rows="2"
                    ></textarea>
                  </div>
                  <div className="mb-1">
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
                      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Credit purchases require approval and must be paid by the date specified.
                  </p>
                </div>
              )}
            </div>
            
            {/* Hitty Points Section */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Use Hitty Points</h3>
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
                  disabled={pointsBalance < 100}
                />
                <div className="ml-3">
                  <label htmlFor="usePoints" className="font-medium text-gray-900">
                    Use my Hitty Points for this purchase
                  </label>
                  <p className="text-sm text-gray-500">
                    {pointsBalance < 100 ? 
                      "You need at least 100 points to use this feature" : 
                      "Use your points to get a discount on this order"}
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
                      min="100"
                      max={Math.min(pointsBalance, orderSummary.subtotal)}
                      className="w-1/2 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="ml-4">
                      <button
                        type="button"
                        onClick={() => {
                          const maxAvailablePoints = Math.min(pointsBalance, orderSummary.subtotal);
                          setFormData({
                            ...formData,
                            pointsAmount: Math.max(100, maxAvailablePoints)
                          });
                        }}
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
          {/* Right: Order Summary */}
          <div className="w-full md:w-96 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
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
                          <h4 className="text-gray-800 font-medium">{item.name}</h4>
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
                  You'll earn <strong>10 Hitty Points</strong> when your order is completed!
                </p>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
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
        </form>
      </div>
    </>
  );
};

export default CheckoutModal; 