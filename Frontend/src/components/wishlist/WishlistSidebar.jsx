import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { 
  X, 
  Heart, 
  Package, 
  Trash2, 
  ShoppingCart, 
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react'
import {
  fetchWishlist,
  removeFromWishlist,
  moveToCart,
  fetchCart
} from '../../store/slices/storeSlice'

const WishlistSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const wishlist = useSelector((state) => state.store?.wishlist || { products: [] })
  const cart = useSelector((state) => state.store?.cart || { items: [] })
  const { user } = useSelector((state) => state.auth)
  const [movingToCart, setMovingToCart] = useState({})

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      dispatch(fetchWishlist())
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, dispatch])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap()
      dispatch(fetchWishlist())
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  const handleMoveToCart = async (productId) => {
    try {
      setMovingToCart(prev => ({ ...prev, [productId]: true }))
      await dispatch(moveToCart({ productId, quantity: 1 })).unwrap()
      // Remove from wishlist after successful move to cart
      await dispatch(removeFromWishlist(productId)).unwrap()
      // Refresh both wishlist and cart
      dispatch(fetchWishlist())
      dispatch(fetchCart())
    } catch (error) {
      console.error('Failed to move to cart:', error)
    } finally {
      setMovingToCart(prev => ({ ...prev, [productId]: false }))
    }
  }

  const isInCart = (productId) => {
    return cart.items?.some(item => item.product?._id === productId) || false
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0)
  }

  const getStockStatus = (stock) => {
    if (stock === 0) {
      return {
        text: 'Out of Stock',
        className: 'text-red-600 bg-red-50',
        icon: <AlertCircle className="w-3 h-3" />
      }
    }
    if (stock < 10) {
      return {
        text: 'Low Stock',
        className: 'text-yellow-600 bg-yellow-50',
        icon: <AlertCircle className="w-3 h-3" />
      }
    }
    return {
      text: 'In Stock',
      className: 'text-green-600 bg-green-50',
      icon: <CheckCircle className="w-3 h-3" />
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="text-lg font-semibold">My Wishlist</h2>
              {wishlist.products?.length > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlist.products.length}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Wishlist Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {!user ? (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sign in to save items</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Login to view your wishlist
                </p>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign In
                </Link>
              </div>
            ) : wishlist.products?.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Save products you like to your wishlist
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  {wishlist.products.length} item{wishlist.products.length !== 1 ? 's' : ''} in your wishlist
                </p>
                
                <div className="space-y-4">
                  {wishlist.products?.map((item) => {
                    const product = item.product || item
                    const stockStatus = getStockStatus(product.quantityInStock)
                    const inCart = isInCart(product._id)
                    const moving = movingToCart[product._id]
                    
                    return (
                      <div key={product._id} className="flex space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {product.image?.url ? (
                            <img
                              src={product.image.url}
                              alt={product.productName}
                              className="h-16 w-16 object-contain rounded"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-gray-100 rounded flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                {product.productName}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {product.strength} • {product.dosageForm}
                              </p>
                              <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stockStatus.className}`}>
                                  {stockStatus.icon}
                                  <span className="ml-1">{stockStatus.text}</span>
                                </span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleRemoveFromWishlist(product._id)}
                              className="ml-2 p-1 text-gray-400 hover:text-red-600 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-sm font-bold text-blue-600">
                              {formatPrice(product.price)}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/store/product/${product._id}`}
                                onClick={onClose}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              
                              {product.quantityInStock > 0 ? (
                                inCart ? (
                                  <span className="px-2 py-1 text-xs text-green-600 bg-green-50 rounded">
                                    In Cart
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleMoveToCart(product._id)}
                                    disabled={moving}
                                    className={`px-3 py-1 text-xs font-medium rounded ${
                                      moving
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                  >
                                    {moving ? (
                                      <span className="flex items-center">
                                        <svg className="animate-spin h-3 w-3 mr-1 text-white" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Adding...
                                      </span>
                                    ) : (
                                      <span className="flex items-center">
                                        <ShoppingCart className="w-3 h-3 mr-1" />
                                        Add to Cart
                                      </span>
                                    )}
                                  </button>
                                )
                              ) : (
                                <span className="px-3 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total items:</span>
                    <span className="font-medium">{wishlist.products.length}</span>
                  </div>
                  
                  <button
                    onClick={() => {
                      // Move all available items to cart
                      wishlist.products.forEach(item => {
                        const product = item.product || item
                        if (product.quantityInStock > 0 && !isInCart(product._id)) {
                          handleMoveToCart(product._id)
                        }
                      })
                    }}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add All Available to Cart
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {(user && wishlist.products?.length > 0) && (
            <div className="border-t p-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Continue Shopping
                </button>
                
                <Link
                  to="/store"
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium text-center hover:bg-blue-700"
                >
                  Browse More Products
                </Link>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Items remain in your wishlist until you remove them
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default WishlistSidebar