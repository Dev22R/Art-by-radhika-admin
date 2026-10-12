import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockApi } from '../../api/axiosClient';

const { STORAGE_KEYS } = mockApi;

export const fetchFaqs = createAsyncThunk('faqs/fetchFaqs', async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockApi.get(STORAGE_KEYS.FAQS);
});

export const addFaq = createAsyncThunk('faqs/addFaq', async (newFaq) => {
  const faqs = mockApi.get(STORAGE_KEYS.FAQS);
  const created = {
    ...newFaq,
    id: 'faq_' + Date.now(),
    status: newFaq.status || 'Published',
    order: faqs.length + 1
  };
  const updated = [...faqs, created];
  mockApi.save(STORAGE_KEYS.FAQS, updated);
  return created;
});

export const updateFaq = createAsyncThunk('faqs/updateFaq', async (updatedFaq) => {
  const faqs = mockApi.get(STORAGE_KEYS.FAQS);
  const updated = faqs.map((f) => (f.id === updatedFaq.id ? { ...f, ...updatedFaq } : f));
  mockApi.save(STORAGE_KEYS.FAQS, updated);
  return updatedFaq;
});

export const deleteFaq = createAsyncThunk('faqs/deleteFaq', async (id) => {
  const faqs = mockApi.get(STORAGE_KEYS.FAQS);
  const updated = faqs.filter((f) => f.id !== id);
  mockApi.save(STORAGE_KEYS.FAQS, updated);
  return id;
});

const faqSlice = createSlice({
  name: 'faqs',
  initialState: {
    items: mockApi.get(STORAGE_KEYS.FAQS) || [],
    loading: false,
    error: null,
    categoryFilter: 'All',
    searchQuery: '',
    selectedFaq: null
  },
  reducers: {
    setCategoryFilter: (state, action) => {
      state.categoryFilter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedFaq: (state, action) => {
      state.selectedFaq = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addFaq.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        const index = state.items.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.id !== action.payload);
      });
  }
});

export const { setCategoryFilter, setSearchQuery, setSelectedFaq } = faqSlice.actions;
export default faqSlice.reducer;
