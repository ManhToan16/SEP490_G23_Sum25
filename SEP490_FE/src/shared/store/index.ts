import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";

// Import slices
import authSlice from "./slices/authSlice";
import uiSlice from "./slices/uiSlice";
import dataSlice from "./slices/dataSlice";

// Simple store configuration
export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    data: dataSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Đơn giản hóa
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Simple types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks - đơn giản
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);

export default store;
