import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Fetch Complete Dashboard Overview
export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (range = '12months', { rejectWithValue }) => {
    try {
      // 1. Try complete overview endpoint first
      try {
        const response = await axiosClient.get(`/dashboard/overview?range=${range}`);
        if (response.data?.success && response.data?.data) {
          return {
            stats: response.data.data.stats,
            charts: response.data.data.charts
          };
        }
      } catch (overviewErr) {
        console.warn('Overview endpoint failed, attempting separate stats & charts endpoints:', overviewErr);
      }

      // 2. Fallback to separate stats and charts endpoints
      const [statsRes, chartsRes] = await Promise.all([
        axiosClient.get('/dashboard/stats'),
        axiosClient.get(`/dashboard/charts?range=${range}`)
      ]);

      return {
        stats: statsRes.data?.data || null,
        charts: chartsRes.data?.data || null
      };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch dashboard statistics from server.';
      return rejectWithValue(errorMsg);
    }
  }
);

const initialState = {
  stats: null,
  charts: null,
  range: '12months',
  loading: false,
  error: null,
  lastUpdated: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.range = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.charts = action.payload.charts;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setTimeRange } = dashboardSlice.actions;
export default dashboardSlice.reducer;
