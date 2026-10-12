import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockApi } from '../../api/axiosClient';

const { STORAGE_KEYS } = mockApi;

export const fetchEnquiries = createAsyncThunk('enquiries/fetchEnquiries', async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockApi.get(STORAGE_KEYS.ENQUIRIES);
});

export const addEnquiry = createAsyncThunk('enquiries/addEnquiry', async (newEnq) => {
  const enquiries = mockApi.get(STORAGE_KEYS.ENQUIRIES);
  const created = {
    ...newEnq,
    id: 'enq_' + Date.now(),
    status: newEnq.status || 'New',
    createdAt: new Date().toISOString()
  };
  const updated = [created, ...enquiries];
  mockApi.save(STORAGE_KEYS.ENQUIRIES, updated);
  return created;
});

export const updateEnquiryStatus = createAsyncThunk(
  'enquiries/updateStatus',
  async ({ id, status, internalNotes }) => {
    const enquiries = mockApi.get(STORAGE_KEYS.ENQUIRIES);
    let changed = null;
    const updated = enquiries.map((e) => {
      if (e.id === id) {
        changed = {
          ...e,
          status,
          ...(internalNotes !== undefined ? { internalNotes } : {})
        };
        return changed;
      }
      return e;
    });
    mockApi.save(STORAGE_KEYS.ENQUIRIES, updated);
    return changed;
  }
);

export const deleteEnquiry = createAsyncThunk('enquiries/deleteEnquiry', async (id) => {
  const enquiries = mockApi.get(STORAGE_KEYS.ENQUIRIES);
  const updated = enquiries.filter((e) => e.id !== id);
  mockApi.save(STORAGE_KEYS.ENQUIRIES, updated);
  return id;
});

const enquiriesSlice = createSlice({
  name: 'enquiries',
  initialState: {
    items: mockApi.get(STORAGE_KEYS.ENQUIRIES) || [],
    loading: false,
    error: null,
    statusFilter: 'All',
    searchQuery: '',
    selectedEnquiry: null
  },
  reducers: {
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedEnquiry: (state, action) => {
      state.selectedEnquiry = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnquiries.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEnquiries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addEnquiry.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateEnquiryStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteEnquiry.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
      });
  }
});

export const { setStatusFilter, setSearchQuery, setSelectedEnquiry } = enquiriesSlice.actions;
export default enquiriesSlice.reducer;
