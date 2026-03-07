// src/pages/vendor/SentOffersPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import {
  ArrowRight,
  Check,
  X,
  DollarSign,
  Loader2,
  Package,
  Clock,
  Pill,
  ArrowLeft,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  AlertTriangle,
  Ban
} from 'lucide-react';
import {
  fetchSentOffers,
  acceptCounterOffer,
  rejectCounterOffer,
  cancelOffer,
  fetchOfferCounts,
  clearOfferError,
  clearSuccessMessage
} from '../../store/slices/offerSlice';

const SentOffersPage = () => {
  const dispatch = useDispatch();
  const {
    sentOffers,
    sentPagination,
    loading,
    actionLoading,
    actionError,
    successMessage
  } = useSelector((state) => state.offers);

  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOffer, setExpandedOffer] = useState(null);

  useEffect(() => {
    dispatch(fetchSentOffers({ page: 1, limit: 10, status: statusFilter === 'all' ? '' : statusFilter }));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        duration: 4000,
        style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px' }
      });
      dispatch(clearSuccessMessage());
      dispatch(fetchSentOffers({ page: 1, limit: 10, status: statusFilter === 'all' ? '' : statusFilter }));
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

  const handleAcceptCounter = async (offerId) => {
    if (window.confirm('Accept this counter offer? An order will be created automatically.')) {
      dispatch(acceptCounterOffer(offerId));
    }
  };

  const handleRejectCounter = async (offerId) => {
    if (window.confirm('Reject this counter offer?')) {
      dispatch(rejectCounterOffer(offerId));
    }
  };

  const handleCancelOffer = async (offerId) => {
    if (window.confirm('Cancel this offer?')) {
      dispatch(cancelOffer(offerId));
    }
  };

  const handlePageChange = (page) => {
    dispatch(fetchSentOffers({ page, limit: 10, status: statusFilter === 'all' ? '' : statusFilter }));
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to="/store" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Sent Offers
                </h1>
                <p className="text-sm text-gray-500">Track your offers to other vendors</p>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'pending', 'countered', 'accepted', 'rejected', 'cancelled', 'expired'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    statusFilter === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
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
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200" />
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-0" />
            </div>
          </div>
        ) : sentOffers.length === 0 ? (
          <div className="bg-white/90 rounded-2xl shadow-xl p-12 text-center">
            <ArrowRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Sent Offers</h3>
            <p className="text-gray-500 mb-4">You haven't made any offers yet.</p>
            <Link
              to="/store"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">NDC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Your Offer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Counter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Original</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sentOffers.map((offer) => (
                    <React.Fragment key={offer._id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg overflow-hidden">
                            {offer.productImage?.url ? (
                              <img src={offer.productImage.url} alt="" className="w-full h-full object-contain p-0.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Pill className="w-5 h-5 text-blue-400" />
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
                          <div className="text-sm text-gray-700 max-w-[120px] truncate">{offer.sellerVendorName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-blue-600">${offer.offerPrice?.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-3">
                          {offer.counterPrice ? (
                            <div className="text-sm font-bold text-orange-600">${offer.counterPrice.toFixed(2)}</div>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">${offer.originalPrice?.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">{offer.quantity}</div>
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
                            {/* Countered - Buyer can accept or reject counter */}
                            {offer.status === 'countered' && (
                              <>
                                <button
                                  onClick={() => handleAcceptCounter(offer._id)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                  title="Accept Counter Offer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectCounter(offer._id)}
                                  disabled={actionLoading}
                                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                  title="Reject Counter Offer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {/* Pending - Buyer can cancel */}
                            {offer.status === 'pending' && (
                              <button
                                onClick={() => handleCancelOffer(offer._id)}
                                disabled={actionLoading}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                title="Cancel Offer"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}

                            {/* Accepted - Show order link */}
                            {(offer.status === 'accepted' || offer.status === 'counter_accepted') && offer.convertedOrder && (
                              <Link
                                to={`/store/orders`}
                                className="p-1.5 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors"
                                title="View Order"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </Link>
                            )}

                            {/* Rejected - Show message */}
                            {offer.status === 'rejected' && offer.rejectionReason && (
                              <button
                                onClick={() => setExpandedOffer(expandedOffer === offer._id ? null : offer._id)}
                                className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                title="View Rejection Reason"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
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

                      {/* Expanded Details */}
                      {expandedOffer === offer._id && (
                        <tr>
                          <td colSpan="11" className="px-4 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-white rounded-xl p-4 border">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Offer Summary</h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Your Offer:</span>
                                    <span className="font-medium">${offer.offerPrice?.toFixed(2)} × {offer.quantity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Offer Total:</span>
                                    <span className="font-bold text-blue-600">${(offer.offerPrice * offer.quantity).toFixed(2)}</span>
                                  </div>
                                  {offer.counterPrice && (
                                    <>
                                      <hr className="my-2" />
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Counter Price:</span>
                                        <span className="font-medium text-orange-600">${offer.counterPrice.toFixed(2)} × {offer.quantity}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500">Counter Total:</span>
                                        <span className="font-bold text-orange-600">${(offer.counterPrice * offer.quantity).toFixed(2)}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="bg-white rounded-xl p-4 border">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Messages</h4>
                                {offer.message ? (
                                  <div className="bg-blue-50 rounded-lg p-2 mb-2">
                                    <p className="text-xs font-medium text-blue-700 mb-0.5">Your message:</p>
                                    <p className="text-sm text-blue-800">{offer.message}</p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-400 mb-2">No message sent</p>
                                )}
                                {offer.counterMessage && (
                                  <div className="bg-orange-50 rounded-lg p-2 mb-2">
                                    <p className="text-xs font-medium text-orange-700 mb-0.5">Seller's response:</p>
                                    <p className="text-sm text-orange-800">{offer.counterMessage}</p>
                                  </div>
                                )}
                                {offer.rejectionReason && (
                                  <div className="bg-red-50 rounded-lg p-2">
                                    <p className="text-xs font-medium text-red-700 mb-0.5">Rejection reason:</p>
                                    <p className="text-sm text-red-800">{offer.rejectionReason}</p>
                                  </div>
                                )}
                              </div>

                              <div className="bg-white rounded-xl p-4 border">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span className="text-gray-600">Submitted: {formatDate(offer.createdAt)}</span>
                                  </div>
                                  {offer.counteredAt && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                      <span className="text-gray-600">Countered: {formatDate(offer.counteredAt)}</span>
                                    </div>
                                  )}
                                  {offer.acceptedAt && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                      <span className="text-gray-600">Accepted: {formatDate(offer.acceptedAt)}</span>
                                    </div>
                                  )}
                                  {offer.rejectedAt && (
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                                      <span className="text-gray-600">Rejected: {formatDate(offer.rejectedAt)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                    <span className="text-gray-500">Expires: {formatDate(offer.expiresAt)}</span>
                                  </div>
                                </div>
                                {offer.convertedOrder && (
                                  <div className="mt-3 bg-green-50 rounded-lg p-2">
                                    <p className="text-xs text-green-700 flex items-center gap-1">
                                      <ShoppingBag className="w-3 h-3" />
                                      Order created successfully
                                    </p>
                                  </div>
                                )}
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
            {sentPagination.pages > 1 && (
              <div className="flex justify-center py-4 border-t border-gray-100">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, sentPagination.page - 1))}
                    disabled={sentPagination.page === 1}
                    className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {[...Array(sentPagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        sentPagination.page === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(sentPagination.pages, sentPagination.page + 1))}
                    disabled={sentPagination.page === sentPagination.pages}
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

export default SentOffersPage;