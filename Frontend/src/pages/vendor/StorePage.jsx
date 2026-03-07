// src/pages/store/StorePage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import {
  Search,
  Filter,
  Package,
  Heart,
  AlertCircle,
  Lock,
  User,
  Store,
  ArrowRight,
  RotateCcw,
  Eye,
  Check,
  X,
  Loader2,
  Info,
  ShoppingCart,
  DollarSign,
  Grid,
  Table as TableIcon,
  Thermometer,
  Pill,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  Layers,
  Hash,
  Building2,
  FlaskConical,
  BoxSelect,
  MessageSquare
} from 'lucide-react';
import {
  fetchStoreProducts,
  fetchStoreFilters,
  fetchCart,
  fetchWishlist,
  addToCart,
  addToWishlist,
  removeFromWishlist,
  setFilters,
  clearFilters
} from '../../store/slices/storeSlice';
import { createOffer, fetchOfferCounts } from '../../store/slices/offerSlice';

// ─── Toast Helpers ───────────────────────────────────────────────
const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    icon: <Check className="w-5 h-5" />,
    style: {
      background: '#f0fdf4',
      color: '#166534',
      border: '1px solid #bbf7d0',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
    },
  });
};

const showErrorToast = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    icon: <X className="w-5 h-5" />,
    style: {
      background: '#fef2f2',
      color: '#dc2626',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
    },
  });
};

const showInfoToast = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: <Info className="w-5 h-5" />,
    style: {
      background: '#eff6ff',
      color: '#1d4ed8',
      border: '1px solid #bfdbfe',
      borderRadius: '12px',
      padding: '16px',
      fontSize: '14px',
      fontWeight: '500',
    },
  });
};

// ─── Floating Shapes ─────────────────────────────────────────────
const FloatingShape = ({ shape, className }) => (
  <div className={`absolute ${className} opacity-10 animate-pulse`}>
    {shape === 'circle' && <div className="w-32 h-32 bg-teal-300 rounded-full" />}
    {shape === 'square' && <div className="w-24 h-24 bg-emerald-300 rotate-45" />}
    {shape === 'triangle' && (
      <div className="w-0 h-0 border-l-[60px] border-r-[60px] border-b-[100px] border-l-transparent border-r-transparent border-b-teal-400" />
    )}
  </div>
);

