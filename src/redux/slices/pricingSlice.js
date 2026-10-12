import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockApi } from '../../api/axiosClient';

const { STORAGE_KEYS } = mockApi;

export const fetchPricingPlans = createAsyncThunk('pricing/fetchPricingPlans', async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockApi.get(STORAGE_KEYS.PRICING);
});

export const addPricingPlan = createAsyncThunk('pricing/addPricingPlan', async (newPlan) => {
  const plans = mockApi.get(STORAGE_KEYS.PRICING);
  const created = {
    ...newPlan,
    id: 'plan_' + Date.now(),
    status: newPlan.status || 'Active',
    features: Array.isArray(newPlan.features)
      ? newPlan.features
      : (newPlan.features || '').split('\n').map((f) => f.trim()).filter(Boolean)
  };
  const updated = [created, ...plans];
  mockApi.save(STORAGE_KEYS.PRICING, updated);
  return created;
});

export const updatePricingPlan = createAsyncThunk('pricing/updatePricingPlan', async (updatedPlan) => {
  const plans = mockApi.get(STORAGE_KEYS.PRICING);
  const formatted = {
    ...updatedPlan,
    features: Array.isArray(updatedPlan.features)
      ? updatedPlan.features
      : (updatedPlan.features || '').split('\n').map((f) => f.trim()).filter(Boolean)
  };
  const updated = plans.map((p) => (p.id === formatted.id ? formatted : p));
  mockApi.save(STORAGE_KEYS.PRICING, updated);
  return formatted;
});

export const deletePricingPlan = createAsyncThunk('pricing/deletePricingPlan', async (id) => {
  const plans = mockApi.get(STORAGE_KEYS.PRICING);
  const updated = plans.filter((p) => p.id !== id);
  mockApi.save(STORAGE_KEYS.PRICING, updated);
  return id;
});

export const togglePlanPopular = createAsyncThunk('pricing/togglePlanPopular', async (id) => {
  const plans = mockApi.get(STORAGE_KEYS.PRICING);
  let changed = null;
  const updated = plans.map((p) => {
    if (p.id === id) {
      changed = { ...p, isPopular: !p.isPopular };
      return changed;
    }
    return p;
  });
  mockApi.save(STORAGE_KEYS.PRICING, updated);
  return changed;
});

const pricingSlice = createSlice({
  name: 'pricing',
  initialState: {
    items: mockApi.get(STORAGE_KEYS.PRICING) || [],
    loading: false,
    error: null,
    selectedPlan: null
  },
  reducers: {
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPricingPlans.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPricingPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(addPricingPlan.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updatePricingPlan.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePricingPlan.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
      })
      .addCase(togglePlanPopular.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  }
});

export const { setSelectedPlan } = pricingSlice.actions;
export default pricingSlice.reducer;
