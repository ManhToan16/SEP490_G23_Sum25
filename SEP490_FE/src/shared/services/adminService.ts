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

  // Lấy danh sách ca làm việc
  getTimeSlots: async () => {
    try {
      const response = await api.get("/TimeSlots");
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching time slots:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Lấy danh sách lịch làm việc theo role và khoảng thời gian
  getSchedulesByRole: async (role: string, fromDate: string, toDate: string) => {
    try {
      const response = await api.get(`/Schedules/role/${role}?fromDate=${fromDate}&toDate=${toDate}`);
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching schedules:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Tạo lịch làm việc mới
  createSchedule: async (scheduleData: {
    userId: string;
    roomId: string;
    timeSlotId: string;
    date: string;
  }) => {
    try {
      const response = await api.post("/Schedules", scheduleData);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error creating schedule:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Cập nhật lịch làm việc
  updateSchedule: async (scheduleId: string, scheduleData: any) => {
    try {
      const response = await api.put(`/Schedules/${scheduleId}`, scheduleData);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error updating schedule:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Xóa lịch làm việc
  deleteSchedule: async (scheduleId: string) => {
    try {
      const response = await api.delete(`/Schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting schedule:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Lấy danh sách user theo role
  getUsersByRole: async (role: string) => {
    try {
      const response = await api.get(`/User/role/${role}`);
      // Một số API trả về data là mảng lồng mảng, lấy phần tử đầu tiên nếu cần
      const data = Array.isArray(response.data[0]) ? response.data[0] || [] : [];
      return data;
    } catch (error: any) {
      console.error("Error fetching users by role:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Lấy danh sách phòng khám (ExaminationRooms)
  getExaminationRooms: async () => {
    try {
      const response = await api.get(`/ExaminationRooms?pageNumber=1&pageSize=1000`);

      return response?.data[0]?.items || [];
    } catch (error: any) {
      console.error("Error fetching examination rooms:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Lấy danh sách phòng xét nghiệm (LaboratoryRooms)
  getLaboratoryRooms: async () => {
    try {
      const response = await api.get(`/LaboratoryRooms?pageNumber=1&pageSize=1000`);
      return response?.data[0]?.items || [];
    } catch (error: any) {
      console.error("Error fetching laboratory rooms:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Cập nhật lịch làm việc theo id
  updateScheduleById: async (id: string, data: { roomId: string; timeSlotId: string; status: string }) => {
    try {
      const response = await api.put(`/Schedules/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error("Error updating schedule by id:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Lấy thống kê lịch làm việc theo role
  getScheduleStatistics: async (role: string) => {
    try {
      const response = await api.get(`/Schedules/statistics/${role}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching schedule statistics:", error?.response?.data?.message || error.message);
      throw error;
    }
  },
};