import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

// 1. Fetch Users with pagination, search, status, and role filters
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page = 1, limit = 20, search = '', status = 'all', role = 'all' } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status.toLowerCase());
      else params.append('status', 'all');
      if (role && role !== 'all') params.append('role', role.toLowerCase());
      else params.append('role', 'all');

      const response = await axiosClient.get(`/auth/admin/users?${params.toString()}`);
      return response.data?.data || { users: [], pagination: {} };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch users from server'
      );
    }
  }
);

// 2. Toggle User Block / Unblock Status
export const toggleUserBlock = createAsyncThunk(
  'users/toggleUserBlock',
  async ({ userId, isActive }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.patch(`/auth/admin/users/${userId}/toggle-block`, {
        isActive
      });
      return {
        userId,
        isActive,
        updatedUser: response.data?.data?.user,
        message: response.data?.message || 'User status updated successfully'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update user status'
      );
    }
  }
);

// 3. Delete User
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.delete(`/auth/admin/users/${userId}`);
      return {
        userId,
        message: response.data?.message || 'User deleted successfully'
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete user'
      );
    }
  }
);

// 4. Fetch 360° User Details by ID
export const fetchUserDetails = createAsyncThunk(
  'users/fetchUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get(`/auth/admin/users/${userId}/details`);
      return response.data?.data || null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch user 360° details'
      );
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    pagination: {
      totalUsers: 0,
      totalPages: 1,
      currentPage: 1,
      limit: 20,
      activeUsersCount: 0,
      blockedUsersCount: 0
    },
    loading: false,
    error: null,
    searchQuery: '',
    statusFilter: 'all',
    roleFilter: 'all',
    currentPage: 1,
    // 360° User Detail state
    selectedUserDetails: null,
    detailLoading: false,
    detailError: null
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setRoleFilter: (state, action) => {
      state.roleFilter = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearUserDetails: (state) => {
      state.selectedUserDetails = null;
      state.detailError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.users || [];
        state.pagination = action.payload.pagination || {
          totalUsers: (action.payload.users || []).length,
          totalPages: 1,
          currentPage: 1,
          limit: 20,
          activeUsersCount: (action.payload.users || []).filter((u) => u.isActive).length,
          blockedUsersCount: (action.payload.users || []).filter((u) => !u.isActive).length
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle User Block
      .addCase(toggleUserBlock.fulfilled, (state, action) => {
        const { userId, isActive, updatedUser } = action.payload;
        const index = state.items.findIndex((u) => (u._id || u.id) === userId);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            isActive,
            ...(updatedUser || {})
          };
        }
        if (
          state.selectedUserDetails &&
          (state.selectedUserDetails.user?._id || state.selectedUserDetails.user?.id) === userId
        ) {
          state.selectedUserDetails.user = {
            ...state.selectedUserDetails.user,
            isActive,
            ...(updatedUser || {})
          };
        }
      })

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.items = state.items.filter((u) => (u._id || u.id) !== userId);
        if (state.pagination.totalUsers > 0) {
          state.pagination.totalUsers -= 1;
        }
      })

      // Fetch User 360 Details
      .addCase(fetchUserDetails.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedUserDetails = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  }
});

export const {
  setSearchQuery,
  setStatusFilter,
  setRoleFilter,
  setCurrentPage,
  clearUserDetails
} = usersSlice.actions;

export default usersSlice.reducer;
