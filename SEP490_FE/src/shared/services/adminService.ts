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

  getPatientList: async (
    params: {
      name?: string;
      dateOfBirth?: string;
      citizenId?: string;
      pageNumber?: number;
      pageSize?: number;
    } = {}
  ) => {
    try {
      const { name, dateOfBirth, citizenId, pageNumber = 1, pageSize = 10 } = params;
      let url = `/PatientProfile?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      if (name) url += `&name=${encodeURIComponent(name)}`;
      if (dateOfBirth) url += `&dateOfBirth=${encodeURIComponent(dateOfBirth)}`;
      if (citizenId) url += `&citizenId=${encodeURIComponent(citizenId)}`;
      const response = await api.get(url);
      // Dữ liệu trả về là mảng, lấy phần tử đầu tiên
      const pageData = Array.isArray(response.data) ? response.data[0] : undefined;
      return {
        items: pageData?.items || [],
        totalItems: pageData?.totalItems || 0,
        pageNumber: pageData?.pageNumber || 1,
        pageSize: pageData?.pageSize || 10,
      };
    } catch (error: any) {
      console.error("Error fetching patient list:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  createPatient: async (patient: {
    name: string;
    citizenId: string;
    phoneNumber: string;
    email: string;
    dateOfBirth: string; // Định dạng: "YYYY-MM-DD"
    gender: string;
    address?: string;
  }) => {
    try {
      const response = await api.post("/PatientProfile", patient);
      // Trả về bệnh nhân mới tạo
      return response.data?.data?.[0];
    } catch (error: any) {
      console.error("Error creating patient:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  updatePatient: async (
    id: string,
    patient: {
      name: string;
      citizenId: string;
      phoneNumber: string;
      email: string;
      dateOfBirth: string; // "YYYY-MM-DD" hoặc ISO string
      gender: string;
      address?: string;
    }
  ) => {
    try {
      const response = await api.put(`/PatientProfile/${id}`, patient);
      // Trả về bệnh nhân đã cập nhật
      return response.data?.data?.[0];
    } catch (error: any) {
      console.error("Error updating patient:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  getPatientById: async (id: string) => {
    try {
      const response = await api.get(`/PatientProfile/${id}`);
      // Trả về object bệnh nhân đầu tiên trong mảng Data
      return response.data?.data?.[0];
    } catch (error: any) {
      console.error("Error fetching patient by id:", error?.response?.data?.message || error.message);
      throw error;
    }
  },
};