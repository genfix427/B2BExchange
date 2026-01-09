import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Package,
  ShoppingCart,
  Star,
  Building2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { fetchStoreProducts, addToCart } from '../../store/slices/storeSlice';

const StorePage = () => {
  const dispatch = useDispatch();
  const { products, loading, error, cart } = useSelector((state) => state.store);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    dispatch(fetchStoreProducts(filters));
  }, [dispatch, filters]);

  const handleAddToCart = (product) => {
    if (product.quantityInStock > 0) {
      dispatch(addToCart(product));
    }
  };

  const getStatusBadge = (status, stock) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          In Stock
        </span>
      );
    }
    return null;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">PharmaExchange</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              </div>
              
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>
              
              {/* Cart */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="Tablet">Tablets</option>
                  <option value="Capsule">Capsules</option>
                  <option value="Injection">Injections</option>
                  <option value="Solution">Solutions</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="$1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Products Marketplace</h1>
              <p className="text-gray-600 mt-1">Browse products from trusted vendors</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gray-100">
                    {product.image?.url ? (
                      <img
                        src={product.image.url}
                        alt={product.productName}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(product.status, product.quantityInStock)}
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {product.productName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.strength} • {product.dosageForm}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-xs text-gray-500">
                          per unit
                        </div>
                      </div>
                    </div>
                    
                    {/* Manufacturer */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <Building2 className="w-4 h-4 mr-1" />
                      {product.manufacturer}
                    </div>
                    
                    {/* Vendor Info */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-600">Sold by:</span>
                          <span className="font-medium ml-1">{product.vendorName}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Stock: {product.quantityInStock}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="mt-4">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.quantityInStock === 0}
                        className={`w-full px-4 py-2 rounded-md font-medium text-white flex items-center justify-center ${
                          product.quantityInStock === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.quantityInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCart(false)} />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="relative w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                      <button
                        onClick={() => setShowCart(false)}
                        className="ml-3 h-7 w-7 text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-8">
                      {cart.items.length === 0 ? (
                        <div className="text-center py-8">
                          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500">Your cart is empty</p>
                        </div>
                      ) : (
                        <div className="flow-root">
                          <ul className="-my-6 divide-y divide-gray-200">
                            {cart.items.map((item) => (
                              <li key={item._id} className="py-6 flex">
                                <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                                  {item.image?.url ? (
                                    <img
                                      src={item.image.url}
                                      alt={item.productName}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4 flex-1 flex flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3 className="text-sm">{item.productName}</h3>
                                      <p className="ml-4">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">{item.manufacturer}</p>
                                  </div>
                                  <div className="flex-1 flex items-end justify-between text-sm">
                                    <div className="flex items-center">
                                      <button
                                        onClick={() => dispatch(updateCartQuantity({ 
                                          productId: item._id, 
                                          quantity: Math.max(0, item.quantity - 1) 
                                        }))}
                                        className="p-1 text-gray-400 hover:text-gray-500"
                                      >
                                        <Minus className="w-4 h-4" />
                                      </button>
                                      <span className="mx-2 text-gray-700">{item.quantity}</span>
                                      <button
                                        onClick={() => dispatch(updateCartQuantity({ 
                                          productId: item._id, 
                                          quantity: item.quantity + 1 
                                        }))}
                                        disabled={item.quantity >= item.quantityInStock}
                                        className="p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <button
                                      onClick={() => dispatch(removeFromCart(item._id))}
                                      className="font-medium text-red-600 hover:text-red-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {cart.items.length > 0 && (
                    <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>{formatPrice(cart.totalAmount)}</p>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        Shipping and taxes calculated at checkout.
                      </p>
                      <div className="mt-6">
                        <button className="w-full bg-blue-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-blue-700">
                          Checkout
                        </button>
                      </div>
                      <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                        <p>
                          or{' '}
                          <button
                            onClick={() => setShowCart(false)}
                            className="text-blue-600 font-medium hover:text-blue-500"
                          >
                            Continue Shopping
                            <span aria-hidden="true"> &rarr;</span>
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;