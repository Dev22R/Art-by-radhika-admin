import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// Helper to match ID
const matchId = (item, id) => (item._id || item.id) === id;

// 1. Fetch All Reels for Admin (with pagination, summary)
export const fetchReels = createAsyncThunk(
  'reels/fetchReels',
  async ({ page = 1, limit = 20, search = '' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);

      const response = await axiosClient.get(`/reels/admin/all?${params.toString()}`);
      return response.data?.data || { reels: [], summary: {}, pagination: {} };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch reels from server'
      );
    }
  }
);

// 2. Fetch Single Reel Details (GET /reels/admin/:reelId/details)
export const fetchReelDetails = createAsyncThunk(
  'reels/fetchReelDetails',
  async (reelId, { rejectWithValue, getState }) => {
    try {
      const response = await axiosClient.get(`/reels/admin/${reelId}/details`);
      return response.data?.data || response.data;
    } catch (error) {
      const state = getState();
      const existing = state.reels?.items?.find((r) => matchId(r, reelId));
      if (existing) {
        return {
          reel: existing,
          analytics: {
            totalViews: existing.viewCount ?? existing.views?.length ?? 0,
            uniqueViews: existing.uniqueViewCount ?? 0,
            totalLikes: existing.likeCount ?? existing.likes?.length ?? 0,
            totalComments: existing.commentCount ?? existing.comments?.length ?? 0,
            totalShares: existing.shareCount ?? existing.shares?.length ?? 0,
            totalBookings: existing.bookingCount ?? 0
          },
          engagementDetails: {
            likedByUsers: existing.likedByUsers || [],
            comments: existing.comments || [],
            viewers: {
              registeredCount: existing.viewers?.registeredCount ?? 0,
              anonymousCount: existing.viewers?.anonymousCount ?? 0,
              registeredViewers: existing.viewers?.registeredViewers || [],
              anonymousViewers: existing.viewers?.anonymousViewers || []
            },
            shares: existing.shares || [],
            bookings: existing.bookings || []
          }
        };
      }
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch reel details'
      );
    }
  }
);

// 3. Create / Upload Reel (Multipart FormData)
export const createReel = createAsyncThunk(
  'reels/createReel',
  async (formData, { rejectWithValue }) => {
    try {
      const isFormData = formData instanceof FormData;
      const response = await axiosClient.post('/reels', formData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
      });
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to upload reel'
      );
    }
  }
);

// 4. Update Reel Details (JSON)
export const updateReel = createAsyncThunk(
  'reels/updateReel',
  async ({ reelId, data }, { rejectWithValue }) => {
    try {
      let response;
      try {
        response = await axiosClient.put(`/reels/${reelId}`, data);
      } catch (err) {
        if (err.response?.status === 404) {
          response = await axiosClient.put('/reels', { reelId, ...data });
        } else {
          throw err;
        }
      }
      return {
        reelId,
        reel: response.data?.data?.reel || response.data?.data || response.data,
        message: response.data?.message || 'Reel updated successfully'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update reel'
      );
    }
  }
);

