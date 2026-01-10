import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { X, ShoppingCart, Package, Trash2, Plus, Minus } from 'lucide-react'
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../../store/slices/storeSlice'

const CartSidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.store?.cart || { items: [], itemCount: 0, total: 0 })
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isOpen && user) {
      document.body.style.overflow = 'hidden'
      dispatch(fetchCart())
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, dispatch, user])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!isOpen) return null

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      await dispatch(removeFromCart(productId))
    } else {
      await dispatch(updateCartItem({ productId, quantity: newQuantity }))
    }
    dispatch(fetchCart())
  }

  const handleRemoveItem = async (productId) => {
    await dispatch(removeFromCart(productId))
    dispatch(fetchCart())
  }

  const handleClearCart = async () => {
    await dispatch(clearCart())
    dispatch(fetchCart())
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0)
  }

  // Check if item has product data or just product ID
  const getProductData = (item) => {
    if (item.product && typeof item.product === 'object') {
      return item.product
    }
    // If product is just an ID, we need to show placeholder
    return {
      _id: item.product,
      productName: 'Product',
      strength: '',
      dosageForm: '',
      price: item.price || 0,
      image: { url: '' }
    }
  }

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
              <ShoppingCart className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Your Cart</h2>
              {cart.itemCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.itemCount}
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

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {!user ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Please login</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You need to be logged in to view your cart
                </p>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Login
                </Link>
              </div>
            ) : cart.items?.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start adding some products!
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {cart.items?.map((item) => {
                  const product = getProductData(item)
                  const itemTotal = (item.price || product.price || 0) * item.quantity
                  
                  return (
                    <div key={item._id || product._id} className="flex items-center space-x-4 py-4 border-b">
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
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.productName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {product.strength && `${product.strength} • `}{product.dosageForm}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.price || product.price || 0)} each
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Vendor: {item.vendorName || 'Unknown'}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center border rounded">
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-1 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(product._id, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(product._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
                
                {cart.items?.length > 0 && (
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear all items
                    </button>
                    <div className="text-sm text-gray-600">
                      Total: <span className="font-bold text-lg text-blue-600 ml-2">
                        {formatPrice(cart.total)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {user && cart.items?.length > 0 && (
            <div className="border-t p-4">
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-lg text-blue-600">{formatPrice(cart.total)}</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Continue Shopping
                </button>
                
                <Link
                  to="/store/checkout"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium text-center hover:bg-blue-700"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CartSidebar