import { api } from "./apiClient";
import { jwtDecode } from "jwt-decode";
import { getDeviceId } from "../utils/deviceHelper";

const TOKEN_KEY = "clinic_auth_token";
const USER_KEY = "clinic_user_data";

interface DecodedToken {
  name: string;
  role: string;
  userId: string;
  exp: number;
  iat: number;
}

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/Auth/login", {
        email,
        password,
        deviceId: getDeviceId(),
      });

      const { accessToken, refreshToken } = response.data?.[0];
      console.log('Login response:', response.data);
      const user = jwtDecode<DecodedToken>(accessToken);

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return { user, token: accessToken };
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const accessToken = localStorage.getItem("clinic_auth_token");
      const refreshToken = localStorage.getItem("refreshToken");
      const deviceId = getDeviceId();
      await api.post(
        "/Auth/logout",
        {
          accessToken,
          refreshToken,
          deviceId,
        },
      );
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("clinic_auth_token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("clinic_user_data");
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response: any = await api.post("/auth/refresh");
      if (response.token) {
        localStorage.setItem("clinic_auth_token", response.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return null;
      const user = jwtDecode<DecodedToken>(token);
      return user;
    } catch (err) {
      return null;
    }
  },

  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem("refreshToken"),

  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const response = await api.post("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Quên mật khẩu
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Reset mật khẩu
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default authService;
