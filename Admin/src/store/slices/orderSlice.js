import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

// Async thunks
export const fetchVendorOrderStats = createAsyncThunk(
    'orders/fetchVendorOrderStats',
    async ({ vendorId, period = 'month' }, { rejectWithValue }) => {
        try {
            const response = await orderService.getVendorOrderStats(vendorId, period);
            return { vendorId, ...response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch vendor stats');
        }
    }
);

export const fetchVendorSellOrders = createAsyncThunk(
    'orders/fetchVendorSellOrders',
    async ({ vendorId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await orderService.getVendorSellOrders(vendorId, params);
            return { vendorId, ...response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch vendor sell orders');
        }
    }
);

export const fetchVendorPurchaseOrders = createAsyncThunk(
    'orders/fetchVendorPurchaseOrders',
    async ({ vendorId, params = {} }, { rejectWithValue }) => {
        try {
            const response = await orderService.getVendorPurchaseOrders(vendorId, params);
            return { vendorId, ...response };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch vendor purchase orders');
        }
    }
);


export const updateOrderStatus = createAsyncThunk(
    'orders/updateOrderStatus',
    async ({ orderId, data }, { rejectWithValue }) => {
        try {
            const response = await orderService.updateOrderStatus(orderId, data);
            return { orderId, ...response };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const generateInvoice = createAsyncThunk(
    'orders/generateInvoice',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await orderService.generateInvoice(orderId);
            return { orderId, ...response };
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

//=====================================================================================

export const fetchDashboardStats = createAsyncThunk(
    'orders/fetchDashboardStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderService.getDashboardStats();
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch dashboard stats');
        }
    }
);

export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAllOrders',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await orderService.getAllOrders(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch orders');
        }
    }
);

export const fetchRecentOrders = createAsyncThunk(
    'orders/fetchRecentOrders',
    async (limit = 10, { rejectWithValue }) => {
        try {
            const response = await orderService.getRecentOrders(limit);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch recent orders');
        }
    });

export const fetchOrderAnalytics = createAsyncThunk(
    'orders/fetchOrderAnalytics',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await orderService.getOrderAnalytics(filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch analytics');
        }
    }
);

export const fetchTopVendors = createAsyncThunk(
    'orders/fetchTopVendors',
    async (limit = 5, { rejectWithValue }) => {
        try {
            const response = await orderService.getTopVendors(limit);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch top vendors');
        }
    }
);

