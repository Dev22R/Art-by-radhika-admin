import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient, { STORAGE_KEYS } from '../../api/axiosClient';

// Get initial auth state from localStorage
const getInitialAuth = () => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (userStr && token) {
      return {
        user: JSON.parse(userStr),
        token,
        refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || null,
        isAuthenticated: true
      };
    }
  } catch (e) {
    console.error('Error reading auth state from storage:', e);
  }
  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false
  };
};

// Real Admin Login Async Thunk
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/auth/admin/login', {
        email: email.trim(),
        password
      });

      const responseData = response.data;

      if (responseData && (responseData.success || responseData.data)) {
        const { user, accessToken, refreshToken, role } = responseData.data;

        // Ensure user has avatar fallback if null
        const enrichedUser = {
          ...user,
          role: role || user?.role || 'admin',
          avatar: user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };

        // Persist tokens and user in LocalStorage
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(enrichedUser));
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
        if (refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        return {
          user: enrichedUser,
          token: accessToken,
          refreshToken,
          message: responseData.message || 'Admin login successful.'
        };
      }

      return rejectWithValue(responseData?.message || 'Login failed.');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Unable to connect to backend auth server. Make sure API server is running on http://localhost:5000.';
      return rejectWithValue(errorMessage);
    }
  }
);

// Real Admin Logout Async Thunk
export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      // Calls POST http://localhost:5000/api/auth/logout with Bearer token
      await axiosClient.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout warning:', err?.response?.data || err?.message);
    } finally {
      // Clear all local auth storage
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    }
    return true;
  }
);

// Real Admin Change / Forgot Password Async Thunk
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ newPassword }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.put('/auth/admin/change-password', {
        newPassword
      });

      const data = response.data;
      if (data && data.success) {
        return data.message || 'Password changed successfully.';
      }
      return rejectWithValue(data?.message || 'Password change failed.');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to update password. Please verify authorization token.';
      return rejectWithValue(errorMessage);
    }
  }
);

const initialAuthState = getInitialAuth();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: initialAuthState.user,
    token: initialAuthState.token,
    refreshToken: initialAuthState.refreshToken,
    isAuthenticated: initialAuthState.isAuthenticated,
    loading: false,
    logoutLoading: false,
    error: null,
    changePasswordLoading: false,
    changePasswordSuccess: false
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(state.user));
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    resetChangePasswordStatus: (state) => {
      state.changePasswordLoading = false;
      state.changePasswordSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login Admin
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Invalid login credentials.';
      })
      // Logout Admin
      .addCase(logoutAdmin.pending, (state) => {
        state.logoutLoading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAdmin.rejected, (state) => {
        state.logoutLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.changePasswordLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changePasswordLoading = false;
        state.changePasswordSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changePasswordLoading = false;
        state.changePasswordSuccess = false;
      });
  }
});

export const {
  logout,
  updateProfile,
  clearAuthError,
  resetChangePasswordStatus
} = authSlice.actions;

export default authSlice.reducer;
