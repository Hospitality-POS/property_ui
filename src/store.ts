// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import authReducer from './features/Auth/AuthSlice';
// Import userReducer only if it exists
// import userReducer from '../slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Include user reducer only if it exists
    // user: userReducer,
    // Add other reducers here as needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Typed hooks for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector<RootState, T>(selector);

export default store;