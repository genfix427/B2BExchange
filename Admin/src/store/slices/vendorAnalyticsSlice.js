import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { vendorAnalyticsService } from '../../services/vendorAnalyticsService';

// Async thunks
export const fetchVendorAnalyticsOverview = createAsyncThunk(
  'vendorAnalytics/fetchVendorAnalyticsOverview',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vendorAnalyticsService.getVendorAnalyticsOverview(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVendorPerformanceMetrics = createAsyncThunk(
  'vendorAnalytics/fetchVendorPerformanceMetrics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vendorAnalyticsService.getVendorPerformanceMetrics(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVendorGrowthTrends = createAsyncThunk(
  'vendorAnalytics/fetchVendorGrowthTrends',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vendorAnalyticsService.getVendorGrowthTrends(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVendorStatusDistribution = createAsyncThunk(
  'vendorAnalytics/fetchVendorStatusDistribution',
  async (_, { rejectWithValue }) => {
    try {
      const response = await vendorAnalyticsService.getVendorStatusDistribution();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchTopPerformingVendors = createAsyncThunk(
  'vendorAnalytics/fetchTopPerformingVendors',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await vendorAnalyticsService.getTopPerformingVendors(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVendorRegistrationTrends = createAsyncThunk(
  'vendorAnalytics/fetchVendorRegistrationTrends',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await vendorAnalyticsService.getVendorRegistrationTrends(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const exportVendorAnalytics = createAsyncThunk(
  'vendorAnalytics/exportVendorAnalytics',
  async ({ format = 'excel', filters = {} }, { rejectWithValue }) => {
    try {
      const response = await vendorAnalyticsService.exportVendorAnalytics(format, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  overview: {
    data: null,
    loading: false,
    error: null
  },
  performance: {
    data: [],
    loading: false,
    error: null
  },
  growthTrends: {
    data: [],
    loading: false,
    error: null
  },
  statusDistribution: {
    data: [],
    loading: false,
    error: null
  },
  topVendors: {
    data: [],
    loading: false,
    error: null
  },
  registrationTrends: {
    data: [],
    loading: false,
    error: null
  },
  exportLoading: false
};

const vendorAnalyticsSlice = createSlice({
  name: 'vendorAnalytics',
  initialState,
  reducers: {
    clearVendorAnalyticsData: (state) => {
      state.overview = initialState.overview;
      state.performance = initialState.performance;
      state.growthTrends = initialState.growthTrends;
      state.statusDistribution = initialState.statusDistribution;
      state.topVendors = initialState.topVendors;
      state.registrationTrends = initialState.registrationTrends;
    }
  },
  extraReducers: (builder) => {
    // Fetch overview
    builder
      .addCase(fetchVendorAnalyticsOverview.pending, (state) => {
        state.overview.loading = true;
        state.overview.error = null;
      })
      .addCase(fetchVendorAnalyticsOverview.fulfilled, (state, action) => {
        state.overview.loading = false;
        state.overview.data = action.payload.data || null;
      })
      .addCase(fetchVendorAnalyticsOverview.rejected, (state, action) => {
        state.overview.loading = false;
        state.overview.error = action.payload || 'Failed to fetch vendor analytics';
      });

    // Fetch performance metrics
    builder
      .addCase(fetchVendorPerformanceMetrics.pending, (state) => {
        state.performance.loading = true;
        state.performance.error = null;
      })
      .addCase(fetchVendorPerformanceMetrics.fulfilled, (state, action) => {
        state.performance.loading = false;
        state.performance.data = action.payload.data || [];
      })
      .addCase(fetchVendorPerformanceMetrics.rejected, (state, action) => {
        state.performance.loading = false;
        state.performance.error = action.payload || 'Failed to fetch performance metrics';
      });

    // Fetch growth trends
    builder
      .addCase(fetchVendorGrowthTrends.pending, (state) => {
        state.growthTrends.loading = true;
        state.growthTrends.error = null;
      })
      .addCase(fetchVendorGrowthTrends.fulfilled, (state, action) => {
        state.growthTrends.loading = false;
        state.growthTrends.data = action.payload.data || [];
      })
      .addCase(fetchVendorGrowthTrends.rejected, (state, action) => {
        state.growthTrends.loading = false;
        state.growthTrends.error = action.payload || 'Failed to fetch growth trends';
      });

    // Fetch status distribution
    builder
      .addCase(fetchVendorStatusDistribution.pending, (state) => {
        state.statusDistribution.loading = true;
        state.statusDistribution.error = null;
      })
      .addCase(fetchVendorStatusDistribution.fulfilled, (state, action) => {
        state.statusDistribution.loading = false;
        state.statusDistribution.data = action.payload.data || [];
      })
      .addCase(fetchVendorStatusDistribution.rejected, (state, action) => {
        state.statusDistribution.loading = false;
        state.statusDistribution.error = action.payload || 'Failed to fetch status distribution';
      });

    // Fetch top performing vendors
    builder
      .addCase(fetchTopPerformingVendors.pending, (state) => {
        state.topVendors.loading = true;
        state.topVendors.error = null;
      })
      .addCase(fetchTopPerformingVendors.fulfilled, (state, action) => {
        state.topVendors.loading = false;
        state.topVendors.data = action.payload.data || [];
      })
      .addCase(fetchTopPerformingVendors.rejected, (state, action) => {
        state.topVendors.loading = false;
        state.topVendors.error = action.payload || 'Failed to fetch top vendors';
      });

    // Fetch registration trends
    builder
      .addCase(fetchVendorRegistrationTrends.pending, (state) => {
        state.registrationTrends.loading = true;
        state.registrationTrends.error = null;
      })
      .addCase(fetchVendorRegistrationTrends.fulfilled, (state, action) => {
        state.registrationTrends.loading = false;
        state.registrationTrends.data = action.payload.data || [];
      })
      .addCase(fetchVendorRegistrationTrends.rejected, (state, action) => {
        state.registrationTrends.loading = false;
        state.registrationTrends.error = action.payload || 'Failed to fetch registration trends';
      });

    // Export vendor analytics
    builder
      .addCase(exportVendorAnalytics.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(exportVendorAnalytics.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportVendorAnalytics.rejected, (state) => {
        state.exportLoading = false;
      });
  }
});

export const { clearVendorAnalyticsData } = vendorAnalyticsSlice.actions;
export default vendorAnalyticsSlice.reducer;