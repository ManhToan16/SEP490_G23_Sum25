import { api } from "./apiClient";

// Đơn giản hóa Auth Service
export const authService = {
  // Đăng nhập
  login: async (email: string, password: string) => {
    try {
      const response: any = await api.post("/auth/login", { email, password });

      // Lưu token và user data
      if (response.token) {
        localStorage.setItem("clinic_auth_token", response.token);
      }
      if (response.user) {
        localStorage.setItem("clinic_user_data", JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Đăng ký
  register: async (userData: any) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Ignore API error, logout locally anyway
      console.error("Logout API error:", error);
    } finally {
      // Always clean local storage
      localStorage.removeItem("clinic_auth_token");
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
  getCurrentUser: async () => {
    try {
      const response: any = await api.get("/auth/me");
      if (response.user) {
        localStorage.setItem("clinic_user_data", JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Đổi mật khẩu
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
