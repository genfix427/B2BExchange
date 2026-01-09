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
      const response = await productService.getProductDetails(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch product details');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'store/searchProducts',
  async (query, { rejectWithValue }) => {
    try {
      const response = await productService.searchProducts(query);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search products');
    }
  }
);

// Cart thunks
export const addToCart = createAsyncThunk(
  'store/addToCart',
  async (product, { getState, rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, we'll just return the product
      return product;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add to cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'store/removeFromCart',
  async (productId, { getState, rejectWithValue }) => {
    try {
      return productId;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to remove from cart');
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'store/updateCartQuantity',
  async ({ productId, quantity }, { getState, rejectWithValue }) => {
    try {
      return { productId, quantity };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update cart');
    }
  }
);

// Initial state
const initialState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  loading: false,
  error: null,
  cart: {
    items: [],
    totalItems: 0,
    totalAmount: 0
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
    inStock: true
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
    clearCart: (state) => {
      state.cart = initialState.cart;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Store Products
      .addCase(fetchStoreProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStoreProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data || [];
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchStoreProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentProduct = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search Products
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const existingItem = state.cart.items.find(item => item._id === action.payload._id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.cart.items.push({
            ...action.payload,
            quantity: 1
          });
        }
        
        // Update totals
        state.cart.totalItems = state.cart.items.reduce((total, item) => total + item.quantity, 0);
        state.cart.totalAmount = state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove from Cart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart.items = state.cart.items.filter(item => item._id !== action.payload);
        
        // Update totals
        state.cart.totalItems = state.cart.items.reduce((total, item) => total + item.quantity, 0);
        state.cart.totalAmount = state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Cart Quantity
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, quantity } = action.payload;
        const item = state.cart.items.find(item => item._id === productId);
        
        if (item) {
          item.quantity = quantity;
          if (quantity <= 0) {
            state.cart.items = state.cart.items.filter(item => item._id !== productId);
          }
        }
        
        // Update totals
        state.cart.totalItems = state.cart.items.reduce((total, item) => total + item.quantity, 0);
        state.cart.totalAmount = state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      })
      .addCase(updateCartQuantity.rejected, (state, action) => {
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
  clearCart 
} = storeSlice.actions;

export default storeSlice.reducer;