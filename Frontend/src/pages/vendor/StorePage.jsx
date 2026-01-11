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
  Info
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

// Vendor access denied component with enhanced UI
const VendorAccessDenied = () => (
  <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-white relative overflow-hidden">
    <FloatingShape shape="circle" className="top-10 left-10" />
    <FloatingShape shape="square" className="top-20 right-20" />
    <FloatingShape shape="triangle" className="bottom-20 left-1/4" />
    <FloatingShape shape="circle" className="bottom-10 right-10" />
    
    <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
      <div className="max-w-4xl w-full">
        {/* Main message card */}
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

          {/* Action buttons */}
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

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4 group-hover:bg-teal-200 transition-colors">
                <Shield className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Trusted Platform</h3>
              <p className="text-sm text-gray-600">Secure B2B pharmaceutical marketplace</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-4 group-hover:bg-emerald-200 transition-colors">
                <Zap className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Access</h3>
              <p className="text-sm text-gray-600">Quick vendor verification process</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-2xl mb-4 group-hover:bg-teal-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Grow Business</h3>
              <p className="text-sm text-gray-600">Expand your pharmaceutical reach</p>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white transition-all duration-300">
            <div className="text-3xl font-bold text-teal-600 mb-2">10K+</div>
            <div className="text-sm text-gray-600">Active Vendors</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white transition-all duration-300">
            <div className="text-3xl font-bold text-emerald-600 mb-2">50K+</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white transition-all duration-300">
            <div className="text-3xl font-bold text-teal-600 mb-2">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white transition-all duration-300">
            <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-sm text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Enhanced Product Card Component with animations
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0)
  }

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-3 h-3" /> };
    if (stock < 5) return { text: `Limited (${stock})`, color: 'bg-orange-100 text-orange-800', icon: <TrendingUp className="w-3 h-3" /> };
    if (stock < 10) return { text: `Low Stock (${stock})`, color: 'bg-yellow-100 text-yellow-800', icon: <Activity className="w-3 h-3" /> };
    return { text: 'In Stock', color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="w-3 h-3" /> };
  };

  const stockStatus = getStockStatus(product.quantityInStock);

  const handleAddToCartClick = async () => {
    if (product.quantityInStock <= 0) {
      showInfoToast('Product is out of stock');
      return;
    }

    setIsAddingToCart(true);
    try {
      await onAddToCart();
      showSuccessToast(`${product.productName} added to cart!`);
    } catch (error) {
      showErrorToast('Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistClick = async () => {
    try {
      await onToggleWishlist();
      if (isInWishlist) {
        showInfoToast(`${product.productName} removed from wishlist`);
      } else {
        showSuccessToast(`${product.productName} added to wishlist!`);
      }
    } catch (error) {
      showErrorToast('Failed to update wishlist');
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sparkle effect on hover */}
      {isHovered && (
        <div className="absolute top-2 right-2 z-20">
          <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
        </div>
      )}

      {/* Image section with overlay */}
      <div className="relative h-56 bg-gradient-to-br from-teal-50 to-emerald-50 overflow-hidden">
        {product.image?.url && !imageError ? (
          <img
            src={product.image.url}
            alt={product.productName}
            className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Pill className="h-16 w-16 text-teal-400 mb-2 mx-auto animate-pulse" />
              <p className="text-sm text-gray-500">No Image</p>
            </div>
          </div>
        )}

        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`}>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between">
            <button
              onClick={handleWishlistClick}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
            <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110">
              <Eye className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stock status badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${stockStatus.color} backdrop-blur-sm`}>
            {stockStatus.icon}
            {stockStatus.text}
          </span>
        </div>

        {/* Vendor badge */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            <Store className="w-3 h-3" />
            {product.vendorName || 'Vendor'}
          </span>
        </div>
      </div>

      {/* Product details */}
      <div className="p-6 space-y-4">
        {/* Title and NDC */}
        <div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-teal-600 transition-colors">
            {product.productName}
          </h3>
          <p className="text-sm text-gray-500 font-mono">
            NDC: {product.ndcNumber || 'N/A'}
          </p>
        </div>

        {/* Product specs */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-teal-500" />
            <span className="text-gray-700">{product.strength}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Pill className="w-4 h-4 text-emerald-500" />
            <span className="text-gray-700">{product.dosageForm}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-teal-500" />
            <span className="text-gray-700">{product.manufacturer || 'Unknown Manufacturer'}</span>
          </div>
        </div>

        {/* Price section */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <div className="text-2xl font-bold text-teal-600">
              {formatPrice(product.price)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              per unit
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Stock: <span className={`font-semibold ${product.quantityInStock <= 0 ? 'text-red-600' :
                  product.quantityInStock < 5 ? 'text-orange-600' :
                    product.quantityInStock < 10 ? 'text-yellow-600' :
                      'text-emerald-600'
                }`}>
                {product.quantityInStock || 0}
              </span>
            </div>
            {product.quantityInStock > 0 && product.quantityInStock < 10 && (
              <div className="text-xs text-orange-600 font-medium">
                Only {product.quantityInStock} left!
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleAddToCartClick}
          disabled={product.quantityInStock <= 0 || isAddingToCart}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 relative overflow-hidden ${product.quantityInStock <= 0 || isAddingToCart
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
            }`}
        >
          {isAddingToCart ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </span>
          ) : product.quantityInStock <= 0 ? (
            <span className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              Out of Stock
            </span>
          ) : product.quantityInStock < 5 ? (
            <span className="flex items-center justify-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Limited Stock - Add to Cart
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Add to Cart
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

const StorePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
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

  // Check if vendor is authenticated
  const isVendorAuthenticated = authService.isVendorAuthenticated();
  const vendorData = authService.getStoredVendor();

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
      return true; // Return success
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error; // Throw error to be caught by component
    }
  };

  const handleToggleWishlist = async (productId, isInWishlist) => {
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap();
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
      }
      dispatch(fetchWishlist());
      return true; // Return success
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      throw error; // Throw error to be caught by component
    }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Filters Toggle */}
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl hover:from-teal-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Filter className="w-5 h-5 mr-3" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

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

          {/* Main Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                All Products
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.map((product) => {
                    const inWishlist = isInWishlist(product._id)
                    return (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={() => handleAddToCart(product._id)}
                        onToggleWishlist={() => handleToggleWishlist(product._id, inWishlist)}
                        isInWishlist={inWishlist}
                      />
                    )
                  })}
                </div>

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
                        let pageNum
                        if (pagination.pages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i
                        } else {
                          pageNum = pagination.page - 2 + i
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
                        )
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