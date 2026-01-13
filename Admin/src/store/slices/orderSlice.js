import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';

// Async thunks
export const fetchVendorSellOrders = createAsyncThunk(
  'orders/fetchVendorSellOrders',
  async ({ vendorId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await orderService.getVendorSellOrders(vendorId, params);
      console.log('Fetched Vendor Sell Orders:', response);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVendorPurchaseOrders = createAsyncThunk(
  'orders/fetchVendorPurchaseOrders',
  async ({ vendorId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await orderService.getVendorPurchaseOrders(vendorId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVendorOrderStats = createAsyncThunk(
  'orders/fetchVendorOrderStats',
  async ({ vendorId, period = 'month' }, { rejectWithValue }) => {
    try {
      const response = await orderService.getVendorOrderStats(vendorId, period);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchOrderAnalytics = createAsyncThunk(
  'orders/fetchOrderAnalytics',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await orderService.getOrderAnalytics(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
      return rejectWithValue(error.response?.data || error.message);
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
  sellOrders: {
    data: [],
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    error: null
  },
  purchaseOrders: {
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
  analytics: {
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
  topVendors: {
    data: [],
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
      state.sellOrders = initialState.sellOrders;
      state.purchaseOrders = initialState.purchaseOrders;
      state.stats = initialState.stats;
      state.analytics = initialState.analytics;
    },
    resetStatusUpdate: (state) => {
      state.statusUpdate = initialState.statusUpdate;
    },
    setSellOrdersPage: (state, action) => {
      state.sellOrders.page = action.payload;
    },
    setPurchaseOrdersPage: (state, action) => {
      state.purchaseOrders.page = action.payload;
    },
    setOrdersPage: (state, action) => {
      state.orders.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch vendor sell orders
    builder
      .addCase(fetchVendorSellOrders.pending, (state) => {
        state.sellOrders.loading = true;
        state.sellOrders.error = null;
      })
      .addCase(fetchVendorSellOrders.fulfilled, (state, action) => {
        state.sellOrders.loading = false;
        state.sellOrders.data = action.payload.data || [];
        state.sellOrders.total = action.payload.total || 0;
        state.sellOrders.page = action.payload.page || 1;
        state.sellOrders.pages = action.payload.pages || 1;
      })
      .addCase(fetchVendorSellOrders.rejected, (state, action) => {
        state.sellOrders.loading = false;
        state.sellOrders.error = action.payload || 'Failed to fetch sell orders';
      });

    // Fetch vendor purchase orders
    builder
      .addCase(fetchVendorPurchaseOrders.pending, (state) => {
        state.purchaseOrders.loading = true;
        state.purchaseOrders.error = null;
      })
      .addCase(fetchVendorPurchaseOrders.fulfilled, (state, action) => {
        state.purchaseOrders.loading = false;
        state.purchaseOrders.data = action.payload.data || [];
        state.purchaseOrders.total = action.payload.total || 0;
        state.purchaseOrders.page = action.payload.page || 1;
        state.purchaseOrders.pages = action.payload.pages || 1;
      })
      .addCase(fetchVendorPurchaseOrders.rejected, (state, action) => {
        state.purchaseOrders.loading = false;
        state.purchaseOrders.error = action.payload || 'Failed to fetch purchase orders';
      });

    // Fetch vendor order stats
    builder
      .addCase(fetchVendorOrderStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchVendorOrderStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload.data || null;
      })
      .addCase(fetchVendorOrderStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload || 'Failed to fetch stats';
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
        state.dashboardStats.error = action.payload || 'Failed to fetch dashboard stats';
      });

    // Fetch all orders
    builder
      .addCase(fetchAllOrders.pending, (state) => {
        state.orders.loading = true;
        state.orders.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.orders.loading = false;
        state.orders.data = action.payload.data || [];
        state.orders.total = action.payload.total || 0;
        state.orders.page = action.payload.page || 1;
        state.orders.pages = action.payload.pages || 1;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.orders.loading = false;
        state.orders.error = action.payload || 'Failed to fetch orders';
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
        state.analytics.error = action.payload || 'Failed to fetch analytics';
      });

    // Fetch recent orders
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
        state.recentOrders.error = action.payload || 'Failed to fetch recent orders';
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
  setSellOrdersPage,
  setPurchaseOrdersPage,
  setOrdersPage 
} = orderSlice.actions;

export default orderSlice.reducer;