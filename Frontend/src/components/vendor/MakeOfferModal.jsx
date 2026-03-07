// components/store/MakeOfferModal.jsx
import React, { useState } from 'react';
import { X, Loader2, DollarSign, Package, MessageSquare, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createOffer } from '../../store/slices/offerSlice';

const MakeOfferModal = ({ isOpen, onClose, product, onSubmit }) => {
  const dispatch = useDispatch();
  const [offerPrice, setOfferPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate offer price
      if (parseFloat(offerPrice) > product.price) {
        setError('Offer price cannot be higher than the original price');
        setIsSubmitting(false);
        return;
      }

      if (parseFloat(offerPrice) <= 0) {
        setError('Please enter a valid offer price');
        setIsSubmitting(false);
        return;
      }

      // Validate quantity
      if (quantity > product.quantityInStock) {
        setError(`Quantity cannot exceed available stock (${product.quantityInStock})`);
        setIsSubmitting(false);
        return;
      }

      const offerData = {
        productId: product._id,
        offerPrice: parseFloat(offerPrice),
        quantity: parseInt(quantity),
        message: message.trim() || undefined
      };

      await dispatch(createOffer(offerData)).unwrap();
      
      // Reset form
      setOfferPrice('');
      setQuantity(1);
      setMessage('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return (parseFloat(offerPrice) || 0) * (parseInt(quantity) || 0);
  };

  const calculateSavings = () => {
    if (!offerPrice || !quantity) return 0;
    const originalTotal = product.price * quantity;
    const offerTotal = parseFloat(offerPrice) * quantity;
    return originalTotal - offerTotal;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full transform animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Make an Offer</h3>
            <p className="text-sm text-gray-500 mt-1">Negotiate with the seller for a better price</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg overflow-hidden flex-shrink-0">
              {product.image?.url ? (
                <img
                  src={product.image.url}
                  alt={product.productName}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-8 h-8 text-teal-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{product.productName}</h4>
              <p className="text-sm text-gray-600 mt-1">NDC: {product.ndcNumber || 'N/A'}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-600">Regular Price:</span>
                <span className="font-bold text-teal-600">${product.price?.toFixed(2)}</span>
                <span className="text-sm text-gray-600">Available Stock:</span>
                <span className="font-semibold text-gray-900">{product.quantityInStock}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Offer Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Offer Price ($) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={product.price}
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Max: ${product.price?.toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  max={product.quantityInStock}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Max: {product.quantityInStock}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Add any additional information or conditions for your offer..."
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Offer Summary */}
          {offerPrice && quantity && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-teal-800 mb-3">Offer Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-teal-700">Offer Price per Unit:</span>
                  <span className="font-semibold text-teal-800">${parseFloat(offerPrice).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-teal-700">Quantity:</span>
                  <span className="font-semibold text-teal-800">{quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-teal-700">Total Offer Amount:</span>
                  <span className="font-semibold text-teal-800">${calculateTotal().toFixed(2)}</span>
                </div>
                {calculateSavings() > 0 && (
                  <div className="flex justify-between text-sm pt-2 border-t border-teal-200">
                    <span className="text-teal-700">Your Savings:</span>
                    <span className="font-semibold text-green-600">${calculateSavings().toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !offerPrice || !quantity}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Offer'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your offer will be sent to the seller for review. They can accept, reject, or counter your offer.
            Offers expire after 7 days.
          </p>
        </form>
      </div>
    </div>
  );
};

export default MakeOfferModal;