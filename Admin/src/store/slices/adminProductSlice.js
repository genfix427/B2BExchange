import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productService } from '../../services/product.service';

// Async thunks
export const fetchAllProducts = createAsyncThunk(
    'adminProducts/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await productService.getAllProducts(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch products');
        }
    }
);

export const fetchAdminProduct = createAsyncThunk(
    'adminProducts/fetchProduct',
    async (id, { rejectWithValue }) => {
        try {
            const response = await productService.getAdminProduct(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch product');
        }
    }
);

export const updateProductAdmin = createAsyncThunk(
    'adminProducts/updateProduct',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await productService.updateProductAdmin(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update product');
        }
    }
);

export const deleteProductAdmin = createAsyncThunk(
    'adminProducts/deleteProduct',
    async (id, { rejectWithValue }) => {
        try {
            await productService.deleteProductAdmin(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to delete product');
        }
    }
);

export const fetchAdminProductStats = createAsyncThunk(
    'adminProducts/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await productService.getAdminProductStats();
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
        totalVendors: 0,
        totalStock: 0,
        totalValue: 0,
        avgPrice: 0
    },
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 1
    }
};

// Slice
const adminProductSlice = createSlice({
    name: 'adminProducts',
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
            // Fetch All Products
            .addCase(fetchAllProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload?.data || [];
                state.pagination = action.payload?.pagination || state.pagination;
            })

            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })


            // Fetch Single Product
            .addCase(fetchAdminProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.currentProduct = null;
            })
            .addCase(fetchAdminProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProduct = action.payload;
            })
            .addCase(fetchAdminProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Product
            .addCase(updateProductAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateProductAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentProduct = action.payload;
                const index = state.products.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProductAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Product
            .addCase(deleteProductAdmin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProductAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(p => p._id !== action.payload);
            })
            .addCase(deleteProductAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Stats
            .addCase(fetchAdminProductStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdminProductStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
            })
            .addCase(fetchAdminProductStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearError, clearSuccess, setCurrentProduct, resetCurrentProduct } = adminProductSlice.actions;
export default adminProductSlice.reducer;