export const exportOrders = createAsyncThunk(
    'orders/exportOrders',
    async ({ type = 'all', filters = {} }, { rejectWithValue }) => {
        try {
            const response = await orderService.exportOrders(type, filters);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    dashboardStats: {
        data: null,
        loading: false,
        error: null
    },
    topVendors: {
        data: [],
        loading: false,
        error: null
    },
    vendorStats: {
        data: null,
        loading: false,
        error: null
    },
    vendorSellOrders: {
        data: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error: null
    },
    vendorPurchaseOrders: {
        data: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error: null
    },
    stats: {
        data: null,
        loading: false,
        error: null
    },
    statusUpdate: {
        loading: false,
        error: null,
        success: false
    },
    orders: {
        data: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error: null
    },
    recentOrders: {
        data: [],
        loading: false,
        error: null
    },
    analytics: {
        data: null,
        loading: false,
        error: null
    },
    allOrders: {
        data: [],
        total: 0,
        page: 1,
        pages: 1,
        loading: false,
        error: null
    },
    exportLoading: false
};

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrderData: (state) => {
            state.vendorSellOrders = { data: [], total: 0 }
            state.vendorPurchaseOrders = { data: [], total: 0 }
            state.vendorStats = {
                data: null,
                loading: false,
                error: null
            }
        },
        setAllOrdersPage: (state, action) => {
            state.allOrders.page = action.payload;
        },
        setVendorSellOrdersPage: (state, action) => {
            state.vendorSellOrders.page = action.payload;
        },
        setVendorPurchaseOrdersPage: (state, action) => {
            state.vendorPurchaseOrders.page = action.payload;
        },
        resetStatusUpdate: (state) => {
            state.statusUpdate = initialState.statusUpdate;
        },
        setOrdersPage: (state, action) => {
            state.orders.page = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Fetch vendor sell orders
        builder
            .addCase(fetchVendorSellOrders.pending, (state) => {
                state.vendorSellOrders.loading = true;
                state.vendorSellOrders.error = null;
            })
            .addCase(fetchVendorSellOrders.fulfilled, (state, action) => {
                state.vendorSellOrders.loading = false;
                state.vendorSellOrders.data = action.payload.data || [];
                state.vendorSellOrders.total = action.payload.total || 0;
                state.vendorSellOrders.page = action.payload.page || 1;
                state.vendorSellOrders.pages = action.payload.pages || 1;
            })
            .addCase(fetchVendorSellOrders.rejected, (state, action) => {
                state.vendorSellOrders.loading = false;
                state.vendorSellOrders.error = action.payload;
            });

        // Fetch vendor purchase orders
        builder
            .addCase(fetchVendorPurchaseOrders.pending, (state) => {
                state.vendorPurchaseOrders.loading = true;
                state.vendorPurchaseOrders.error = null;
            })
            .addCase(fetchVendorPurchaseOrders.fulfilled, (state, action) => {
                state.vendorPurchaseOrders.loading = false;
                state.vendorPurchaseOrders.data = action.payload.data || [];
                state.vendorPurchaseOrders.total = action.payload.total || 0;
                state.vendorPurchaseOrders.page = action.payload.page || 1;
                state.vendorPurchaseOrders.pages = action.payload.pages || 1;
            })
            .addCase(fetchVendorPurchaseOrders.rejected, (state, action) => {
                state.vendorPurchaseOrders.loading = false;
                state.vendorPurchaseOrders.error = action.payload;
            });

        // Fetch vendor order stats
        builder
            .addCase(fetchVendorOrderStats.pending, (state) => {
                if (!state.vendorStats) {
                    state.vendorStats = { data: null, loading: false, error: null }
                }
                state.vendorStats.loading = true
                state.vendorStats.error = null
            })
            .addCase(fetchVendorOrderStats.fulfilled, (state, action) => {
                state.vendorStats.loading = false;
                state.vendorStats.data = action.payload.data || null;
            })
            .addCase(fetchVendorOrderStats.rejected, (state, action) => {
                state.vendorStats.loading = false;
                state.vendorStats.error = action.payload;
            });

        // Update order status
        builder
            .addCase(updateOrderStatus.pending, (state) => {
                state.statusUpdate.loading = true;
                state.statusUpdate.error = null;
                state.statusUpdate.success = false;
            })
            .addCase(updateOrderStatus.fulfilled, (state) => {
                state.statusUpdate.loading = false;
                state.statusUpdate.success = true;
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.statusUpdate.loading = false;
                state.statusUpdate.error = action.payload || 'Failed to update status';
                state.statusUpdate.success = false;
            });

        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.dashboardStats.loading = true;
                state.dashboardStats.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.dashboardStats.loading = false;
                state.dashboardStats.data = action.payload.data || null;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.dashboardStats.loading = false;
                state.dashboardStats.error = action.payload;
            });

        // Fetch all orders
        builder
            .addCase(fetchAllOrders.pending, (state) => {
                state.allOrders.loading = true;
                state.allOrders.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.allOrders.loading = false;
                state.allOrders.data = action.payload.data || [];
                state.allOrders.total = action.payload.total || 0;
                state.allOrders.page = action.payload.page || 1;
                state.allOrders.pages = action.payload.pages || 1;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.allOrders.loading = false;
                state.allOrders.error = action.payload;
            });

        builder
            .addCase(fetchRecentOrders.pending, (state) => {
                state.recentOrders.loading = true;
                state.recentOrders.error = null;
            })
            .addCase(fetchRecentOrders.fulfilled, (state, action) => {
                state.recentOrders.loading = false;
                state.recentOrders.data = action.payload.data || [];
            })
            .addCase(fetchRecentOrders.rejected, (state, action) => {
                state.recentOrders.loading = false;
                state.recentOrders.error = action.payload;
            });

        // Fetch order analytics
        builder
            .addCase(fetchOrderAnalytics.pending, (state) => {
                state.analytics.loading = true;
                state.analytics.error = null;
            })
            .addCase(fetchOrderAnalytics.fulfilled, (state, action) => {
                state.analytics.loading = false;
                state.analytics.data = action.payload.data || null;
            })
            .addCase(fetchOrderAnalytics.rejected, (state, action) => {
                state.analytics.loading = false;
                state.analytics.error = action.payload;
            });

        // Fetch top vendors
        builder
            .addCase(fetchTopVendors.pending, (state) => {
                state.topVendors.loading = true;
                state.topVendors.error = null;
            })
            .addCase(fetchTopVendors.fulfilled, (state, action) => {
                state.topVendors.loading = false;
                state.topVendors.data = action.payload.data || [];
            })
            .addCase(fetchTopVendors.rejected, (state, action) => {
                state.topVendors.loading = false;
                state.topVendors.error = action.payload || 'Failed to fetch top vendors';
            });

        // Export orders
        builder
            .addCase(exportOrders.pending, (state) => {
                state.exportLoading = true;
            })
            .addCase(exportOrders.fulfilled, (state) => {
                state.exportLoading = false;
            })
            .addCase(exportOrders.rejected, (state) => {
                state.exportLoading = false;
            });
    }

});

export const {
    clearOrderData,
    resetStatusUpdate,
    setVendorSellOrdersPage,
    setVendorPurchaseOrdersPage,
    setOrdersPage,
    setAllOrdersPage,
} = orderSlice.actions;

export default orderSlice.reducer;