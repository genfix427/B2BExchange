import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Package,
  Heart,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react'
import { 
  fetchStoreProducts, 
  fetchFeaturedProducts,
  fetchStoreFilters,
  fetchCart,
  fetchWishlist,
  addToCart,
  addToWishlist,
  removeFromWishlist,
  setFilters,
  clearFilters
} from '../../store/slices/storeSlice'

const StorePage = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const {
    products = [],
    featuredProducts = [],
    loading = false,
    error = null,
    wishlist = { products: [] },
    filters,
    availableFilters = { dosageForms: [], vendors: [] },
    pagination = { page: 1, limit: 12, total: 0, pages: 1 }
  } = useSelector((state) => state.store || {})

  const storeState = useSelector((state) => state.store);
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    search: '',
    category: '',
    vendor: '',
    minPrice: '',
    maxPrice: '',
    inStock: true,
    sort: 'newest'
  })

  useEffect(() => {
    dispatch(fetchStoreProducts(filters))
    dispatch(fetchFeaturedProducts())
    dispatch(fetchStoreFilters())
    dispatch(fetchCart())
    dispatch(fetchWishlist())
  }, [dispatch, filters])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== localFilters.search) {
        setLocalFilters(prev => ({ ...prev, search: searchQuery }))
        dispatch(setFilters({ ...filters, search: searchQuery }))
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, dispatch])

  const handleAddToCart = async (productId) => {
    try {
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap()
      // Show success message or update UI
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleToggleWishlist = async (productId, isInWishlist) => {
    try {
      if (isInWishlist) {
        await dispatch(removeFromWishlist(productId)).unwrap()
      } else {
        await dispatch(addToWishlist(productId)).unwrap()
      }
      dispatch(fetchWishlist()) // Refresh wishlist data
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }

  const isInWishlist = (productId) => {
    return wishlist?.products?.some(
      (item) => item.product?._id === productId || item.product?._id === productId
    ) || false
  }

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    dispatch(setFilters(newFilters))
  }

  const clearAllFilters = () => {
    dispatch(clearFilters())
    setSearchQuery('')
    setLocalFilters({
      search: '',
      category: '',
      vendor: '',
      minPrice: '',
      maxPrice: '',
      inStock: true,
      sort: 'newest'
    })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Store Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">B2B Pharmaceutical Marketplace</h1>
              <p className="text-gray-600 mt-1">Source products from trusted vendors</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by NDC, name, or manufacturer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-96"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {pagination.total} products found
            </span>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {availableFilters.dosageForms?.map((form) => (
                    <option key={form} value={form}>{form}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  value={filters.vendor || ''}
                  onChange={(e) => updateFilter('vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Vendors</option>
                  {availableFilters.vendors?.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock !== false}
                    onChange={(e) => updateFilter('inStock', e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={filters.sort || 'newest'}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Featured Products */}
        {!loading && featuredProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => {
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
          </div>
        )}

        {/* Main Products Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Products</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your filters or search terms
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Clear all filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="mt-8 flex justify-center">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => updateFilter('page', Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className={`px-3 py-2 border rounded-md text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => updateFilter('page', Math.min(pagination.pages, pagination.page + 1))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}

// Product Card Component
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isInWishlist }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0)
  }

  const getStatusBadge = (status, stock) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      )
    }
    if (stock < 10) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
        In Stock
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative">
        <div className="h-48 bg-gray-100">
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
        </div>
        
        <button
          onClick={onToggleWishlist}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-50 z-10"
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
        
        <div className="absolute top-2 left-2">
          {getStatusBadge(product.status, product.quantityInStock)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">
            {product.productName}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            NDC: {product.ndcNumber || 'N/A'}
          </p>
        </div>
        
        <div className="mb-3">
          <p className="text-sm text-gray-700">
            {product.strength} • {product.dosageForm}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {product.manufacturer || 'Unknown'}
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-blue-600">
            {formatPrice(product.price)}
          </div>
          <div className="text-xs text-gray-500">
            {product.vendorName || 'Vendor'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Stock: <span className={`font-medium ${product.quantityInStock < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
              {product.quantityInStock || 0}
            </span>
          </div>
          
          <button
            onClick={onAddToCart}
            disabled={product.quantityInStock === 0}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              product.quantityInStock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {product.quantityInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StorePage