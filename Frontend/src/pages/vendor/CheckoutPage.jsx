// src/pages/vendor/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Building,
  Truck,
  Shield,
  CheckCircle,
  Package,
  AlertCircle
} from 'lucide-react';
import { createOrder, fetchCart } from '../../store/slices/storeSlice';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart } = useSelector((state) => state.store);
  const { user } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const orderData = {
        paymentMethod,
        notes
      };
      
      const result = await dispatch(createOrder(orderData)).unwrap();
      
      if (result) {
        setStep(3);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      setError(error || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && step !== 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-gray-500">Add some products before checking out</p>
          <Link
            to="/store"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Progress Steps */}
          <div className="lg:col-span-12 mb-8">
            <nav className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {stepNumber}
                    </div>
                    <div className={`ml-2 text-sm font-medium ${
                      step >= stepNumber ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {stepNumber === 1 && 'Review'}
                      {stepNumber === 2 && 'Payment'}
                      {stepNumber === 3 && 'Confirmation'}
                    </div>
                    {stepNumber < 3 && (
                      <div className="ml-4 w-16 h-0.5 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Review Your Order</h2>
                
                {/* Shipping Address (Read-only from vendor profile) */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping To:</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-900 font-medium">
                      {user?.pharmacyInfo?.legalBusinessName || user?.pharmacyInfo?.dba}
                    </p>
                    <p className="text-gray-600">
                      {user?.pharmacyInfo?.shippingAddress?.line1}
                    </p>
                    {user?.pharmacyInfo?.shippingAddress?.line2 && (
                      <p className="text-gray-600">{user.pharmacyInfo.shippingAddress.line2}</p>
                    )}
                    <p className="text-gray-600">
                      {user?.pharmacyInfo?.shippingAddress?.city}, {user?.pharmacyInfo?.shippingAddress?.state} {user?.pharmacyInfo?.shippingAddress?.zipCode}
                    </p>
                    <p className="text-gray-600">Phone: {user?.pharmacyInfo?.phone}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * Shipping address is taken from your vendor profile. To change it, update your profile settings.
                  </p>
                </div>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Order Items</h3>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item._id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            {item.product?.image?.url ? (
                              <img
                                src={item.product.image.url}
                                alt={item.product.productName}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.product?.productName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {item.product?.manufacturer} • Qty: {item.quantity}
                            </p>
                            <p className="text-xs text-gray-400">
                              Vendor: {item.vendorName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatPrice(item.price)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Method</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="flex items-center p-4 border border-gray-300 rounded-md hover:border-blue-500">
                      <input
                        type="radio"
                        id="bank_transfer"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="bank_transfer" className="ml-3 block">
                        <span className="text-sm font-medium text-gray-900">Bank Transfer</span>
                        <span className="text-sm text-gray-500 block">Wire transfer to our bank account</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center p-4 border border-gray-300 rounded-md hover:border-blue-500">
                      <input
                        type="radio"
                        id="wire_transfer"
                        name="paymentMethod"
                        value="wire_transfer"
                        checked={paymentMethod === 'wire_transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="wire_transfer" className="ml-3 block">
                        <span className="text-sm font-medium text-gray-900">Wire Transfer</span>
                        <span className="text-sm text-gray-500 block">International wire transfer</span>
                      </label>
                    </div>
                    
                    <div className="flex items-center p-4 border border-gray-300 rounded-md hover:border-blue-500">
                      <input
                        type="radio"
                        id="check"
                        name="paymentMethod"
                        value="check"
                        checked={paymentMethod === 'check'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="check" className="ml-3 block">
                        <span className="text-sm font-medium text-gray-900">Check</span>
                        <span className="text-sm text-gray-500 block">Mail a check to our office</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Order Notes */}
                  <div className="mt-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any special instructions for your order..."
                    />
                  </div>
                  
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                        disabled={loading}
                      >
                        <ArrowLeft className="w-4 h-4 inline mr-1" />
                        Back to Review
                      </button>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></span>
                            Processing...
                          </>
                        ) : (
                          'Place Order'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
                <p className="mt-2 text-gray-600">
                  Your order has been received and is being processed.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  You will receive an email confirmation shortly.
                </p>
                <div className="mt-8 space-x-4">
                  <Link
                    to="/store/orders"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    View My Orders
                  </Link>
                  <Link
                    to="/store"
                    className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product?.productName}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-xs text-gray-400">{item.vendorName}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>{formatPrice(cart.total)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Shipping</p>
                  <p className="text-gray-600">{formatPrice(0)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <p className="text-gray-600">Tax</p>
                  <p className="text-gray-600">{formatPrice(cart.total * 0.08)}</p>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <p>Total</p>
                  <p>{formatPrice(cart.total + (cart.total * 0.08))}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <p>Secure B2B transaction • Trusted vendors only</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;