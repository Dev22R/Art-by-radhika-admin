import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import usersReducer from './slices/usersSlice';
import designsReducer from './slices/designsSlice';
import pricingReducer from './slices/pricingSlice';
import reelsReducer from './slices/reelsSlice';
import enquiriesReducer from './slices/enquiriesSlice';
import faqReducer from './slices/faqSlice';
import themeReducer from './slices/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    users: usersReducer,
    designs: designsReducer,
    pricing: pricingReducer,
    reels: reelsReducer,
    enquiries: enquiriesReducer,
    faqs: faqReducer,
    theme: themeReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
