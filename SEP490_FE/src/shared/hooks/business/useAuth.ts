import { useAppSelector, useAppDispatch } from "../../store";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  logout,
  clearError,
  checkAuth,
} from "../../store/slices/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Register function
  const register = async (userData: any) => {
    try {
      const result = await dispatch(registerUser(userData)).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logoutAction = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      return { success: true };
    } catch (error: any) {
      // Even if API fails, logout locally
      dispatch(logout());
      return { success: true };
    }
  };

  // Get current user
  const refreshUser = async () => {
    try {
      const result = await dispatch(getCurrentUser()).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Check auth from localStorage
  const checkAuthentication = () => {
    dispatch(checkAuth());
  };

  // Clear auth error
  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,

    // Actions
    login,
    register,
    logout: logoutAction,
    refreshUser,
    checkAuthentication,
    clearError: clearAuthError,
  };
};