// 5. Toggle Publish / Unpublish Status
export const togglePublishReel = createAsyncThunk(
  'reels/togglePublishReel',
  async (reelId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/reels/${reelId}/publish`);
      return {
        reelId,
        reel: response.data?.data?.reel || response.data?.data,
        isPublished:
          response.data?.data?.reel?.isPublished ??
          response.data?.data?.isPublished,
        status:
          response.data?.data?.reel?.status ??
          response.data?.data?.status,
        message: response.data?.message || 'Publish status updated'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to toggle publish status'
      );
    }
  }
);

// 6. Delete Reel
export const deleteReel = createAsyncThunk(
  'reels/deleteReel',
  async (reelId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(`/reels/${reelId}`);
      return {
        reelId,
        message: response.data?.message || 'Reel deleted successfully'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete reel'
      );
    }
  }
);

// 7. Delete Comment of Reel (Admin)
export const deleteReelComment = createAsyncThunk(
  'reels/deleteReelComment',
  async ({ reelId, commentId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(
        `/reels/${reelId}/comments/${commentId}/admin`
      );
      return {
        reelId,
        commentId,
        message: response.data?.message || 'Comment deleted successfully'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete comment'
      );
    }
  }
);

const reelsSlice = createSlice({
  name: 'reels',
  initialState: {
    items: [],
    summary: {
      totalReels: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalBookings: 0
    },
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 1
    },
    loading: false,
    mutationLoading: false,
    error: null,
    // Single Reel Details Response (reel, analytics, engagementDetails)
    selectedReelDetails: null,
    selectedReel: null,
    detailLoading: false,
    detailError: null,
    // Active modal helper
    activeReelModal: null,
    searchQuery: '',
    statusFilter: 'all',
    categoryFilter: 'all',
    currentPage: 1
  },
  reducers: {
    setActiveReelModal: (state, action) => {
      state.activeReelModal = action.payload;
    },
    setReelSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setReelStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setReelCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
      state.currentPage = 1;
    },
    setReelCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearReelError: (state) => {
      state.error = null;
    },
    clearReelDetails: (state) => {
      state.selectedReelDetails = null;
      state.selectedReel = null;
      state.detailError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reels
      .addCase(fetchReels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.reels || [];
        if (action.payload.summary) {
          state.summary = {
            totalReels: action.payload.summary.totalReels ?? state.items.length,
            totalViews: action.payload.summary.totalViews ?? 0,
            totalLikes: action.payload.summary.totalLikes ?? 0,
            totalComments: action.payload.summary.totalComments ?? 0,
            totalShares: action.payload.summary.totalShares ?? 0,
            totalBookings: action.payload.summary.totalBookings ?? 0
          };
        }
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchReels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Reel Details (GET /reels/admin/:reelId/details)
      .addCase(fetchReelDetails.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchReelDetails.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedReelDetails = action.payload; // { reel, analytics, engagementDetails }
        state.selectedReel = action.payload?.reel || action.payload;
      })
      .addCase(fetchReelDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      })

      // Create Reel
      .addCase(createReel.pending, (state) => {
        state.mutationLoading = true;
      })
      .addCase(createReel.fulfilled, (state, action) => {
        state.mutationLoading = false;
        const newReel = action.payload?.reel || action.payload;
        if (newReel) {
          state.items.unshift(newReel);
          state.summary.totalReels = (state.summary.totalReels || 0) + 1;
        }
      })
      .addCase(createReel.rejected, (state) => {
        state.mutationLoading = false;
      })

      // Update Reel
      .addCase(updateReel.pending, (state) => {
        state.mutationLoading = true;
      })
      .addCase(updateReel.fulfilled, (state, action) => {
        state.mutationLoading = false;
        const { reelId, reel } = action.payload;
        const idx = state.items.findIndex((r) => matchId(r, reelId));
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...(reel || {}) };
          if (state.activeReelModal && matchId(state.activeReelModal, reelId)) {
            state.activeReelModal = { ...state.activeReelModal, ...(reel || {}) };
          }
        }
        if (state.selectedReel && matchId(state.selectedReel, reelId)) {
          state.selectedReel = { ...state.selectedReel, ...(reel || {}) };
        }
        if (state.selectedReelDetails?.reel && matchId(state.selectedReelDetails.reel, reelId)) {
          state.selectedReelDetails.reel = {
            ...state.selectedReelDetails.reel,
            ...(reel || {})
          };
        }
      })
      .addCase(updateReel.rejected, (state) => {
        state.mutationLoading = false;
      })

      // Toggle Publish Reel
      .addCase(togglePublishReel.fulfilled, (state, action) => {
        const { reelId, isPublished, status, reel } = action.payload;
        const idx = state.items.findIndex((r) => matchId(r, reelId));
        if (idx !== -1) {
          const current = state.items[idx];
          const newIsPublished =
            isPublished !== undefined ? isPublished : !current.isPublished;
          const newStatus =
            status || (newIsPublished ? 'published' : 'draft');
          state.items[idx] = {
            ...current,
            isPublished: newIsPublished,
            status: newStatus,
            ...(reel || {})
          };
          if (state.activeReelModal && matchId(state.activeReelModal, reelId)) {
            state.activeReelModal = {
              ...state.activeReelModal,
              isPublished: newIsPublished,
              status: newStatus,
              ...(reel || {})
            };
          }
        }
        if (state.selectedReel && matchId(state.selectedReel, reelId)) {
          const newIsPublished =
            isPublished !== undefined ? isPublished : !state.selectedReel.isPublished;
          const newStatus =
            status || (newIsPublished ? 'published' : 'draft');
          state.selectedReel = {
            ...state.selectedReel,
            isPublished: newIsPublished,
            status: newStatus,
            ...(reel || {})
          };
        }
        if (state.selectedReelDetails?.reel && matchId(state.selectedReelDetails.reel, reelId)) {
          const newIsPublished =
            isPublished !== undefined
              ? isPublished
              : !state.selectedReelDetails.reel.isPublished;
          const newStatus =
            status || (newIsPublished ? 'published' : 'draft');
          state.selectedReelDetails.reel = {
            ...state.selectedReelDetails.reel,
            isPublished: newIsPublished,
            status: newStatus,
            ...(reel || {})
          };
        }
      })

      // Delete Reel
      .addCase(deleteReel.fulfilled, (state, action) => {
        const { reelId } = action.payload;
        state.items = state.items.filter((r) => !matchId(r, reelId));
        if (state.summary.totalReels > 0) {
          state.summary.totalReels -= 1;
        }
        if (state.activeReelModal && matchId(state.activeReelModal, reelId)) {
          state.activeReelModal = null;
        }
        if (state.selectedReel && matchId(state.selectedReel, reelId)) {
          state.selectedReel = null;
        }
        if (state.selectedReelDetails?.reel && matchId(state.selectedReelDetails.reel, reelId)) {
          state.selectedReelDetails = null;
        }
      })

      // Delete Comment
      .addCase(deleteReelComment.fulfilled, (state, action) => {
        const { reelId, commentId } = action.payload;
        const reelIdx = state.items.findIndex((r) => matchId(r, reelId));
        if (reelIdx !== -1) {
          const reel = state.items[reelIdx];
          if (reel.comments) {
            reel.comments = reel.comments.filter((c) => !matchId(c, commentId));
            reel.commentCount = Math.max(0, (reel.commentCount || 1) - 1);
          }
        }
        if (state.activeReelModal && matchId(state.activeReelModal, reelId)) {
          if (state.activeReelModal.comments) {
            state.activeReelModal.comments = state.activeReelModal.comments.filter(
              (c) => !matchId(c, commentId)
            );
            state.activeReelModal.commentCount = Math.max(
              0,
              (state.activeReelModal.commentCount || 1) - 1
            );
          }
        }
        if (state.selectedReel && matchId(state.selectedReel, reelId)) {
          if (state.selectedReel.comments) {
            state.selectedReel.comments = state.selectedReel.comments.filter(
              (c) => !matchId(c, commentId)
            );
            state.selectedReel.commentCount = Math.max(
              0,
              (state.selectedReel.commentCount || 1) - 1
            );
          }
        }
        if (state.selectedReelDetails?.engagementDetails?.comments) {
          state.selectedReelDetails.engagementDetails.comments =
            state.selectedReelDetails.engagementDetails.comments.filter(
              (c) => !matchId(c, commentId)
            );
        }
        if (state.selectedReelDetails?.analytics) {
          state.selectedReelDetails.analytics.totalComments = Math.max(
            0,
            (state.selectedReelDetails.analytics.totalComments || 1) - 1
          );
        }
        if (state.summary.totalComments > 0) {
          state.summary.totalComments -= 1;
        }
      });
  }
});

export const {
  setActiveReelModal,
  setReelSearchQuery,
  setReelStatusFilter,
  setReelCategoryFilter,
  setReelCurrentPage,
  clearReelError,
  clearReelDetails
} = reelsSlice.actions;

export default reelsSlice.reducer;
