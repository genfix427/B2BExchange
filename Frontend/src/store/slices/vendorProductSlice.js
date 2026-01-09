import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/product.service';

// Async thunks
export const createProduct = createAsyncThunk(
  'vendorProducts/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await productService.createProduct(formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create product');
    }
  }
);

export const fetchVendorProducts = createAsyncThunk(
  'vendorProducts/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await productService.getVendorProducts(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch products');
    }
  }
);

export const fetchVendorProduct = createAsyncThunk(
  'vendorProducts/fetchProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await productService.getVendorProduct(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'vendorProducts/updateProduct',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await productService.updateProduct(id, formData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'vendorProducts/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete product');
    }
  }
);

export const fetchProductStats = createAsyncThunk(
  'vendorProducts/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.getProductStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch stats');
    }
  }
);

// Initial state
const initialState = {
  products: [],
  currentProduct: null,
  loading: false,
  error: null,
  success: false,
  stats: {
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalStock: 0,
    totalValue: 0
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  }
};

// Slice
const vendorProductSlice = createSlice({
  name: 'vendorProducts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    resetCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Products
      .addCase(fetchVendorProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination || initialState.pagination;
      })
      .addCase(fetchVendorProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Product
      .addCase(fetchVendorProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentProduct = null;
      })
      .addCase(fetchVendorProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchVendorProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentProduct = action.payload;
        const index = state.products.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Stats
      .addCase(fetchProductStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProductStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, setCurrentProduct, resetCurrentProduct } = vendorProductSlice.actions;
export default vendorProductSlice.reducer;