// ─── Vendor Access Denied ────────────────────────────────────────
const VendorAccessDenied = () => (
  <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-white relative overflow-hidden">
    <FloatingShape shape="circle" className="top-10 left-10" />
    <FloatingShape shape="square" className="top-20 right-20" />
    <FloatingShape shape="triangle" className="bottom-20 left-1/4" />
    <FloatingShape shape="circle" className="bottom-10 right-10" />
    <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center transform hover:scale-105 transition-all duration-500">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full mb-6 animate-bounce">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Access Restricted
            </h1>
            <p className="text-xl text-gray-700 mb-2">
              You don't have access to view the store page
            </p>
            <p className="text-lg text-gray-600">
              Please login as a vendor to continue
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/vendor/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <User className="w-5 h-5 mr-2" />
              Login as Vendor
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/vendor/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-teal-600 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transform hover:scale-105 transition-all duration-300"
            >
              <Store className="w-5 h-5 mr-2" />
              Become a Vendor
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Make Offer Modal ────────────────────────────────────────────
const MakeOfferModal = ({ isOpen, onClose, product, onSubmit, isSubmitting }) => {
  const [offerPrice, setOfferPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      setOfferPrice('');
      setQuantity(1);
      setMessage('');
    }
  }, [isOpen, product?._id]);

  if (!isOpen || !product) return null;

  const totalValue = offerPrice
    ? (parseFloat(offerPrice) * parseInt(quantity || 1)).toFixed(2)
    : '0.00';
  const savings =
    product.price && offerPrice
      ? ((product.price - parseFloat(offerPrice)) * parseInt(quantity || 1)).toFixed(2)
      : '0.00';
  const savingsPercent =
    product.price && offerPrice
      ? (((product.price - parseFloat(offerPrice)) / product.price) * 100).toFixed(1)
      : '0.0';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!offerPrice || parseFloat(offerPrice) <= 0) return;
    if (!quantity || parseInt(quantity) <= 0) return;
    onSubmit({
      productId: product._id,
      offerPrice: parseFloat(offerPrice),
      quantity: parseInt(quantity),
      message: message.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-t-2xl px-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              Make an Offer
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Product Info Card */}
        <div className="px-6 pt-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
              {product.image?.url ? (
                <img
                  src={product.image.url}
                  alt={product.productName}
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-teal-50">
                  <Pill className="w-8 h-8 text-teal-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate">
                {product.productName}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                NDC: {product.ndcNumber || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {product.manufacturer || 'N/A'} • {product.strength || ''} •{' '}
                {product.dosageForm || ''}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm font-bold text-teal-600">
                  ${product.price?.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">
                  Pack: {product.originalPackSize ?? product.packQuantity ?? 'N/A'}
                </span>
                <span className="text-xs text-gray-500">
                  In Stock: {product.quantityInStock ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Your Offer Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={product.quantityInStock}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          {/* Price Summary */}
          {offerPrice && parseFloat(offerPrice) > 0 && (
            <div className="bg-teal-50 rounded-xl p-3 space-y-1 border border-teal-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Offer Value:</span>
                <span className="font-bold text-teal-700">${totalValue}</span>
              </div>
              {parseFloat(savings) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Savings vs. List Price:</span>
                  <span className="font-medium text-green-600">
                    ${savings} ({savingsPercent}%)
                  </span>
                </div>
              )}
              {parseFloat(offerPrice) >= product.price && (
                <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  Your offer is at or above the listed price
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Message{' '}
              <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="2"
              maxLength={500}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none"
              placeholder="Add any details about your offer..."
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {message.length}/500
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || !offerPrice || parseFloat(offerPrice) <= 0
              }
              className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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

          <p className="text-xs text-gray-400 text-center">
            Offers expire after 7 days if not responded to
          </p>
        </form>
      </div>
    </div>
  );
};

// ─── Helper Functions ────────────────────────────────────────────
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

const renderPackCondition = (condition) => {
  if (!condition) return <span className="text-gray-400">N/A</span>;

  if (condition.includes('/')) {
    const parts = condition.split('/');
    return (
      <div className="text-xs leading-relaxed">
        <span className="block text-green-700 bg-green-50 px-1.5 py-0.5 rounded mb-0.5">
          {parts[0].trim()}
        </span>
        <span className="block text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
          {parts[1].trim()}
        </span>
      </div>
    );
  }
  return <span className="text-sm text-gray-700">{condition}</span>;
};

// ─── Main StorePage Component ────────────────────────────────────
const StorePage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [viewMode, setViewMode] = useState('table');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  const isVendorAuthenticated =
    isAuthenticated && user?.role === 'vendor' && user?.status === 'approved';

  const vendorData = user;

  const {
    products = [],
    loading = false,
    error = null,
    wishlist = { products: [] },
    filters = {},
    availableFilters = { dosageForms: [], vendors: [] },
    pagination = { page: 1, limit: 12, total: 0, pages: 1 },
  } = useSelector((state) => state.store || {});

  const { actionLoading: offerSubmitting = false } = useSelector(
    (state) => state.offers || {}
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  // ── Data Fetching ──
  useEffect(() => {
    if (isVendorAuthenticated) {
      dispatch(fetchStoreProducts(filters));
      dispatch(fetchStoreFilters());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, filters, isVendorAuthenticated]);

  // ── Search Debounce ──
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (filters.search || '')) {
        dispatch(setFilters({ ...filters, search: searchQuery, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // ── Handlers ──
  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      showSuccessToast('Product added to cart!');
    } catch (error) {
      showErrorToast(error?.message || 'Failed to add to cart');
    }
  };

  const handleToggleWishlist = async (productId, isInWishlistFlag) => {
    try {
      if (isInWishlistFlag) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        showInfoToast('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        showSuccessToast('Added to wishlist!');
      }
      dispatch(fetchWishlist());
    } catch (error) {
      showErrorToast('Failed to update wishlist');
    }
  };

  const handleMakeOffer = (product) => {
    setSelectedProduct(product);
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async (offerData) => {
    try {
      await dispatch(createOffer(offerData)).unwrap();
      showSuccessToast(
        'Offer submitted successfully! The seller will be notified.'
      );
      setShowOfferModal(false);
      setSelectedProduct(null);
      dispatch(fetchOfferCounts());
    } catch (error) {
      showErrorToast(error || 'Failed to submit offer');
    }
  };

  const isInWishlist = (productId) => {
    return (
      wishlist?.products?.some(
        (item) =>
          item.product?._id === productId || item.product === productId
      ) || false
    );
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key !== 'page') newFilters.page = 1;
    dispatch(setFilters(newFilters));
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
    showInfoToast('All filters cleared');
  };

  // ── Access Denied ──
  if (!isVendorAuthenticated) {
    return <VendorAccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />

      {/* Make Offer Modal */}
      <MakeOfferModal
        isOpen={showOfferModal}
        onClose={() => {
          setShowOfferModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSubmit={handleSubmitOffer}
        isSubmitting={offerSubmitting}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* ─── Store Header ─── */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    B2B Pharmaceutical Marketplace
                  </h1>
                </div>
                <p className="text-gray-500 text-sm ml-13">
                  Source products from trusted vendors • Welcome back,{' '}
                  <span className="font-medium text-gray-700">
                    {vendorData?.pharmacyInfo?.legalBusinessName || 'Vendor'}
                  </span>
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by NDC, name, manufacturer, lot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 w-full lg:w-96 text-sm transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* ─── Toolbar ─── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow ${
                  showFilters
                    ? 'bg-teal-600 text-white'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Filters'}
              </button>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'table'
                      ? 'bg-white shadow-md text-teal-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-md text-teal-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                <span className="font-bold text-teal-700">
                  {pagination.total}
                </span>{' '}
                products found
              </span>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-3 py-1.5 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-300"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset
              </button>
            </div>
          </div>

          {/* ─── Filters Panel ─── */}
          {showFilters && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all"
                  >
                    <option value="">All Categories</option>
                    {availableFilters.dosageForms?.map((form) => (
                      <option key={form} value={form}>
                        {form}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">
                    Vendor
                  </label>
                  <select
                    value={filters.vendor || ''}
                    onChange={(e) => updateFilter('vendor', e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all"
                  >
                    <option value="">All Vendors</option>
                    {availableFilters.vendors?.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock !== false}
                      onChange={(e) =>
                        updateFilter('inStock', e.target.checked)
                      }
                      className="h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      In Stock Only
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.fridgeProducts === 'true' || filters.fridgeProducts === true}
                      onChange={(e) =>
                        updateFilter(
                          'fridgeProducts',
                          e.target.checked ? 'true' : ''
                        )
                      }
                      className="h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      <Thermometer className="w-3 h-3 inline mr-1" />
                      Fridge Products
                    </span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                      Sort By
                    </label>
                    <select
                      value={filters.sort || 'newest'}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all"
                    >
                      <option value="newest">Newest First</option>
                      <option value="priceLow">Price: Low → High</option>
                      <option value="priceHigh">Price: High → Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Products Display ─── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {viewMode === 'table' ? 'Products Table' : 'Products Grid'}
              </h2>
              <span className="text-xs text-gray-500">
                Showing {products.length} of {pagination.total}
              </span>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex justify-center items-center h-80">
                <div className="relative">
                  <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-200" />
                  <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-600 border-t-transparent absolute top-0 left-0" />
                </div>
              </div>
            ) : error ? (
              /* Error */
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mr-4" />
                  <p className="text-red-700 text-lg">{error}</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              /* Empty */
              <div className="text-center py-20 bg-white/80 rounded-2xl shadow-lg">
                <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg text-sm font-semibold"
                >
                  Clear all filters
                </button>
              </div>
            ) : viewMode === 'table' ? (
              /* ─────────── TABLE VIEW ─────────── */
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-teal-600 to-emerald-600">
                      <tr>
                        {[
                          'Image',
                          'Product Name',
                          'NDC',
                          'Lot #',
                          'Pack Condition',
                          'Manufacturer',
                          'Dose Form',
                          'Strength',
                          'Exp. Date',
                          'Pack Size',
                          'Pack Qty',
                          'Stock',
                          'Fridge',
                          'Price',
                          'Actions',
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-3 py-3 text-left text-[10px] font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {products.map((product) => {
                        const inWishlist = isInWishlist(product._id);
                        const isExpanded = expandedRow === product._id;
                        return (
                          <React.Fragment key={product._id}>
                            <tr className="hover:bg-teal-50/30 transition-colors group">
                              {/* Image */}
                              <td className="px-3 py-3">
                                <div className="w-11 h-11 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg overflow-hidden border border-gray-100">
                                  {product.image?.url ? (
                                    <img
                                      src={product.image.url}
                                      alt={product.productName}
                                      className="w-full h-full object-contain p-0.5"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Pill className="w-5 h-5 text-teal-400" />
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Product Name */}
                              <td className="px-3 py-3">
                                <div
                                  className="text-sm font-semibold text-gray-900 max-w-[160px] truncate cursor-pointer hover:text-teal-600"
                                  title={product.productName}
                                >
                                  {product.productName || 'N/A'}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                  {product.vendorName || 'Unknown Vendor'}
                                </div>
                              </td>

                              {/* NDC */}
                              <td className="px-3 py-3">
                                <span className="text-xs text-gray-600 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                                  {product.ndcNumber || 'N/A'}
                                </span>
                              </td>

                              {/* Lot Number */}
                              <td className="px-3 py-3">
                                <span className="text-xs text-gray-600 font-mono">
                                  {product.lotNumber || 'N/A'}
                                </span>
                              </td>

                              {/* Pack Condition */}
                              <td className="px-3 py-3 max-w-[150px]">
                                {renderPackCondition(product.packageCondition)}
                              </td>

                              {/* Manufacturer */}
                              <td className="px-3 py-3">
                                <div
                                  className="text-xs text-gray-600 max-w-[120px] truncate"
                                  title={product.manufacturer}
                                >
                                  {product.manufacturer || 'N/A'}
                                </div>
                              </td>

                              {/* Dose Form */}
                              <td className="px-3 py-3">
                                <span className="text-xs text-gray-600">
                                  {product.dosageForm || 'N/A'}
                                </span>
                              </td>

                              {/* Strength */}
                              <td className="px-3 py-3">
                                <span className="text-xs font-medium text-gray-700">
                                  {product.strength || 'N/A'}
                                </span>
                              </td>

                              {/* Expiration Date */}
                              <td className="px-3 py-3">
                                {product.expirationDate ? (
                                  <span
                                    className={`text-xs font-medium ${
                                      new Date(product.expirationDate) <
                                      new Date(
                                        Date.now() + 90 * 24 * 60 * 60 * 1000
                                      )
                                        ? 'text-red-600'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {formatDate(product.expirationDate)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    N/A
                                  </span>
                                )}
                              </td>

                              {/* Pack Size (originalPackSize) */}
                              <td className="px-3 py-3">
                                <span className="text-xs font-medium text-gray-700">
                                  {product.originalPackSize != null
                                    ? product.originalPackSize
                                    : 'N/A'}
                                </span>
                              </td>

                              {/* Pack Qty (packQuantity) */}
                              <td className="px-3 py-3">
                                <span className="text-xs text-gray-600">
                                  {product.packQuantity || 'N/A'}
                                </span>
                              </td>

                              {/* Stock */}
                              <td className="px-3 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    product.quantityInStock > 10
                                      ? 'bg-green-50 text-green-700'
                                      : product.quantityInStock > 0
                                      ? 'bg-yellow-50 text-yellow-700'
                                      : 'bg-red-50 text-red-700'
                                  }`}
                                >
                                  {product.quantityInStock ?? 0}
                                </span>
                              </td>

                              {/* Fridge */}
                              <td className="px-3 py-3">
                                {product.isFridgeProduct === 'Yes' ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                                    <Thermometer className="w-3 h-3 mr-0.5" />
                                    Yes
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400">
                                    No
                                  </span>
                                )}
                              </td>

                              {/* Price */}
                              <td className="px-3 py-3">
                                <span className="text-sm font-bold text-teal-600">
                                  {formatPrice(product.price)}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() =>
                                      handleAddToCart(product._id)
                                    }
                                    disabled={product.quantityInStock <= 0}
                                    className={`p-1.5 rounded-lg transition-all duration-200 ${
                                      product.quantityInStock <= 0
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        : 'bg-teal-50 text-teal-600 hover:bg-teal-100 hover:scale-110'
                                    }`}
                                    title="Add to Cart"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleToggleWishlist(
                                        product._id,
                                        inWishlist
                                      )
                                    }
                                    className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                                      inWishlist
                                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                    }`}
                                    title={
                                      inWishlist
                                        ? 'Remove from Wishlist'
                                        : 'Add to Wishlist'
                                    }
                                  >
                                    <Heart
                                      className={`w-3.5 h-3.5 ${
                                        inWishlist ? 'fill-current' : ''
                                      }`}
                                    />
                                  </button>

                                  <button
                                    onClick={() => handleMakeOffer(product)}
                                    disabled={product.quantityInStock <= 0}
                                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                                      product.quantityInStock <= 0
                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 hover:scale-105 shadow-sm'
                                    }`}
                                    title="Make an Offer"
                                  >
                                    <Tag className="w-3 h-3 inline mr-1" />
                                    Offer
                                  </button>

                                  <button
                                    onClick={() =>
                                      setExpandedRow(
                                        isExpanded ? null : product._id
                                      )
                                    }
                                    className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                                    title="More details"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* ── Expanded Row Details ── */}
                            {isExpanded && (
                              <tr>
                                <td
                                  colSpan="15"
                                  className="px-4 py-4 bg-gradient-to-r from-teal-50/50 to-emerald-50/50"
                                >
                                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    <DetailCard
                                      icon={
                                        <Hash className="w-4 h-4 text-teal-500" />
                                      }
                                      label="NDC Number"
                                      value={product.ndcNumber}
                                    />
                                    <DetailCard
                                      icon={
                                        <Hash className="w-4 h-4 text-blue-500" />
                                      }
                                      label="Lot Number"
                                      value={product.lotNumber}
                                    />
                                    <DetailCard
                                      icon={
                                        <Building2 className="w-4 h-4 text-purple-500" />
                                      }
                                      label="Manufacturer"
                                      value={product.manufacturer}
                                    />
                                    <DetailCard
                                      icon={
                                        <FlaskConical className="w-4 h-4 text-indigo-500" />
                                      }
                                      label="Strength"
                                      value={product.strength}
                                    />
                                    <DetailCard
                                      icon={
                                        <Pill className="w-4 h-4 text-pink-500" />
                                      }
                                      label="Dosage Form"
                                      value={product.dosageForm}
                                    />
                                    <DetailCard
                                      icon={
                                        <Calendar className="w-4 h-4 text-orange-500" />
                                      }
                                      label="Expiration Date"
                                      value={formatDate(
                                        product.expirationDate
                                      )}
                                    />
                                    <DetailCard
                                      icon={
                                        <BoxSelect className="w-4 h-4 text-emerald-500" />
                                      }
                                      label="Pack Condition"
                                      value={product.packageCondition}
                                    />
                                    <DetailCard
                                      icon={
                                        <Layers className="w-4 h-4 text-cyan-500" />
                                      }
                                      label="Original Pack Size"
                                      value={product.originalPackSize}
                                    />
                                    <DetailCard
                                      icon={
                                        <Package className="w-4 h-4 text-amber-500" />
                                      }
                                      label="Pack Quantity"
                                      value={product.packQuantity}
                                    />
                                    <DetailCard
                                      icon={
                                        <Thermometer className="w-4 h-4 text-blue-500" />
                                      }
                                      label="Fridge Product"
                                      value={product.isFridgeProduct}
                                    />
                                    <DetailCard
                                      icon={
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                      }
                                      label="Price"
                                      value={formatPrice(product.price)}
                                    />
                                    <DetailCard
                                      icon={
                                        <Store className="w-4 h-4 text-gray-500" />
                                      }
                                      label="Vendor"
                                      value={product.vendorName}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ─────────── GRID VIEW ─────────── */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                  const inWishlist = isInWishlist(product._id);
                  return (
                    <div
                      key={product._id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-1 border border-gray-100"
                    >
                      {/* Image */}
                      <div className="relative h-44 bg-gradient-to-br from-teal-50 to-emerald-50 overflow-hidden">
                        {product.image?.url ? (
                          <img
                            src={product.image.url}
                            alt={product.productName}
                            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Pill className="h-14 w-14 text-teal-300" />
                          </div>
                        )}

                        {/* Fridge Badge */}
                        {product.isFridgeProduct === 'Yes' && (
                          <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-500 text-white rounded-full text-[10px] font-medium shadow">
                              <Thermometer className="w-3 h-3 mr-0.5" />
                              Fridge
                            </span>
                          </div>
                        )}

                        {/* Wishlist button on image */}
                        <button
                          onClick={() =>
                            handleToggleWishlist(product._id, inWishlist)
                          }
                          className={`absolute top-2 right-2 p-2 rounded-full shadow-md transition-all duration-200 ${
                            inWishlist
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 text-gray-400 hover:text-red-500'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              inWishlist ? 'fill-current' : ''
                            }`}
                          />
                        </button>

                        {/* Stock badge */}
                        <div className="absolute bottom-2 left-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shadow ${
                              product.quantityInStock > 10
                                ? 'bg-green-500 text-white'
                                : product.quantityInStock > 0
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {product.quantityInStock > 0
                              ? `${product.quantityInStock} in stock`
                              : 'Out of Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="p-4">
                        <h3
                          className="font-bold text-gray-900 mb-1 text-sm truncate"
                          title={product.productName}
                        >
                          {product.productName || 'N/A'}
                        </h3>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] text-gray-500 font-mono bg-gray-50 px-1.5 py-0.5 rounded">
                            NDC: {product.ndcNumber || 'N/A'}
                          </span>
                        </div>

                        <div className="space-y-1 mb-3">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Manufacturer:</span>
                            <span
                              className="text-gray-700 font-medium max-w-[120px] truncate"
                              title={product.manufacturer}
                            >
                              {product.manufacturer || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Strength:</span>
                            <span className="text-gray-700 font-medium">
                              {product.strength || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Dose Form:</span>
                            <span className="text-gray-700">
                              {product.dosageForm || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Lot #:</span>
                            <span className="text-gray-700 font-mono">
                              {product.lotNumber || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Expiry:</span>
                            <span
                              className={`font-medium ${
                                product.expirationDate &&
                                new Date(product.expirationDate) <
                                  new Date(
                                    Date.now() + 90 * 24 * 60 * 60 * 1000
                                  )
                                  ? 'text-red-600'
                                  : 'text-gray-700'
                              }`}
                            >
                              {formatDate(product.expirationDate)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Pack Size:</span>
                            <span className="text-gray-700 font-medium">
                              {product.originalPackSize != null
                                ? product.originalPackSize
                                : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Pack Qty:</span>
                            <span className="text-gray-700">
                              {product.packQuantity || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Condition:</span>
                            <span
                              className="text-gray-700 max-w-[120px] truncate"
                              title={product.packageCondition}
                            >
                              {product.packageCondition
                                ? product.packageCondition.split('/')[0].trim()
                                : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Price Row */}
                        <div className="flex items-center justify-between mb-3 pt-2 border-t border-gray-100">
                          <span className="text-lg font-bold text-teal-600">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {product.vendorName || 'Vendor'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(product._id)}
                            disabled={product.quantityInStock <= 0}
                            className="flex-1 flex items-center justify-center gap-1 p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Cart
                          </button>
                          <button
                            onClick={() => handleMakeOffer(product)}
                            disabled={product.quantityInStock <= 0}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                          >
                            <Tag className="w-3.5 h-3.5" />
                            Make Offer
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── Pagination ─── */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                  <button
                    onClick={() =>
                      updateFilter('page', Math.max(1, pagination.page - 1))
                    }
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateFilter('page', pageNum)}
                        className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold transition-all ${
                          pagination.page === pageNum
                            ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-transparent shadow-lg'
                            : 'border-gray-200 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() =>
                      updateFilter(
                        'page',
                        Math.min(pagination.pages, pagination.page + 1)
                      )
                    }
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Card Sub-component ───────────────────────────────────
const DetailCard = ({ icon, label, value }) => (
  <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
    <p
      className="text-sm font-medium text-gray-800 truncate"
      title={typeof value === 'string' ? value : ''}
    >
      {value != null && value !== '' ? value : (
        <span className="text-gray-400">N/A</span>
      )}
    </p>
  </div>
);

export default StorePage;