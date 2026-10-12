import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// 1. Fetch All Designs for Admin (with pagination, search, category, complexity)
export const fetchDesigns = createAsyncThunk(
  'designs/fetchDesigns',
  async (
    { page = 1, limit = 20, search = '', category = 'all', complexity = 'all' } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category.toLowerCase());
      if (complexity && complexity !== 'all') params.append('complexity', complexity.toLowerCase());

      const response = await axiosClient.get(`/designs/admin/all?${params.toString()}`);
      return response.data?.data || { designs: [], summary: {}, pagination: {} };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch designs'
      );
    }
  }
);

// 2. Fetch Single Design Details (360° view)
export const fetchDesignDetails = createAsyncThunk(
  'designs/fetchDesignDetails',
  async (designId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/designs/admin/${designId}/details`);
      return response.data?.data || null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch design details'
      );
    }
  }
);

// 3. Create Design (Multipart FormData)
export const createDesign = createAsyncThunk(
  'designs/createDesign',
  async (formData, { rejectWithValue }) => {
    try {
      const isFormData = formData instanceof FormData;
      const response = await axiosClient.post('/designs', formData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create design'
      );
    }
  }
);

// 4. Update Design (Multipart FormData or JSON)
export const updateDesign = createAsyncThunk(
  'designs/updateDesign',
  async ({ designId, data }, { rejectWithValue }) => {
    try {
      const isFormData = data instanceof FormData;
      const response = await axiosClient.put(`/designs/${designId}`, data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      return {
        designId,
        design: response.data?.data?.design || response.data?.data || response.data,
        message: response.data?.message || 'Design updated successfully'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update design'
      );
    }
  }
);

// 5. Toggle Publish / Unpublish Status
export const togglePublishDesign = createAsyncThunk(
  'designs/togglePublish',
  async (designId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/designs/${designId}/publish`);
      return {
        designId,
        design: response.data?.data?.design || response.data?.data,
        isPublished: response.data?.data?.design?.isPublished ?? response.data?.data?.isPublished,
        message: response.data?.message || 'Publish status updated'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to toggle publish status'
      );
    }
  }
);

// 6. Toggle Reel Feed (`showInReelFeed`)
export const toggleReelFeed = createAsyncThunk(
  'designs/toggleReelFeed',
  async (designId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/designs/${designId}/reel-feed`);
      return {
        designId,
        design: response.data?.data?.design || response.data?.data,
        showInReelFeed:
          response.data?.data?.design?.showInReelFeed ?? response.data?.data?.showInReelFeed,
        message: response.data?.message || 'Reel feed visibility updated'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to toggle reel feed'
      );
    }
  }
);

// 7. Delete Design
export const deleteDesign = createAsyncThunk(
  'designs/deleteDesign',
  async (designId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(`/designs/${designId}`);
      return {
        designId,
        message: response.data?.message || 'Design deleted successfully'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete design'
      );
    }
  }
);

const designsSlice = createSlice({
  name: 'designs',
  initialState: {
    items: [],
    summary: {
      totalDesigns: 0,
      totalViews: 0,
      totalLikes: 0,
      totalBookings: 0
    },
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 1
    },
    loading: false,
    error: null,
    searchQuery: '',
    categoryFilter: 'all',
    complexityFilter: 'all',
    currentPage: 1,
    // Details
    selectedDesignDetails: null,
    detailLoading: false,
    detailError: null,
    // Mutations
    mutationLoading: false
  },
  reducers: {
    setDesignSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
      state.currentPage = 1;
    },
    setComplexityFilter: (state, action) => {
      state.complexityFilter = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearDesignDetails: (state) => {
      state.selectedDesignDetails = null;
      state.detailError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Designs
      .addCase(fetchDesigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesigns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.designs || [];
        state.summary = action.payload.summary || {
          totalDesigns: (action.payload.designs || []).length,
          totalViews: 0,
          totalLikes: 0,
          totalBookings: 0
        };
        state.pagination = action.payload.pagination || {
          total: (action.payload.designs || []).length,
          page: 1,
          limit: 20,
          pages: 1
        };
      })
      .addCase(fetchDesigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Design Details
      .addCase(fetchDesignDetails.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchDesignDetails.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedDesignDetails = action.payload;
      })
      .addCase(fetchDesignDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // Create Design
      .addCase(createDesign.pending, (state) => {
        state.mutationLoading = true;
      })
      .addCase(createDesign.fulfilled, (state, action) => {
        state.mutationLoading = false;
        if (action.payload?.design) {
          state.items.unshift(action.payload.design);
        }
      })
      .addCase(createDesign.rejected, (state) => {
        state.mutationLoading = false;
      })

      // Update Design
      .addCase(updateDesign.pending, (state) => {
        state.mutationLoading = true;
      })
      .addCase(updateDesign.fulfilled, (state, action) => {
        state.mutationLoading = false;
        const updated = action.payload.design;
        if (updated) {
          const idx = state.items.findIndex(
            (d) => (d._id || d.id) === (updated._id || updated.id || action.payload.designId)
          );
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...updated };
          }
        }
      })
      .addCase(updateDesign.rejected, (state) => {
        state.mutationLoading = false;
      })

      // Toggle Publish
      .addCase(togglePublishDesign.fulfilled, (state, action) => {
        const { designId, isPublished, design } = action.payload;
        const idx = state.items.findIndex((d) => (d._id || d.id) === designId);
        if (idx !== -1) {
          state.items[idx].isPublished =
            isPublished !== undefined ? isPublished : !state.items[idx].isPublished;
          if (design) state.items[idx] = { ...state.items[idx], ...design };
        }
        if (
          state.selectedDesignDetails?.design &&
          (state.selectedDesignDetails.design._id || state.selectedDesignDetails.design.id) ===
            designId
        ) {
          state.selectedDesignDetails.design.isPublished =
            isPublished !== undefined
              ? isPublished
              : !state.selectedDesignDetails.design.isPublished;
        }
      })

      // Toggle Reel Feed
      .addCase(toggleReelFeed.fulfilled, (state, action) => {
        const { designId, showInReelFeed, design } = action.payload;
        const idx = state.items.findIndex((d) => (d._id || d.id) === designId);
        if (idx !== -1) {
          state.items[idx].showInReelFeed =
            showInReelFeed !== undefined ? showInReelFeed : !state.items[idx].showInReelFeed;
          if (design) state.items[idx] = { ...state.items[idx], ...design };
        }
        if (
          state.selectedDesignDetails?.design &&
          (state.selectedDesignDetails.design._id || state.selectedDesignDetails.design.id) ===
            designId
        ) {
          state.selectedDesignDetails.design.showInReelFeed =
            showInReelFeed !== undefined
              ? showInReelFeed
              : !state.selectedDesignDetails.design.showInReelFeed;
        }
      })

      // Delete Design
      .addCase(deleteDesign.fulfilled, (state, action) => {
        const { designId } = action.payload;
        state.items = state.items.filter((d) => (d._id || d.id) !== designId);
        if (state.summary.totalDesigns > 0) state.summary.totalDesigns -= 1;
      });
  }
});

export const {
  setDesignSearchQuery,
  setCategoryFilter,
  setComplexityFilter,
  setCurrentPage,
  clearDesignDetails
} = designsSlice.actions;

export default designsSlice.reducer;
