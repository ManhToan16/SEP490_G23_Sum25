import { createSlice } from "@reduxjs/toolkit";

// Simple initial state
const initialState = {
  theme: "light",
  sidebarOpen: true,
  loading: false,
  notifications: [],
  currentPage: "",
};

// Simple UI slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  setCurrentPage,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectUI = (state: { ui: typeof initialState }) => state.ui;
export const selectTheme = (state: { ui: typeof initialState }) =>
  state.ui.theme;
export const selectSidebarOpen = (state: { ui: typeof initialState }) =>
  state.ui.sidebarOpen;
export const selectNotifications = (state: { ui: typeof initialState }) =>
  state.ui.notifications;
