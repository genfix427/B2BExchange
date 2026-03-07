import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import {
  Search,
  Filter,
  Package,
  Heart,
  AlertCircle,
  CheckCircle,
  Star,
  Lock,
  User,
  Store,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  TrendingUp,
  Award,
  Users,
  ShoppingBag,
  Pill,
  Activity,
  RotateCcw,
  Eye,
  Check,
  X,
  Loader2,
  Sparkles,
  ThumbsUp,
  Info,
  ShoppingCart,
  DollarSign,
  Calendar,
  Grid,
  Table as TableIcon,
  Thermometer
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
import { authService } from '../../services/auth.service';

// Floating animated shapes
const FloatingShape = ({ shape, className }) => (
  <div className={`absolute ${className} opacity-10 animate-pulse`}>
    {shape === 'circle' && <div className="w-32 h-32 bg-teal-300 rounded-full" />}
    {shape === 'square' && <div className="w-24 h-24 bg-emerald-300 rotate-45" />}
    {shape === 'triangle' && (
      <div className="w-0 h-0 border-l-[60px] border-r-[60px] border-b-[100px] border-l-transparent border-r-transparent border-b-teal-400" />
    )}
  </div>
);

// Enhanced toast notifications
const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    icon: <Check className="w-5 h-5" />,
    iconTheme: {
      primary: '#10b981',
      secondary: '#fff',
    },
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

// Vendor access denied component
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

// Make an Offer Modal Component
const MakeOfferModal = ({ isOpen, onClose, product, onSubmit }) => {
  const [offerPrice, setOfferPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        productId: product._id,
        offerPrice: parseFloat(offerPrice),
        quantity: parseInt(quantity),
        message
      });
      showSuccessToast('Offer submitted successfully!');
      onClose();
    } catch (error) {
      showErrorToast('Failed to submit offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 transform animate-slideUp">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Make an Offer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900">{product.productName}</h4>
          <p className="text-sm text-gray-600">Regular Price: ${product.price?.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Pack Size: {product.originalPackSize || product.packQuantity || 'N/A'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Offer Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={product.price}
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your offer price"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              max={product.quantityInStock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Add any additional information..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-medium rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </form>
      </div>
    </div>
  );
};

const StorePage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
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
    filters,
    availableFilters = { dosageForms: [], vendors: [] },
    pagination = { page: 1, limit: 12, total: 0, pages: 1 }
  } = useSelector((state) => state.store || {});

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: '',
    vendor: '',
    minPrice: '',
    maxPrice: '',
    inStock: true,
    sort: 'newest'
  });

  useEffect(() => {
    if (isVendorAuthenticated) {
      dispatch(fetchStoreProducts(filters));
      dispatch(fetchStoreFilters());
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, filters, isVendorAuthenticated]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== localFilters.search) {
        setLocalFilters(prev => ({ ...prev, search: searchQuery }));
        dispatch(setFilters({ ...filters, search: searchQuery }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch, filters, localFilters.search]);

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      showSuccessToast('Product added to cart!');
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      showErrorToast('Failed to add to cart');
      throw error;
    }
  };

  const handleToggleWishlist = async (productId, isInWishlist) => {
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
        showInfoToast('Removed from wishlist');
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
        showSuccessToast('Added to wishlist!');
      }
      dispatch(fetchWishlist());
      return true;
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      showErrorToast('Failed to update wishlist');
      throw error;
    }
  };

  const handleMakeOffer = (product) => {
    setSelectedProduct(product);
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async (offerData) => {
    // Here you would dispatch an action to submit the offer
    console.log('Submitting offer:', offerData);
    // await dispatch(submitOffer(offerData)).unwrap();
  };

  const isInWishlist = (productId) => {
    return wishlist?.products?.some(
      (item) => item.product?._id === productId || item.product?._id === productId
    ) || false;
  };

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    dispatch(setFilters(newFilters));
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
    setSearchQuery('');
    setLocalFilters({
      search: '',
      category: '',
      vendor: '',
      minPrice: '',
      maxPrice: '',
      inStock: true,
      sort: 'newest'
    });
    showInfoToast('All filters cleared');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return "N/A";

      return parsed.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const getPackCondition = (condition) => {
    if (!condition) return 'N/A';
    // Split by slash and display both parts
    const parts = condition.split('/');
    if (parts.length > 1) {
      return (
        <div className="text-xs">
          <span className="block text-green-600">{parts[0]}</span>
          <span className="block text-red-600 text-xs">{parts[1]}</span>
        </div>
      );
    }
    return condition;
  };

  const getPackSize = (product) => {
    if (product.originalPackSize !== undefined && product.originalPackSize !== null)
      return product.originalPackSize;

    if (product.packQuantity) return product.packQuantity;

    return "N/A";
  };

  // Show access denied if not vendor
  if (!isVendorAuthenticated) {
    return <VendorAccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-white">
      {/* React Hot Toaster */}
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
      />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Store Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                    B2B Pharmaceutical Marketplace
                  </h1>
                </div>
                <p className="text-gray-600 text-lg">Source products from trusted vendors • Welcome back, {vendorData?.pharmacyInfo?.legalBusinessName}</p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search products by NDC, name, or manufacturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 w-full md:w-96 text-lg transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Filter className="w-5 h-5 mr-3" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'table' ? 'bg-white shadow-md text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Table View"
                >
                  <TableIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow-md text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid View"
                >
                  <Grid className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <span className="text-lg font-medium text-gray-700">
                {pagination.total} products found
              </span>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all duration-300"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                  >
                    <option value="">All Categories</option>
                    {availableFilters.dosageForms?.map((form) => (
                      <option key={form} value={form}>{form}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                  <div className="flex space-x-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ''}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ''}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Vendor</label>
                  <select
                    value={filters.vendor || ''}
                    onChange={(e) => updateFilter('vendor', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                  >
                    <option value="">All Vendors</option>
                    {availableFilters.vendors?.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock !== false}
                      onChange={(e) => updateFilter('inStock', e.target.checked)}
                      className="h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">In Stock Only</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.fridgeProducts}
                      onChange={(e) => updateFilter('fridgeProducts', e.target.checked)}
                      className="h-5 w-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">Fridge Products</span>
                  </label>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                    <select
                      value={filters.sort || 'newest'}
                      onChange={(e) => updateFilter('sort', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                    >
                      <option value="newest">Newest</option>
                      <option value="priceLow">Price: Low to High</option>
                      <option value="priceHigh">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Products Display */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                {viewMode === 'table' ? 'Products Table' : 'Products Grid'}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {products.length} of {pagination.total} products
                </span>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-200"></div>
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent absolute top-0 left-0"></div>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
                <div className="flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mr-4" />
                  <p className="text-red-700 text-lg">{error}</p>
                </div>
              </div>
            ) : (
              <>
                {viewMode === 'table' ? (
                  /* Table View with Correct Field Names */
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-teal-600 to-emerald-600">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">NDC</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Pack Condition</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Manufacturer</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Dose Form</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Strength</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Exp. Date</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Pack Size</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Fridge</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {products.map((product) => {
                            const inWishlist = isInWishlist(product._id);
                            return (
                              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg overflow-hidden">
                                    {product.image?.url ? (
                                      <img
                                        src={product.image.url}
                                        alt={product.productName}
                                        className="w-full h-full object-contain p-1"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = '';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Pill className="w-6 h-6 text-teal-400" />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                                  <div className="text-xs text-gray-500">Lot: {product.lotNumber || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500 font-mono">{product.ndcNumber || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">
                                    {product.packageCondition ? (
                                      <div>
                                        {product.packageCondition ? (
                                          product.packageCondition.includes("/") ? (
                                            <>
                                              <span className="block text-green-600 text-xs">
                                                {product.packageCondition.split("/")[0]}
                                              </span>
                                              <span className="block text-red-600 text-xs">
                                                {product.packageCondition.split("/")[1]}
                                              </span>
                                            </>
                                          ) : (
                                            product.packageCondition
                                          )
                                        ) : "N/A"}
                                      </div>
                                    ) : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">{product.manufacturer || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">{product.dosageForm || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">{product.strength || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">{formatDate(product.expirationDate)}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">
                                    {product.originalPackSize || product.packQuantity || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm">
                                    {product.isFridgeProduct === 'Yes' ? (
                                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                        <Thermometer className="w-3 h-3 mr-1" />
                                        Fridge
                                      </span>
                                    ) : (
                                      <span className="text-gray-400 text-xs">No</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-teal-600">{formatPrice(product.price)}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleAddToCart(product._id)}
                                      disabled={product.quantityInStock <= 0}
                                      className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${product.quantityInStock <= 0
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                                        }`}
                                      title="Add to Cart"
                                    >
                                      <ShoppingCart className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleWishlist(product._id, inWishlist)}
                                      className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${inWishlist
                                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                                    >
                                      <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                                    </button>
                                    <button
                                      onClick={() => handleMakeOffer(product)}
                                      disabled={product.quantityInStock <= 0}
                                      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${product.quantityInStock <= 0
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700'
                                        }`}
                                      title="Make an Offer"
                                    >
                                      Offer
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Grid View with Updated Field Names */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product) => {
                      const inWishlist = isInWishlist(product._id);
                      return (
                        <div key={product._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2">
                          {/* Image section */}
                          <div className="relative h-48 bg-gradient-to-br from-teal-50 to-emerald-50 overflow-hidden">
                            {product.image?.url ? (
                              <img
                                src={product.image.url}
                                alt={product.productName}
                                className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Pill className="h-16 w-16 text-teal-400" />
                              </div>
                            )}

                            {/* Fridge Badge */}
                            {product.isFridgeProduct === 'Yes' && (
                              <div className="absolute top-2 left-2">
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                  <Thermometer className="w-3 h-3 mr-1" />
                                  Fridge
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product details */}
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 mb-1">{product.productName}</h3>
                            <p className="text-xs text-gray-500 font-mono mb-1">NDC: {product.ndcNumber || 'N/A'}</p>
                            <p className="text-xs text-gray-500 mb-2">Lot: {product.lotNumber || 'N/A'}</p>

                            <div className="space-y-1 mb-3">
                              <p className="text-xs text-gray-600">Manufacturer: {product.manufacturer || 'N/A'}</p>
                              <p className="text-xs text-gray-600">Strength: {product.strength || 'N/A'}</p>
                              <p className="text-xs text-gray-600">Expiry: {formatDate(product.expirationDate)}</p>
                              <p className="text-xs text-gray-600">
                                Pack Condition: {product.packageCondition ? (
                                  <span className="text-green-600">{product.packageCondition.split('/')[0]}</span>
                                ) : 'N/A'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <span className="text-lg font-bold text-teal-600">{formatPrice(product.price)}</span>
                              <span className="text-xs text-gray-500">Pack: {product.originalPackSize || product.packQuantity || 'N/A'}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddToCart(product._id)}
                                disabled={product.quantityInStock <= 0}
                                className="flex-1 p-2 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Add to Cart"
                              >
                                <ShoppingCart className="w-4 h-4 mx-auto" />
                              </button>
                              <button
                                onClick={() => handleToggleWishlist(product._id, inWishlist)}
                                className={`p-2 rounded-lg transition-colors ${inWishlist
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                              >
                                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleMakeOffer(product)}
                                disabled={product.quantityInStock <= 0}
                                className="flex-1 px-2 py-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs rounded-lg hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Make Offer
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {products.length === 0 && (
                  <div className="text-center py-20">
                    <Package className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                    <h3 className="mt-2 text-xl font-medium text-gray-900">No products found</h3>
                    <p className="mt-2 text-gray-500">
                      Try adjusting your filters or search terms
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-6 px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <nav className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <button
                        onClick={() => updateFilter('page', Math.max(1, pagination.page - 1))}
                        disabled={pagination.page === 1}
                        className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
                            className={`px-6 py-3 border-2 rounded-xl text-sm font-semibold transition-all duration-300 ${pagination.page === pageNum
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-transparent shadow-lg'
                                : 'border-gray-200 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => updateFilter('page', Math.min(pagination.pages, pagination.page + 1))}
                        disabled={pagination.page === pagination.pages}
                        className="px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:border-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePage;