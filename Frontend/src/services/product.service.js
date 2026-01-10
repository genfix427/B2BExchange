// src/services/product.service.js

import { api } from './api'
import { authService } from './auth.service'

export const productService = {
  // ✅ CREATE PRODUCT
  async createProduct(formData) {
    const response = await api.upload('/vendor/products', formData)
    return response.data
  },

  // ✅ GET ALL VENDOR PRODUCTS
  async getVendorProducts(params = {}) {
    const query = new URLSearchParams(params).toString()
    return api.get(`/vendor/products${query ? `?${query}` : ''}`)
  },

  // ✅ GET SINGLE PRODUCT
  async getVendorProduct(id) {
    const response = await api.get(`/vendor/products/${id}`)
    return response.data
  },

  // ✅ UPDATE PRODUCT (PUT FIXED)
  async updateProduct(id, formData) {
    const response = await api.upload(
      `/vendor/products/${id}`,
      formData,
      { method: 'PUT' } // ✅ WORKS NOW
    )
    return response.data
  },

  // ✅ DELETE PRODUCT
  async deleteProduct(id) {
    const response = await api.delete(`/vendor/products/${id}`)
    return response.data
  },

  // ✅ PRODUCT STATS
  async getProductStats() {
    return api.get('/vendor/products/stats')
  },

  // src/services/product.service.js - Update these methods

async getStoreProducts(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `/store/products${query ? `?${query}` : ''}`;
    
    console.log('🛍️ Fetching store products from:', url);
    
    const response = await api.get(url);
    
    console.log('🛍️ Store products API response:', {
      success: response.success,
      count: response.count,
      data: response.data?.length || 0,
      pagination: response.pagination
    });
    
    // Transform response to match frontend structure
    return {
      data: response.data || [],
      pagination: response.pagination || {
        page: response.page || 1,
        limit: parseInt(params.limit) || 12,
        total: response.total || 0,
        pages: response.pages || 1
      }
    };
  } catch (error) {
    console.error('🛍️ Error fetching store products:', error);
    throw error;
  }
},

async getStoreProduct(id) {
  const response = await api.get(`/store/products/${id}`);
  console.log('🛍️ Single product response:', response);
  return response.data; // Return data directly
},

async getFeaturedProducts() {
  try {
    const response = await api.get('/store/products/featured');
    console.log('🛍️ Featured products response:', response);
    
    // Check response structure
    if (response.data) {
      return {
        data: response.data
      };
    }
    return response;
  } catch (error) {
    console.error('🛍️ Error fetching featured products:', error);
    throw error;
  }
},

  async searchProducts(query) {
    return api.get(`/store/products/search?q=${encodeURIComponent(query)}`)
  },

  async getStoreFilters() {
    return api.get('/store/products/filters')
  },

  async getCart() {
    const response = await api.get('/store/cart')
    // Transform the response to match frontend structure
    if (response.data) {
      const cart = response.data
      return {
        data: {
          _id: cart._id,
          customer: cart.customer,
          items: cart.items || [],
          total: cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
          itemCount: cart.items?.reduce((count, item) => count + item.quantity, 0) || 0
        }
      }
    }
    return response
  },

  async addToCart(productId, quantity = 1) {
    const response = await api.post('/store/cart/items', { productId, quantity })
    // Transform the response
    if (response.data) {
      const cart = response.data
      return {
        data: {
          _id: cart._id,
          customer: cart.customer,
          items: cart.items || [],
          total: cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
          itemCount: cart.items?.reduce((count, item) => count + item.quantity, 0) || 0
        }
      }
    }
    return response
  },

  async updateCartItem(productId, quantity) {
    const response = await api.put(`/store/cart/items/${productId}`, { quantity })
    // Transform the response
    if (response.data) {
      const cart = response.data
      return {
        data: {
          _id: cart._id,
          customer: cart.customer,
          items: cart.items || [],
          total: cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
          itemCount: cart.items?.reduce((count, item) => count + item.quantity, 0) || 0
        }
      }
    }
    return response
  },

  async removeFromCart(productId) {
    const response = await api.delete(`/store/cart/items/${productId}`)
    // Transform the response
    if (response.data) {
      const cart = response.data
      return {
        data: {
          _id: cart._id,
          customer: cart.customer,
          items: cart.items || [],
          total: cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
          itemCount: cart.items?.reduce((count, item) => count + item.quantity, 0) || 0
        }
      }
    }
    return response
  },

  async clearCart() {
    const response = await api.delete('/store/cart')
    // Transform the response
    if (response.data) {
      const cart = response.data
      return {
        data: {
          _id: cart._id,
          customer: cart.customer,
          items: cart.items || [],
          total: cart.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0,
          itemCount: cart.items?.reduce((count, item) => count + item.quantity, 0) || 0
        }
      }
    }
    return response
  },

  // WISHLIST methods - FIXED
  async getWishlist() {
    const response = await api.get('/store/wishlist')
    // Transform the response
    if (response.data) {
      const wishlist = response.data
      return {
        data: {
          _id: wishlist._id,
          vendor: wishlist.vendor,
          products: wishlist.products || [],
          productCount: wishlist.products?.length || 0
        }
      }
    }
    return response
  },

  async addToWishlist(productId) {
    const response = await api.post('/store/wishlist/items', { productId })
    // Transform the response
    if (response.data) {
      const wishlist = response.data
      return {
        data: {
          _id: wishlist._id,
          vendor: wishlist.vendor,
          products: wishlist.products || [],
          productCount: wishlist.products?.length || 0
        }
      }
    }
    return response
  },

  async removeFromWishlist(productId) {
    const response = await api.delete(`/store/wishlist/items/${productId}`)
    // Transform the response
    if (response.data) {
      const wishlist = response.data
      return {
        data: {
          _id: wishlist._id,
          vendor: wishlist.vendor,
          products: wishlist.products || [],
          productCount: wishlist.products?.length || 0
        }
      }
    }
    return response
  },

  async moveToCart(productId, quantity = 1) {
    // First add to cart
    const cartResponse = await api.post('/store/cart/items', { productId, quantity })
    // Then remove from wishlist
    await api.delete(`/store/wishlist/items/${productId}`)

    // Get updated cart and wishlist
    const updatedCart = await this.getCart()
    const updatedWishlist = await this.getWishlist()

    return {
      data: {
        cart: updatedCart.data,
        wishlist: updatedWishlist.data
      }
    }
  },
  // ORDER methods
  async createOrder(orderData) {
    return api.post('/store/orders', orderData);
  },

  // ✅ FIXED: Get customer's purchase orders (orders where they are the customer)
  // src/services/product.service.js - Add logging to getOrders method
async getOrders(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `/store/orders${query ? `?${query}` : ''}`;
    
    console.log('🛒 Fetching purchase orders from:', url);
    
    // ✅ Use authService to get vendor info
    const vendorId = authService.getVendorId();
    const token = authService.getToken();
    
    console.log('🔐 Auth Status:');
    console.log('✅ Vendor ID:', vendorId);
    console.log('✅ Token exists:', !!token);
    console.log('✅ Vendor authenticated:', authService.isVendorAuthenticated());
    
    if (token) {
      console.log('✅ Token preview:', token.substring(0, 20) + '...');
    }
    
    if (!authService.isVendorAuthenticated()) {
      console.error('❌ Vendor not authenticated. Redirecting to login...');
      // You might want to redirect to login here
      window.location.href = '/vendor/login';
      throw new Error('Not authenticated');
    }
    
    console.log('🛒 Parameters:', params);
    
    const response = await api.get(url);
    
    console.log('🛒 Purchase orders API response:', response);
    
    // Transform response to match frontend structure
    return {
      data: response.data || [],
      pagination: {
        page: response.page || 1,
        limit: parseInt(params.limit) || 10,
        total: response.total || 0,
        pages: response.pages || 1
      }
    };
  } catch (error) {
    console.error('🛒 Error fetching purchase orders:', error);
    console.error('🛒 Error status:', error.statusCode);
    console.error('🛒 Error message:', error.message);
    
    // Check if it's an authentication error
    if (error.statusCode === 401 || error.statusCode === 403) {
      console.error('🔐 AUTHENTICATION ERROR: Logging out...');
      authService.clearVendorStorage();
      window.location.href = '/vendor/login';
    }
    
    // Return empty data for now to prevent crashes
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
      }
    };
  }
},

  // ✅ FIXED: Get single order details for customer
  async getOrder(id) {
    const response = await api.get(`/store/orders/${id}`);

    // Transform to match frontend structure
    if (response.data) {
      const order = response.data;
      return {
        data: {
          ...order,
          // Calculate totals from items
          subtotal: order.items?.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0) || 0,
          itemCount: order.items?.reduce((count, item) => count + item.quantity, 0) || 0
        }
      };
    }
    return response;
  },

  // Vendor order methods - Seller Orders
  async getVendorOrders(params = {}) {
    const query = new URLSearchParams(params).toString()
    return api.get(`/vendor/orders${query ? `?${query}` : ''}`)
  },

  async updateOrderStatus(orderId, data) {
    return api.put(`/vendor/orders/${orderId}/status`, data)
  },

  async getVendorOrderDetails(orderId) {
    return api.get(`/vendor/orders/${orderId}`)
  },

  // Vendor stats
  async getVendorStats() {
    return api.get('/vendor/stats')
  }
}
