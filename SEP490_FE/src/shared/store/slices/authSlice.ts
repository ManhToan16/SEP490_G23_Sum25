import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

// Simple async actions sử dụng authService
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Đăng nhập thất bại");
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData: any) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Đăng ký thất bại");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout();
    return null;
  } catch (error: any) {
    // Always logout locally even if API fails
    return null;
  }
});

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error: any) {
      throw new Error(error.message || "Không thể lấy thông tin user");
    }
  }
);

// Simple initial state
const initialState = {
  user: null,
  token: localStorage.getItem("clinic_auth_token"),
  isAuthenticated: !!localStorage.getItem("clinic_auth_token"),
  loading: false,
  error: null,
};

// Simple slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("clinic_auth_token");
      localStorage.removeItem("clinic_user_data");
    },
    // Check auth from localStorage on app start
    checkAuth: (state) => {
      const token = localStorage.getItem("clinic_auth_token");
      const userData = localStorage.getItem("clinic_user_data");

      if (token && userData) {
        try {
          state.token = token;
          state.user = JSON.parse(userData);
          state.isAuthenticated = true;
        } catch (error) {
          // Invalid data, clear it
          localStorage.removeItem("clinic_auth_token");
          localStorage.removeItem("clinic_user_data");
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Đăng nhập thất bại";
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Auto login after register if token is provided
        if (action.payload.data?.token) {
          state.user = action.payload.data.user;
          state.token = action.payload.data.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Đăng ký thất bại";
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Không thể lấy thông tin user";
        // If get user fails, logout
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("clinic_auth_token");
        localStorage.removeItem("clinic_user_data");
      });
  },
});

export const { clearError, setUser, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: typeof initialState }) => state.auth;
export const selectUser = (state: { auth: typeof initialState }) =>
  state.auth.user;
export const selectIsAuthenticated = (state: { auth: typeof initialState }) =>
  state.auth.isAuthenticated;
