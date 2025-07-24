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
      console.error("Error fetching user list:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  createUser: async (user: any) => {
    try {
      const response = await api.post("/User", user);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error creating user:", error?.response?.data?.Message || error.message);
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
      console.error("Error activating user:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },
  
  deactivateUser: async (userId: string) => {
    try {
      const response = await api.put(`/User/deactive/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deactivating user:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Patient Management
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
      return response;
    } catch (error: any) {
      console.error("Error fetching patient list:", error);
      const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách bệnh nhân";
      throw new Error(message);
    }
  },

  createPatient: async (patientData: any) => {
    try {
      const response = await api.post("/PatientProfile", patientData);
      return response;
    } catch (error: any) {
      console.error("Error creating patient:", error);
      const message = error?.response?.data?.Message || error?.message || "Không thể tạo bệnh nhân mới";
      throw new Error(message);
    }
  },

  updatePatient: async (id: string, patientData: any) => {
    try {
      const response = await api.put(`/PatientProfile/${id}`, patientData);
      return response;
    } catch (error: any) {
      console.error("Error updating patient:", error);
      const message = error?.response?.data?.Message || error?.message || "Không thể cập nhật bệnh nhân";
      throw new Error(message);
    }
  },

  getPatientById: async (id: string) => {
    try {
      const response = await api.get(`/PatientProfile/${id}`);
      return response;
    } catch (error: any) {
      console.error("Error fetching patient by id:", error);
      const message = error?.response?.data?.Message || error?.message || "Không thể tải thông tin bệnh nhân";
      throw new Error(message);
    }
  },

  // Time Slots
  getTimeSlots: async () => {
    try {
      const response = await api.get("/TimeSlots");
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching time slots:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Schedule Management - Updated to match BE
  getSchedulesByRole: async (role: string, fromDate: string, toDate: string) => {
    try {
      // Validate inputs
      if (!role || !fromDate || !toDate) {
        throw new Error("Role, fromDate và toDate là bắt buộc");
      }
      
      // Validate date format
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      
      if (isNaN(fromDateObj.getTime()) || isNaN(toDateObj.getTime())) {
        throw new Error("Định dạng ngày không hợp lệ");
      }
      
      if (fromDateObj > toDateObj) {
        throw new Error("Ngày bắt đầu không thể sau ngày kết thúc");
      }
      
      const url = `/Schedules/role/${role}?fromDate=${fromDate}&toDate=${toDate}`;
      console.log('📅 API Call:', url);
      
      const response = await api.get(url);
      console.log('📅 API Response:', response.data?.length || 0, 'schedules');
      
      return response.data || [];
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tải lịch làm việc";
      console.error("Error fetching schedules:", message);
      console.error("Full error:", error);
      throw new Error(message);
    }
  },

  getSchedulesByUserId: async (userId: string, fromDate?: string, toDate?: string) => {
    try {
      let url = `/Schedules/user/${userId}`;
      if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const response = await api.get(url);
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching user schedules:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  getSchedulesByRoomId: async (roomId: string, fromDate?: string, toDate?: string) => {
    try {
      let url = `/Schedules/room/${roomId}`;
      if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const response = await api.get(url);
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching room schedules:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  getAllSchedules: async (fromDate?: string, toDate?: string) => {
    try {
      let url = `/Schedules/range`;
      if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const response = await api.get(url);
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching all schedules:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  createSchedule: async (scheduleData: {
    userId: string;
    roomId: string;
    timeSlotId: string;
    date: string;
  }) => {
    try {
      const response = await api.post("/Schedules", scheduleData);
      return response.data || response;
    } catch (error: any) {
      console.error("Error creating schedule:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  createScheduleRange: async (scheduleRangeData: {
    userIds: string[];
    roomIds: string[];
    timeSlotIds: string[];
    fromDate: string;
    toDate: string;
  }) => {
    try {
      const response = await api.post("/Schedules/range", scheduleRangeData);
      return response.data || [];
    } catch (error: any) {
      console.error("Error creating schedule range:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  updateSchedule: async (scheduleId: string, scheduleData: any) => {
    try {
      const response = await api.put(`/Schedules/${scheduleId}`, scheduleData);
      return response.data || response;
    } catch (error: any) {
      console.error("Error updating schedule:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  deleteSchedule: async (scheduleId: string) => {
    try {
      const response = await api.delete(`/Schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting schedule:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  getScheduleStatistics: async (role: string, fromDate?: string, toDate?: string) => {
    try {
      let url = `/Schedules/statistics/${role}`;
      if (fromDate && toDate) {
        url += `?fromDate=${fromDate}&toDate=${toDate}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching schedule statistics:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // User Management by Role
  getUsersByRole: async (role: string) => {
    try {
      const response = await api.get(`/User/role/${role}`);
      // BE trả về data là mảng lồng mảng, lấy phần tử đầu tiên nếu cần
      const data = Array.isArray(response.data[0]) ? response.data[0] || [] : response.data || [];
      return data;
    } catch (error: any) {
      console.error("Error fetching users by role:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Room Management
  getExaminationRooms: async () => {
    try {
      const response = await api.get(`/ExaminationRooms?pageNumber=1&pageSize=1000`);
      return response?.data[0]?.items || [];
    } catch (error: any) {
      console.error("Error fetching examination rooms:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  getLaboratoryRooms: async () => {
    try {
      const response = await api.get(`/LaboratoryRooms?pageNumber=1&pageSize=1000`);
      return response?.data[0]?.items || [];
    } catch (error: any) {
      console.error("Error fetching laboratory rooms:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Material/Category Management
  getMaterialTypeList: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await api.get(`/Categories?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      const pageData = response.data?.data?.[0];
      return {
        items: pageData?.items || [],
        totalItems: pageData?.totalItems || 0,
        pageNumber: pageData?.pageNumber || 1,
        pageSize: pageData?.pageSize || 10,
      };
    } catch (error: any) {
      console.error("Error fetching material type list:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  getMaterialTypeDetail: async (id: string) => {
    try {
      const response = await api.get(`/Categories/${id}`);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error fetching material type detail:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  createMaterialType: async (data: { name: string; description: string }) => {
    try {
      const response = await api.post('/Categories', data);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error creating material type:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  updateMaterialType: async (id: string, data: { name: string; description: string }) => {
    try {
      const response = await api.put(`/Categories/${id}`, data);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error updating material type:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  deleteMaterialType: async (id: string) => {
    try {
      const response = await api.delete(`/Categories/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting material type:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },
};