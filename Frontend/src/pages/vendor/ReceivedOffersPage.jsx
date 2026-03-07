// src/pages/vendor/ReceivedOffersPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import {
  Gift,
  Check,
  X,
  DollarSign,
  Loader2,
  Package,
  Clock,
  AlertCircle,
  Eye,
  Filter,
  RotateCcw,
  Pill,
  ArrowLeft,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ShoppingBag
} from 'lucide-react';
import {
  fetchReceivedOffers,
  acceptOffer,
  rejectOffer,
  counterOffer,
  fetchOfferCounts,
  clearOfferError,
  clearSuccessMessage
} from '../../store/slices/offerSlice';

// Counter Offer Modal
const CounterOfferModal = ({ isOpen, onClose, offer, onSubmit, isSubmitting }) => {
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');

  useEffect(() => {
    if (isOpen && offer) {
      setCounterPrice('');
      setCounterMessage('');
    }
  }, [isOpen, offer?._id]);

  if (!isOpen || !offer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!counterPrice || parseFloat(counterPrice) <= 0) return;
    onSubmit({
      offerId: offer._id,
      counterPrice: parseFloat(counterPrice),
      counterMessage: counterMessage.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-2xl px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Counter Offer
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
            <p className="font-semibold text-gray-900">{offer.productName}</p>
            <div className="flex justify-between">
              <span className="text-gray-500">Buyer's Offer:</span>
              <span className="font-medium text-blue-600">${offer.offerPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Original Price:</span>
              <span className="font-medium text-gray-700">${offer.originalPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Quantity:</span>
              <span className="font-medium text-gray-700">{offer.quantity}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Counter Price ($) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                required
                className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your counter price"
              />
            </div>
            {counterPrice && (
              <p className="text-xs text-gray-500 mt-1">
                Total: ${(parseFloat(counterPrice || 0) * offer.quantity).toFixed(2)} for {offer.quantity} units
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Message <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              rows="2"
              maxLength={500}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              placeholder="Explain your counter price..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !counterPrice || parseFloat(counterPrice) <= 0}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Counter Offer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reject Offer Modal
const RejectOfferModal = ({ isOpen, onClose, offer, onSubmit, isSubmitting }) => {
  const [reason, setReason] = useState('');

  if (!isOpen || !offer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ offerId: offer._id, reason: reason.trim() });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-t-2xl px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <X className="w-5 h-5" />
              Reject Offer
            </h3>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-4">
          <div className="bg-red-50 rounded-xl p-3 text-sm">
            <p className="text-red-800">
              Are you sure you want to reject this offer from <strong>{offer.buyerVendorName}</strong> for{' '}
              <strong>{offer.productName}</strong>?
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Rejection Reason <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="2"
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              placeholder="Let the buyer know why..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-rose-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rejecting...
                </span>
              ) : (
                'Reject Offer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReceivedOffersPage = () => {
  const dispatch = useDispatch();
  const {
    receivedOffers,
    receivedPagination,
    loading,
    actionLoading,
    error,
    actionError,
    successMessage
  } = useSelector((state) => state.offers);

  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOffer, setExpandedOffer] = useState(null);
  const [counterModalOffer, setCounterModalOffer] = useState(null);
  const [rejectModalOffer, setRejectModalOffer] = useState(null);

  useEffect(() => {
    dispatch(fetchReceivedOffers({ page: 1, limit: 10, status: statusFilter === 'all' ? '' : statusFilter }));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        duration: 4000,
        style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }
      });
      dispatch(clearSuccessMessage());
      dispatch(fetchReceivedOffers({ page: 1, limit: 10, status: statusFilter === 'all' ? '' : statusFilter }));
      dispatch(fetchOfferCounts());
    }
  }, [successMessage, dispatch, statusFilter]);

  useEffect(() => {
    if (actionError) {
      toast.error(actionError, {
        duration: 4000,
        style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px' }
      });
      dispatch(clearOfferError());
    }
  }, [actionError, dispatch]);

  const handleAcceptOffer = async (offerId) => {
    if (window.confirm('Accept this offer? An order will be created automatically.')) {
      dispatch(acceptOffer(offerId));
    }
  };

  const handleRejectOffer = (offerData) => {
    dispatch(rejectOffer(offerData));
    setRejectModalOffer(null);
  };

  const handleCounterOffer = (data) => {
    dispatch(counterOffer(data));
    setCounterModalOffer(null);
  };

  const handlePageChange = (page) => {
    dispatch(fetchReceivedOffers({ page, limit: 10, status: statusFilter === 'all' ? '' : statusFilter }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      countered: 'bg-orange-100 text-orange-800 border-orange-200',
      counter_accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      counter_rejected: 'bg-rose-100 text-rose-800 border-rose-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-white">
      <Toaster position="top-right" />

      {/* Counter Offer Modal */}
      <CounterOfferModal
        isOpen={!!counterModalOffer}
        onClose={() => setCounterModalOffer(null)}
        offer={counterModalOffer}
        onSubmit={handleCounterOffer}
        isSubmitting={actionLoading}
      />

      {/* Reject Modal */}
      <RejectOfferModal
        isOpen={!!rejectModalOffer}
        onClose={() => setRejectModalOffer(null)}
        offer={rejectModalOffer}
        onSubmit={handleRejectOffer}
        isSubmitting={actionLoading}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/store" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Received Offers
                </h1>
                <p className="text-sm text-gray-500">Manage offers from buyers on your products</p>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'pending', 'accepted', 'rejected', 'countered', 'expired'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    statusFilter === s
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Offers Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-200" />
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent absolute top-0 left-0" />
            </div>
          </div>
        ) : receivedOffers.length === 0 ? (
          <div className="bg-white/90 rounded-2xl shadow-xl p-12 text-center">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Offers Found</h3>
            <p className="text-gray-500">You haven't received any offers yet.</p>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-teal-600 to-emerald-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">NDC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Offer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Original Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Dose Form</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Strength</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {receivedOffers.map((offer) => (
                    <React.Fragment key={offer._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg overflow-hidden">
                            {offer.productImage?.url ? (
                              <img src={offer.productImage.url} alt="" className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Pill className="w-5 h-5 text-teal-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 max-w-[150px] truncate">{offer.productName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500 font-mono">{offer.productNDC || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700 max-w-[120px] truncate">{offer.buyerVendorName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-blue-600">${offer.offerPrice?.toFixed(2)}</div>
                          {offer.counterPrice && (
                            <div className="text-xs text-orange-600 font-medium">
                              Counter: ${offer.counterPrice.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">${offer.originalPrice?.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{offer.quantity}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500">{offer.productSnapshot?.dosageForm || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500">{offer.productSnapshot?.strength || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500">{formatDate(offer.createdAt)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(offer.status)}`}>
                            {offer.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {offer.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAcceptOffer(offer._id)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                  title="Accept Offer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setRejectModalOffer(offer)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                  title="Reject Offer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setCounterModalOffer(offer)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                                  title="Counter Offer"
                                >
                                  <DollarSign className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setExpandedOffer(expandedOffer === offer._id ? null : offer._id)}
                              className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                              title="View Details"
                            >
                              {expandedOffer === offer._id ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {expandedOffer === offer._id && (
                        <tr>
                          <td colSpan="12" className="px-4 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white rounded-xl p-4 border">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Offer Details</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Offer Price:</span>
                                    <span className="font-medium">${offer.offerPrice?.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Total Value:</span>
                                    <span className="font-bold text-teal-600">${(offer.offerPrice * offer.quantity).toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Discount:</span>
                                    <span className="text-green-600">
                                      {(((offer.originalPrice - offer.offerPrice) / offer.originalPrice) * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-white rounded-xl p-4 border">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Product Snapshot</h4>
                                <div className="space-y-1 text-sm">
                                  <p className="text-gray-600">Manufacturer: {offer.productSnapshot?.manufacturer || 'N/A'}</p>
                                  <p className="text-gray-600">Pack Size: {offer.productSnapshot?.packSize || 'N/A'}</p>
                                  <p className="text-gray-600">Lot: {offer.productSnapshot?.lotNumber || 'N/A'}</p>
                                  <p className="text-gray-600">
                                    Expiry: {offer.productSnapshot?.expirationDate
                                      ? new Date(offer.productSnapshot.expirationDate).toLocaleDateString()
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-white rounded-xl p-4 border">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Message & Status</h4>
                                {offer.message ? (
                                  <div className="bg-blue-50 rounded-lg p-2 mb-2">
                                    <p className="text-sm text-blue-800 flex items-start gap-1">
                                      <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                      {offer.message}
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 mb-2">No message from buyer</p>
                                )}
                                {offer.counterPrice && (
                                  <div className="bg-orange-50 rounded-lg p-2">
                                    <p className="text-xs text-orange-700">
                                      Counter: ${offer.counterPrice.toFixed(2)} per unit
                                    </p>
                                    {offer.counterMessage && (
                                      <p className="text-xs text-orange-600 mt-1">{offer.counterMessage}</p>
                                    )}
                                  </div>
                                )}
                                {offer.convertedOrder && (
                                  <div className="mt-2 bg-green-50 rounded-lg p-2">
                                    <p className="text-xs text-green-700 flex items-center gap-1">
                                      <ShoppingBag className="w-3 h-3" />
                                      Converted to Order
                                    </p>
                                  </div>
                                )}
                                <p className="text-xs text-gray-400 mt-2">
                                  Expires: {formatDate(offer.expiresAt)}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {receivedPagination.pages > 1 && (
              <div className="flex justify-center py-4 border-t border-gray-100">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, receivedPagination.page - 1))}
                    disabled={receivedPagination.page === 1}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(receivedPagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        receivedPagination.page === i + 1
                          ? 'bg-teal-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(receivedPagination.pages, receivedPagination.page + 1))}
                    disabled={receivedPagination.page === receivedPagination.pages}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedOffersPage;