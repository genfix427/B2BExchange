// store/slices/storeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/product.service';

// Async thunks
export const fetchStoreProducts = createAsyncThunk(
  'store/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getStoreProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'store/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getStoreProduct(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch product details');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'store/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getFeaturedProducts();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch featured products');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'store/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search products');
    }
  }
);

export const fetchStoreFilters = createAsyncThunk(
  'store/fetchFilters',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getStoreFilters();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch filters');
    }
  }
);

export const fetchCart = createAsyncThunk(
  'store/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getCart()
      // The service already transforms the data
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch cart')
    }
  }
);

export const addToCart = createAsyncThunk(
  'store/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await productService.addToCart(productId, quantity)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add to cart')
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'store/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await productService.updateCartItem(productId, quantity)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cart item')
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'store/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productService.removeFromCart(productId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove from cart')
    }
  }
);

export const clearCart = createAsyncThunk(
  'store/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.clearCart()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to clear cart')
    }
  }
);

// Wishlist thunks - FIXED
export const fetchWishlist = createAsyncThunk(
  'store/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getWishlist()
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch wishlist')
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'store/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productService.addToWishlist(productId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add to wishlist')
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'store/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await productService.removeFromWishlist(productId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove from wishlist')
    }
  }
);

export const moveToCart = createAsyncThunk(
  'store/moveToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await productService.moveToCart(productId, quantity)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to move to cart')
    }
  }
);

export const createOrder = createAsyncThunk(
  'store/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await productService.createOrder(orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create order');
    }
  }
);

// ✅ FIXED: Fetch customer orders (purchase orders)
export const fetchOrders = createAsyncThunk(
  'store/fetchOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getOrders(params);
      // The service now returns { data: [], pagination: {} }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch orders');
    }
  }
);

// ✅ FIXED: Get single order for customer
export const fetchOrderDetails = createAsyncThunk(
  'store/fetchOrderDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getOrder(id);
      return response.data; // Already transformed in service
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch order details');
    }
  }
);

// ✅ FIXED: Fetch vendor orders (seller orders)
export const fetchVendorOrders = createAsyncThunk(
  'store/fetchVendorOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getVendorOrders(params);
      return response; // Already transformed in service
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor orders');
    }
  }
);

// Vendor order thunks (for seller orders)
// export const fetchVendorOrders = createAsyncThunk(
//   'store/fetchVendorOrders',
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const response = await productService.getVendorOrders(params);
//       return response;
//     } catch (error) {
//       return rejectWithValue(error.message || 'Failed to fetch vendor orders');
//     }
//   }
// );

export const updateOrderStatus = createAsyncThunk(
  'store/updateOrderStatus',
  async ({ orderId, status, trackingNumber, carrier }, { rejectWithValue }) => {
    try {
      const response = await productService.updateOrderStatus(orderId, { status, trackingNumber, carrier });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update order status');
    }
  }
);

export const fetchVendorOrderDetails = createAsyncThunk(
  'store/fetchVendorOrderDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getVendorOrderDetails(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vendor order details');
    }
  }
);

// Initial state
const initialState = {
  products: [],
  featuredProducts: [],
  shippingAddresses: [],
  vendorOrders: [],
   vendorOrdersPagination: { // Added pagination for vendor orders
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },
  currentProduct: null,
  currentOrder: null, // Added for single order view
  currentVendorOrder: null, // Added for single vendor order view
  loading: false,
  error: null,
  cart: {
    _id: null,
    items: [],
    total: 0,
    itemCount: 0
  },
  wishlist: {
    _id: null,
    products: []
  },
  orders: {
    list: [],
    currentOrder: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    }
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  },
  filters: {
    search: '',
    category: '',
    vendor: '',
    minPrice: '',
    maxPrice: '',
    inStock: true,
    sort: 'newest'
  },
  availableFilters: {
    dosageForms: [],
    priceRange: { minPrice: 0, maxPrice: 1000 },
    vendors: []
  }
};

// Slice
const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    resetCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCart: (state, action) => {
      state.cart = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Store Products
      // Fetch Store Products - FIXED THIS
    .addCase(fetchStoreProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchStoreProducts.fulfilled, (state, action) => {
      state.loading = false;
      // Check the actual response structure
      console.log('Store products response:', action.payload); // Add this for debugging
      
      // Fix: Check if action.payload has data property or if it's the data itself
      if (action.payload && action.payload.data) {
        state.products = action.payload.data;
        state.pagination = action.payload.pagination || initialState.pagination;
      } else if (Array.isArray(action.payload)) {
        // If payload is directly an array
        state.products = action.payload;
      } else {
        state.products = [];
      }
    })
    .addCase(fetchStoreProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // Fetch Featured Products - FIXED THIS
    .addCase(fetchFeaturedProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
      state.loading = false;
      console.log('Featured products response:', action.payload); // Add this for debugging
      
      // Fix: Check the actual response structure
      if (Array.isArray(action.payload)) {
        state.featuredProducts = action.payload;
      } else if (action.payload && action.payload.data) {
        state.featuredProducts = action.payload.data;
      } else {
        state.featuredProducts = [];
      }
    })
    .addCase(fetchFeaturedProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Store Filters
      .addCase(fetchStoreFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.availableFilters = action.payload;
      })
      .addCase(fetchStoreFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })

      // Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })

      // Orders
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Clear cart after successful order
        state.cart = {
          _id: null,
          items: [],
          total: 0,
          itemCount: 0
        };
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.list = action.payload.data || [];
        state.orders.pagination = action.payload.pagination || initialState.orders.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ FIXED: Fetch Order Details for Customer
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ FIXED: Fetch Vendor Orders (Seller Orders)
      .addCase(fetchVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorOrders = action.payload.data || [];
        state.vendorOrdersPagination = action.payload.pagination || initialState.vendorOrdersPagination;
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // .addCase(fetchVendorOrders.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchVendorOrders.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.vendorOrders = action.payload.data || [];
      //   state.vendorOrdersPagination = action.payload.pagination || { page: 1, limit: 10, total: 0, pages: 1 };
      // })
      // .addCase(fetchVendorOrders.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the order in vendorOrders array
        const updatedOrder = action.payload;
        const index = state.vendorOrders.findIndex(order => order._id === updatedOrder._id);
        if (index !== -1) {
          state.vendorOrders[index] = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchVendorOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVendorOrder = action.payload;
      })
      .addCase(fetchVendorOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  setCurrentProduct,
  resetCurrentProduct,
  setFilters,
  clearFilters,
  setCart
} = storeSlice.actions;

// Selectors
// ✅ SAFE cart selectors
export const selectCartTotal = (state) =>
  state.store?.cart?.total ?? 0;

export const selectCartItemCount = (state) =>
  state.store?.cart?.itemCount ?? 0;

export const selectCartItems = (state) =>
  state.store?.cart?.items ?? [];

export const selectWishlistProducts = (state) =>
  state.store?.wishlist?.products ?? [];

export const selectWishlistCount = (state) =>
  state.store?.wishlist?.products?.length ?? 0;

export const selectIsInWishlist = (productId) => (state) =>
  state.store?.wishlist?.products?.some(
    (item) => item.product?._id === productId
  ) ?? false;

// ✅ Vendor Orders Selector
// export const selectVendorOrders = (state) => state.store.vendorOrders || [];

// ✅ Vendor Orders Selector
export const selectVendorOrders = (state) => state.store.vendorOrders || [];

// ✅ Customer Orders Selector
export const selectCustomerOrders = (state) => state.store.orders.list || [];

// ✅ Current Order Selector
export const selectCurrentOrder = (state) => state.store.orders.currentOrder;



export default storeSlice.reducer;