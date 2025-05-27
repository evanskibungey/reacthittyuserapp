import React, { useState, useEffect, useRef } from 'react';
import {
  FaCreditCard,
  FaMobileAlt,
  FaMoneyBill,
  FaCoins,
  FaTimes,
  FaCheckCircle,
} from 'react-icons/fa';
import { useCart } from '../contexts/CartContext';
import { orderService, profileService } from '../services/api';

const CheckoutModal = ({ isOpen, onClose, transactionNotes }) => {
  // Cart context
  const { cartItems, cartSubtotal, clearCart, paymentMethod, paymentFormData } = useCart();

  // Order summary calculations
  const [orderSummary, setOrderSummary] = useState({
    subtotal: cartSubtotal,
    deliveryFee: 0, // Free delivery for all products
    discount: 0,
    total: 0,
  });

  // Checkout form state (simplified - payment method comes from context)
  const [formData, setFormData] = useState({
    deliveryNotes: transactionNotes || '',
    usePoints: false,
    pointsAmount: 0,
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [countdown, setCountdown] = useState(4);
  const countdownRef = useRef(null);

  // Calculate order summary on cart change
  useEffect(() => {
    const discount = formData.usePoints
      ? Math.min(formData.pointsAmount, cartSubtotal)
      : 0;
    const deliveryFee = 0; // Free delivery for all products
    const total = cartSubtotal + deliveryFee - discount;
    setOrderSummary({
      subtotal: cartSubtotal,
      deliveryFee,
      discount,
      total,
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
        if (profileResponse.success && profileResponse.data) {
          setCustomer(profileResponse.data);
          setCustomerCreditEligible(
            profileResponse.data.total_purchases > 2 ||
              (profileResponse.data.hitty_points &&
                profileResponse.data.hitty_points > 1000)
          );
        }
        // Get points balance
        const pointsResponse = await profileService.getPoints();
        if (pointsResponse.success && pointsResponse.data) {
          setPointsBalance(pointsResponse.data.hitty_points || 0);
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
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
        if (checked && pointsBalance >= 100) {
          setFormData({
            ...formData,
            usePoints: checked,
            pointsAmount: 100,
          });
        } else if (!checked) {
          setFormData({
            ...formData,
            usePoints: false,
            pointsAmount: 0,
          });
        }
      } else {
        setFormData({
          ...formData,
          [name]: checked,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle points input
  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const maxPoints = Math.min(pointsBalance, orderSummary.subtotal);
    const validValue = Math.max(value, 100);
    setFormData({
      ...formData,
      pointsAmount: Math.min(validValue, maxPoints),
    });
  };

  // Redirect to orders page
  const redirectToOrders = () => {
    // Get current domain instead of hardcoded localhost
    const currentDomain = window.location.origin;
    
    // Get necessary identifiers from the orderData based on Laravel API response
    if (orderData) {
      // From the Laravel controller, we know the API returns:
      // transaction_number, order_number, and order_id
      const orderId = orderData.order_id || '';
      const orderNumber = orderData.order_number || '';
      const transactionNumber = orderData.transaction_number || '';
      
      // Build URL with correct parameters using current domain
      window.location.href = `${currentDomain}/orders?refresh=${Date.now()}&order_id=${orderId}&order_number=${orderNumber}&transaction=${transactionNumber}`;
    } else {
      window.location.href = `${currentDomain}/orders?refresh=${Date.now()}`;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (
      paymentMethod === 'mobile_money' &&
      (!paymentFormData.mpesaPhone || !paymentFormData.mpesaTransactionId)
    ) {
      setError('Please enter your M-Pesa phone number and transaction ID in the cart');
      return;
    } else if (
      paymentMethod === 'account' &&
      (!paymentFormData.creditReason || !paymentFormData.expectedPaymentDate)
    ) {
      setError('Please enter a reason for credit and expected payment date in the cart');
      return;
    }

    if (formData.usePoints && pointsBalance < 100) {
      setError('You need at least 100 points to use this feature');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const checkoutData = {
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        use_points: formData.usePoints,
      };

      let notesText = '';
      if (customer && customer.location) {
        notesText += `Delivery to: ${customer.location}\n`;
      } else {
        notesText += 'No delivery address provided\n';
      }

      if (formData.deliveryNotes && formData.deliveryNotes.trim()) {
        notesText += `Notes: ${formData.deliveryNotes.trim()}`;
      }

      checkoutData.notes = notesText.trim() || 'Customer Web Order';

      if (formData.usePoints && formData.pointsAmount >= 100) {
        checkoutData.points_amount = formData.pointsAmount;
      }

      if (paymentMethod === 'mobile_money') {
        checkoutData.mpesa_phone = paymentFormData.mpesaPhone;
        checkoutData.mpesa_transaction_id = paymentFormData.mpesaTransactionId;
      } else if (paymentMethod === 'account') {
        checkoutData.credit_reason = paymentFormData.creditReason;
        checkoutData.expected_payment_date = paymentFormData.expectedPaymentDate;
      }

      const response = await orderService.processCheckout(checkoutData);

      if (response.success) {
        const pointsMessage =
          response.data.points_earned > 0
            ? `You've earned ${response.data.points_earned} Hitty Points!`
            : '';
        const statusMessage =
          response.data.status === 'completed'
            ? 'Your order has been confirmed.'
            : 'Your order is pending payment confirmation.';

        setSuccessMessage(
          `Order processed successfully! Order #${response.data.transaction_number} has been placed. ${statusMessage} ${pointsMessage}`
        );
        
        // Store order data for success modal
        setOrderData(response.data);
        
        // Show success modal
        setShowSuccessModal(true);
        
        clearCart();
        
        // Set timeout to redirect after 4 seconds
        setTimeout(() => {
          // Redirect with correct parameters matching the API response
          redirectToOrders();
        }, 4000);
      } else {
        setError(response.message || 'Failed to process your order. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.message === 'Unauthenticated.') {
        setError('You need to log in to complete your order.');
      } else {
        setError(error.message || 'Failed to process your order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set up countdown timer when success modal is shown
  useEffect(() => {
    if (showSuccessModal) {
      // Clear any existing interval
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      // Initialize countdown
      setCountdown(4);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    // Clean up interval on component unmount
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showSuccessModal]);

  if (!isOpen) return null;

  return (
    <>
      {/* Modal overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onClick={onClose}
      ></div>

      {/* Success Modal */}
      {showSuccessModal && orderData && (
        <div className="fixed top-1/2 left-1/2 z-[60] bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="flex flex-col items-center">
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Successful!</h2>
            <p className="text-gray-600 mb-2">
              Your order #{orderData.transaction_number} has been placed.
            </p>
            <p className="text-gray-600 mb-4">
              Status: <span className="font-semibold text-purple-700">{orderData.status}</span>
            </p>
            {orderData.points_earned > 0 && (
              <div className="bg-yellow-50 w-full p-3 rounded-lg mb-4 flex items-center justify-center">
                <FaCoins className="text-yellow-500 mr-2" />
                <p className="text-sm text-purple-700">
                  You've earned <strong>{orderData.points_earned} Hitty Points!</strong>
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-2">
              Redirecting to My Orders in <span className="font-bold">{countdown}</span> seconds...
            </p>
            <button
              onClick={redirectToOrders}
              className="mt-4 bg-purple-700 text-white py-2 px-6 rounded-lg hover:bg-purple-800 transition-colors"
            >
              Go to My Orders Now
            </button>
          </div>
        </div>
      )}

      {/* Main Modal container */}
      <div
        className={`fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto p-4 md:p-6 transform -translate-x-1/2 -translate-y-1/2 flex flex-col md:flex-row ${
          showSuccessModal ? 'opacity-0 pointer-events-none' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="absolute top-0 left-0 w-full flex items-center justify-between p-4 md:p-6 z-10 bg-white rounded-t-2xl border-b border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-purple-700 tracking-tight">Checkout</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-full p-1"
          >
            <FaTimes size={28} />
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col md:flex-row w-full pt-16 gap-8">
          {/* Left panel: Delivery Information */}
          <div className="flex-1 md:w-2/3 min-w-0">
            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Information</h3>
              <div className="mb-4">
                <label htmlFor="deliveryAddress" className="block text-gray-700 font-medium mb-2">
                  Delivery Address
                </label>
                {loadingCustomer ? (
                  <div className="w-full h-12 border border-gray-300 rounded-lg p-3 bg-gray-100 animate-pulse"></div>
                ) : customer && customer.location ? (
                  <div className="w-full border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-700 min-h-[42px]">
                    {customer.location}
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      id="tempAddress"
                      name="tempAddress"
                      value={formData.tempAddress || ''}
                      onChange={handleInputChange}
                      placeholder="Enter delivery address"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      This address will only be used for this order. Update your profile to save it permanently.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Selected Payment Method Display */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Payment Method</h3>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                {paymentMethod === 'cash' && (
                  <>
                    <FaMoneyBill className="text-green-600 text-xl mr-3" />
                    <div>
                      <span className="font-medium text-green-700 block">Cash on Delivery</span>
                      <span className="text-sm text-gray-500">Pay when your order is delivered</span>
                    </div>
                  </>
                )}
                {paymentMethod === 'mobile_money' && (
                  <>
                    <FaMobileAlt className="text-purple-600 text-xl mr-3" />
                    <div>
                      <span className="font-medium text-purple-700 block">M-Pesa</span>
                      <span className="text-sm text-gray-500">Phone: {paymentFormData.mpesaPhone}</span>
                    </div>
                  </>
                )}
                {paymentMethod === 'account' && (
                  <>
                    <FaCreditCard className="text-blue-600 text-xl mr-3" />
                    <div>
                      <span className="font-medium text-blue-700 block">Credit Account</span>
                      <span className="text-sm text-gray-500">Payment due: {paymentFormData.expectedPaymentDate}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                To change payment method, go back to your cart and select a different option.
              </p>
            </div>
          </div>

          {/* Right panel: Order Summary */}
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8 border border-gray-200">
              {/* Error Message */}
              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Text Success Message - now hidden when success modal is shown */}
              {successMessage && !showSuccessModal && (
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <span className="block sm:inline">{successMessage}</span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>

              {/* Cart Items */}
              <div className="max-h-60 overflow-y-auto pr-2 mb-4">
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-start space-x-4 pb-3 border-b last:border-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-contain bg-gray-100 p-2 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="text-gray-800 font-medium">{item.name}</h4>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="font-semibold text-gray-900">
                              KSh {item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">Your cart is empty</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>KSh {orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">FREE</span>
                </div>
                {formData.usePoints && formData.pointsAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Points Discount</span>
                    <span>- KSh {orderSummary.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t">
                  <span>Total</span>
                  <span>KSh {orderSummary.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Points Info */}
              <div className="bg-purple-50 p-3 rounded-lg mb-6 flex items-center border-l-4 border-yellow-500">
                <FaCoins className="text-yellow-500 mr-2" />
                <p className="text-sm text-purple-700">
                  You'll earn <strong>10 Hitty Points (worth KSh 10)</strong> when your order is completed!
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                onClick={handleSubmit}
                className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center transition-all ${
                  isSubmitting || cartItems.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-700 text-white hover:bg-purple-800 shadow-md hover:shadow-lg'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
                {!isSubmitting && <FaCreditCard className="ml-2" />}
              </button>
              <p className="mt-4 text-xs text-gray-500 text-center">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>  
      </div>
    </>
  );
};

export default CheckoutModal;