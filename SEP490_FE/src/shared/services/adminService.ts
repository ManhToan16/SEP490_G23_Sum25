// services/adminService.ts
import { api } from "./apiClient";

export const adminService = {
  getListUsers: async (pageNumber = 1, pageSize = 10, role?: string) => {
    try {
      let url = `/User?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      if (role && role !== "ALL") url += `&role=${role}`;
      const response = await api.get(url);
      const pageData = response.data?.[0];
      return {
        users: pageData?.items || [],
        totalItems: pageData?.totalItems || 0,
        pageNumber: pageData?.pageNumber || 1,
        pageSize: pageData?.pageSize || 10,
      };
    } catch (error: any) {
      console.error("Error fetching user list:", error?.response?.data?.message || error.message);
      throw error;
    }
  },
  createUser: async (user: any) => {
    try {
      const response = await api.post("/User", user);
      // Trả về user mới tạo
      return response.data?.data;
    } catch (error: any) {
      console.error("Error creating user:", error?.response?.data?.message || error.message);
      throw error;
    }
  },
  deleteUser: async (userId: string) => {
    try {
      const response = await api.delete(`/User/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },
  updateUser: async (userId: string, user: any) => {
    try {
      const response = await api.put(`/User/${userId}`, user);
      // Trả về user đã cập nhật
      return response.data?.data?.[0];
    } catch (error: any) {
      throw error;
    }
  },
   
   activateUser: async (userId: string) => {
    try {
      const response = await api.put(`/User/active/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error activating user:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  
  deactivateUser: async (userId: string) => {
    try {
      const response = await api.put(`/User/deactive/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deactivating user:", error?.response?.data?.message || error.message);
      throw error;
    }
  },
};