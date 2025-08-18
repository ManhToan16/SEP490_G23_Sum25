/**
 * Admin Service - Quản lý tất cả API calls cho Admin Dashboard
 * 
 * Các chức năng chính:
 * - User Management (Quản lý người dùng)
 * - Patient Management (Quản lý bệnh nhân) 
 * - Schedule Management (Quản lý lịch làm việc)
 * - Room Management (Quản lý phòng khám)
 * - Service Management (Quản lý dịch vụ)
 * - Material/Category Management (Quản lý loại vật tư)
 * 
 */
import { api } from "./apiClient";
import axios from "axios";

export const adminService = {
  // ===============================================
  // USER MANAGEMENT - Quản lý người dùng
  // ===============================================

  /**
   * Lấy danh sách người dùng với phân trang và lọc theo role
   * @param pageNumber - Số trang (mặc định: 1)
   * @param pageSize - Số item trên mỗi trang (mặc định: 10)
   * @param role - Lọc theo role (tùy chọn)
   * @returns {users, totalItems, pageNumber, pageSize}
   */
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

  /**
   * Tạo người dùng mới
   * @param user - Thông tin người dùng cần tạo
   * @returns Thông tin người dùng đã tạo
   */
  createUser: async (user: any) => {
    try {
      const response = await api.post("/User", user);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error creating user:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa người dùng theo ID
   * @param userId - ID người dùng cần xóa
   * @returns Kết quả xóa
   */
  deleteUser: async (userId: string) => {
    try {
      const response = await api.delete(`/User/${userId}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * @param userId - ID người dùng cần cập nhật
   * @param user - Thông tin mới
   * @returns Thông tin người dùng đã cập nhật
   */
  updateUser: async (userId: string, user: any) => {
    try {
      const response = await api.put(`/User/${userId}`, user);
      return response.data?.data?.[0];
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Kích hoạt tài khoản người dùng
   * @param userId - ID người dùng cần kích hoạt
   * @returns Kết quả kích hoạt
   */
  activateUser: async (userId: string) => {
    try {
      const response = await api.put(`/User/active/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error activating user:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Vô hiệu hóa tài khoản người dùng
   * @param userId - ID người dùng cần vô hiệu hóa
   * @returns Kết quả vô hiệu hóa
   */
  deactivateUser: async (userId: string) => {
    try {
      const response = await api.put(`/User/deactive/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deactivating user:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // ===============================================
  // PATIENT MANAGEMENT - Quản lý bệnh nhân
  // ===============================================

  /**
   * Lấy danh sách bệnh nhân với các bộ lọc
   * @param params - Object chứa các tham số lọc
   * @param params.name - Tên bệnh nhân (tùy chọn)
   * @param params.dateOfBirth - Ngày sinh (tùy chọn)
   * @param params.citizenId - CMND/CCCD (tùy chọn)
   * @param params.pageNumber - Số trang (mặc định: 1)
   * @param params.pageSize - Số item trên mỗi trang (mặc định: 10)
   * @returns Danh sách bệnh nhân với thông tin phân trang
   */
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

      const result = {
        items: pageData?.items || [],
        totalItems: pageData?.totalItems || 0,
        pageNumber: pageData?.pageNumber || 1,
        pageSize: pageData?.pageSize || 10,
      };

      return result;
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
    }
  },

  /**
   * Lấy thông tin chi tiết bệnh nhân theo ID
   * @param id - ID bệnh nhân
   * @returns Thông tin chi tiết bệnh nhân
   */
  getPatientById: async (id: string) => {
    try {
      const response = await api.get(`/PatientProfile/${id}`);


      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200 && (response as any).success === true) {
        // Data là array với 1 phần tử
        if (Array.isArray((response as any).data) && (response as any).data[0]) {
          return (response as any).data[0];
        }
      }

      console.error('Unexpected API response format:', response);
      throw new Error('Invalid response from API');
    } catch (error: any) {
      console.error("Error fetching patient by id:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // ===============================================
  // SCHEDULE MANAGEMENT - Quản lý lịch làm việc
  // ===============================================

  /**
   * Lấy danh sách tất cả time slots
   * @returns Danh sách time slots
   */
  getTimeSlots: async () => {
    try {
      const response = await api.get("/TimeSlots");
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching time slots:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy lịch làm việc theo role trong khoảng thời gian
   * @param role - Role (Doctor, Nurse, Technician, Receptionist)
   * @param fromDate - Ngày bắt đầu (format: YYYY-MM-DD)
   * @param toDate - Ngày kết thúc (format: YYYY-MM-DD)
   * @returns Danh sách lịch làm việc
   */
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
      const response = await api.get(url);

      return response.data || [];
    } catch (error: any) {
      const message = error?.response?.data?.Message || error?.message || "Không thể tải lịch làm việc";
      throw new Error(message);
    }
  },

  /**
   * Lấy lịch làm việc của một user cụ thể
   * @param userId - ID của user
   * @param fromDate - Ngày bắt đầu (tùy chọn)
   * @param toDate - Ngày kết thúc (tùy chọn)
   * @returns Danh sách lịch làm việc của user
   */
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

  /**
   * Lấy lịch làm việc của một phòng cụ thể
   * @param roomId - ID của phòng
   * @param fromDate - Ngày bắt đầu (tùy chọn)
   * @param toDate - Ngày kết thúc (tùy chọn)
   * @returns Danh sách lịch làm việc của phòng
   */
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

  activateExaminationRoom: async (id: string) => {
    try {
      let url = `/ExaminationRooms/examination/${id}/active`;
      const response = await api.put(url);
      return response?.data?.[0]?.items?.[0] || null;
    } catch (error: any) {
      console.error("Error fetching room schedules:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  deactivateExaminationRoom: async (id: string) => {
    try {
      let url = `/ExaminationRooms/examination/${id}/inactive`;
      const response = await api.put(url);
      return response?.data?.[0]?.items?.[0] || null;
    } catch (error: any) {
      console.error("Error fetching room schedules:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Laboratory
  activateLaboratoryRoom: async (id: string) => {
    try {
      let url = `/LaboratoryRooms/laboratory/${id}/active`;
      const response = await api.put(url);
      return response?.data?.[0]?.items?.[0] || null;
    } catch (error: any) {
      console.error("Error fetching room schedules:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  deactivateLaboratoryRoom: async (id: string) => {
    try {
      let url = `/LaboratoryRooms/laboratory/${id}/inactive`;
      const response = await api.put(url);
      return response?.data?.[0]?.items?.[0] || null;
    } catch (error: any) {
      console.error("Error fetching room schedules:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy tất cả lịch làm việc trong khoảng thời gian
   * @param fromDate - Ngày bắt đầu (tùy chọn)
   * @param toDate - Ngày kết thúc (tùy chọn)
   * @returns Danh sách tất cả lịch làm việc
   */
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

  /**
   * Tạo lịch làm việc mới
   * @param scheduleData - Thông tin lịch làm việc
   * @param scheduleData.userId - ID của user
   * @param scheduleData.roomId - ID của phòng
   * @param scheduleData.timeSlotId - ID của time slot
   * @param scheduleData.date - Ngày làm việc (format: YYYY-MM-DD)
   * @returns Lịch làm việc đã tạo
   */
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

  /**
   * Tạo nhiều lịch làm việc trong khoảng thời gian
   * @param scheduleRangeData - Thông tin lịch làm việc range
   * @param scheduleRangeData.userIds - Danh sách ID users
   * @param scheduleRangeData.roomIds - Danh sách ID phòng
   * @param scheduleRangeData.timeSlotIds - Danh sách ID time slots
   * @param scheduleRangeData.fromDate - Ngày bắt đầu
   * @param scheduleRangeData.toDate - Ngày kết thúc
   * @returns Danh sách lịch làm việc đã tạo
   */
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

  /**
   * Cập nhật lịch làm việc
   * @param scheduleId - ID lịch làm việc cần cập nhật
   * @param scheduleData - Thông tin mới
   * @returns Lịch làm việc đã cập nhật
   */
  updateSchedule: async (scheduleId: string, scheduleData: any) => {
    try {
      const response = await api.put(`/Schedules/${scheduleId}`, scheduleData);
      return response.data || response;
    } catch (error: any) {
      console.error("Error updating schedule:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa lịch làm việc
   * @param scheduleId - ID lịch làm việc cần xóa
   * @returns Kết quả xóa
   */
  deleteSchedule: async (scheduleId: string) => {
    try {
      const response = await api.delete(`/Schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting schedule:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy thống kê lịch làm việc theo role
   * @param role - Role cần thống kê
   * @param fromDate - Ngày bắt đầu (tùy chọn)
   * @param toDate - Ngày kết thúc (tùy chọn)
   * @returns Thống kê lịch làm việc
   */
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

  /**
   * Import lịch làm việc từ file Excel
   * @param file - File Excel cần import
   * @param userId - ID của user thực hiện import
   * @returns Kết quả import
   */
  importScheduleFromExcel: async (file: File, userId: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use axios directly for multipart/form-data
      const baseURL = (import.meta as any).env.VITE_API_URL || "https://be.khanhanclinic.io.vn/api";
      const token = localStorage.getItem("clinic_auth_token");

      const response = await axios.post(`${baseURL}/Schedules/import-create?userId=${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error importing schedule from Excel:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Download template Excel cho import lịch làm việc
   * @returns File Excel template
   */
  downloadScheduleTemplate: async () => {
    try {
      const baseURL = (import.meta as any).env.VITE_API_URL || "https://be.khanhanclinic.io.vn/api";
      const token = localStorage.getItem("clinic_auth_token");

      const response = await axios.get(`${baseURL}/Schedules/download-template`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ScheduleTemplate.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response.data;
    } catch (error: any) {
      console.error("Error downloading schedule template:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách users theo role
   * @param role - Role cần lọc (Doctor, Nurse, Technician, Receptionist)
   * @returns Danh sách users theo role
   */
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

  // ===============================================
  // ROOM MANAGEMENT - Quản lý phòng khám
  // ===============================================

  /**
   * Lấy danh sách phòng khám
   * @returns Danh sách phòng khám
   */
  getExaminationRooms: async () => {
    try {
      const response = await api.get(`/ExaminationRooms`);
      return response?.data?.[0]?.items || [];
    } catch (error: any) {
      console.error("Error fetching examination rooms:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng xét nghiệm
   * @returns Danh sách phòng xét nghiệm
   */
  getLaboratoryRooms: async () => {
    try {
      const response = await api.get(`/LaboratoryRooms`);
      return response?.data?.[0]?.items || [];
    } catch (error: any) {
      console.error("Error fetching laboratory rooms:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Tạo phòng khám mới
   * @param data - Thông tin phòng khám
   * @param data.name - Tên phòng
   * @param data.description - Mô tả phòng
   * @returns Phòng khám đã tạo
   */
  createExaminationRoom: async (data: { name: string; description: string }) => {
    const response = await api.post('/ExaminationRooms', data);
    return response.data;
  },

  /**
   * Tạo phòng xét nghiệm mới
   * @param data - Thông tin phòng xét nghiệm
   * @param data.name - Tên phòng
   * @param data.description - Mô tả phòng
   * @returns Phòng xét nghiệm đã tạo
   */
  createLaboratoryRoom: async (data: { name: string; description: string }) => {
    const response = await api.post('/LaboratoryRooms', data);
    return response.data;
  },

  /**
   * Xóa phòng khám
   * @param id - ID phòng khám cần xóa
   * @returns Kết quả xóa
   */
  deleteExaminationRoom: async (id: string) => {
    try {
      const response = await api.delete(`/ExaminationRooms/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting examination room:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa phòng xét nghiệm
   * @param id - ID phòng xét nghiệm cần xóa
   * @returns Kết quả xóa
   */
  deleteLaboratoryRoom: async (id: string) => {
    try {
      const response = await api.delete(`/LaboratoryRooms/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting laboratory room:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin phòng khám
   * @param id - ID phòng khám cần cập nhật
   * @param roomData - Thông tin mới
   * @returns Phòng khám đã cập nhật
   */
  updateExaminationRoom: async (id, roomData) => {
    const response = await api.put(`/ExaminationRooms/${id}`, roomData);
    return response.data;
  },

  /**
   * Cập nhật thông tin phòng xét nghiệm
   * @param id - ID phòng xét nghiệm cần cập nhật
   * @param roomData - Thông tin mới
   * @returns Phòng xét nghiệm đã cập nhật
   */
  updateLaboratoryRoom: async (id, roomData) => {
    const response = await api.put(`/LaboratoryRooms/${id}`, roomData);
    return response.data;
  },

  // ===============================================
  // SERVICE MANAGEMENT - Quản lý dịch vụ
  // ===============================================

  /**
   * Tạo dịch vụ mới
   * @param serviceData - Thông tin dịch vụ cần tạo
   * @returns Dịch vụ đã tạo
   */
  createService: async (serviceData: any) => {
    try {
      const response = await api.post('/Services', serviceData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating service:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin dịch vụ
   * @param id - ID dịch vụ cần cập nhật
   * @param serviceData - Thông tin mới
   * @returns Dịch vụ đã cập nhật
   */
  updateService: async (id: string, serviceData: any) => {
    try {
      const response = await api.put(`/Services/${id}`, serviceData);
      return response.data;
    } catch (error: any) {
      console.error("Error updating service:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa dịch vụ
   * @param id - ID dịch vụ cần xóa
   * @returns Kết quả xóa
   */
  deleteService: async (id: string) => {
    try {
      const response = await api.delete(`/Services/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting service:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết dịch vụ
   * @param id - ID dịch vụ
   * @returns Thông tin chi tiết dịch vụ
   */
  getService: async (id: string) => {
    try {
      const response = await api.get(`/Services/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching service:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả dịch vụ
   * @returns Danh sách tất cả dịch vụ
   */
  getAllServices: async () => {
    try {
      const response = await api.get('/Services');
      return response.data;
    } catch (error: any) {
      console.error("Error fetching all services:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách dịch vụ theo phòng
   * @param roomId - ID phòng
   * @returns Danh sách dịch vụ của phòng
   */
  getServicesByRoomId: async (roomId: string) => {
    const res = await api.get(`/Services/room/${roomId}`);
    return res.data[0];
  },

  // ===============================================
  // MATERIAL/CATEGORY MANAGEMENT - Quản lý loại vật tư
  // ===============================================

  /**
   * Lấy danh sách loại vật tư với phân trang
   * @param pageNumber - Số trang (mặc định: 1)
   * @param pageSize - Số item trên mỗi trang (mặc định: 10)
   * @returns {items, totalItems, pageNumber, pageSize}
   */
  getMaterialTypeList: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await api.get(`/Categories?pageNumber=${pageNumber}&pageSize=${pageSize}`);
      const pageData = response.data?.[0];
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

  /**
   * Lấy danh sách tất cả categories (không phân trang)
   * @returns Danh sách tất cả categories
   */
  getCategories: async () => {
    try {
      const response = await api.get('/Categories?pageNumber=1&pageSize=10000');
      return response.data?.[0]?.items || [];
    } catch (error: any) {
      console.error("Error fetching categories:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết loại vật tư
   * @param id - ID loại vật tư
   * @returns Thông tin chi tiết loại vật tư
   */
  getMaterialTypeDetail: async (id: string) => {
    try {
      const response = await api.get(`/Categories/${id}`);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error fetching material type detail:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Tạo loại vật tư mới
   * @param data - Thông tin loại vật tư
   * @param data.name - Tên loại vật tư
   * @param data.description - Mô tả loại vật tư
   * @returns Loại vật tư đã tạo
   */
  createMaterialType: async (data: { name: string; description: string }) => {
    try {
      const response = await api.post('/Categories', data);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error creating material type:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin loại vật tư
   * @param id - ID loại vật tư cần cập nhật
   * @param data - Thông tin mới
   * @param data.name - Tên loại vật tư
   * @param data.description - Mô tả loại vật tư
   * @returns Loại vật tư đã cập nhật
   */
  updateMaterialType: async (id: string, data: { name: string; description: string }) => {
    try {
      const response = await api.put(`/Categories/${id}`, data);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error updating material type:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa loại vật tư
   * @param id - ID loại vật tư cần xóa
   * @returns Kết quả xóa
   */
  deleteMaterialType: async (id: string) => {
    try {
      const response = await api.delete(`/Categories/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting material type:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // ===============================================
  // MATERIAL MANAGEMENT - Quản lý vật tư
  // ===============================================

  /**
   * Lấy danh sách vật tư với phân trang
   * @param pageNumber - Số trang (mặc định: 1)
   * @param pageSize - Số item trên mỗi trang (mặc định: 10)
   * @returns {items, totalItems, pageNumber, pageSize}
   */
  getMaterialList: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await api.get(`/Materials?pageNumber=${pageNumber}&pageSize=${pageSize}`);

      // Handle the nested array structure from the API
      const materials = response.data.items;

      return {
        items: materials || [],
        totalItems: materials?.length || 0,
        pageNumber: pageNumber,
        pageSize: pageSize,
      };
    } catch (error: any) {
      console.error("Error fetching material list:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy tổng quan vật tư cho phân phối (import summary)
   * @returns Danh sách vật tư với thông tin quantity và giá
   */
  getMaterialImportSummary: async () => {
    try {
      const response = await api.get('/Materials/import-summary');

      // API trả về: { statusCode: 200, success: true, message: "...", data: [[...materials]] }
      const materials = response.data?.[0] || [];

      return materials.map((material: any) => ({
        id: material.materialId,
        name: material.materialName,
        unit: material.unit,
        totalQuantity: material.quantity,
        availableQuantity: material.availableQuantity,
        totalPrice: material.totalPrice,
        // Default values for fields not provided by API
        description: `${material.materialName} - ${material.unit}`,
        category: 'Vật tư y tế',
        minStockAlert: Math.max(1, Math.floor(material.quantity * 0.1)), // 10% of total quantity
        roomAllocations: {},
        batches: [],
        totalValue: material.totalPrice,
        averagePrice: material.quantity > 0 ? material.totalPrice / material.quantity : 0
      }));
    } catch (error: any) {
      console.error("Error fetching material import summary:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết vật tư theo ID
   * @param id - ID vật tư
   * @returns Thông tin chi tiết vật tư
   */
  getMaterialById: async (id: string) => {
    try {
      const response = await api.get(`/Materials/${id}`);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error fetching material by id:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Tạo vật tư mới
   * @param materialData.name - Tên vật tư
   * @param materialData.categoryId - ID danh mục
   * @param materialData.supplierId - ID nhà cung cấp
   * @param materialData.unit - Đơn vị
   * @param materialData.quantityInStock - Số lượng trong kho
   * @param materialData.maxQuantity - Số lượng tối đa
   * @param materialData.minQuantity - Số lượng tối thiểu
   * @returns Vật tư đã tạo
   */
  createMaterial: async (materialData: {
    name: string;
    categoryId: string;
    supplierId: string | null;
    unit: string;
    quantityInStock: number;
    maxQuantity: number;
    minQuantity: number;
  }) => {
    try {
      // Kiểm tra token trước khi gửi request
      const token = localStorage.getItem("clinic_auth_token");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
      }

      const response = await api.post('/Materials', materialData);
      return response?.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      throw new Error(error?.response?.data?.Message || error?.message || "Có lỗi xảy ra khi tạo vật tư");
    }
  },

  /**
   * Cập nhật thông tin vật tư
   * @param id - ID vật tư cần cập nhật
   * @param materialData - Thông tin mới
   * @returns Vật tư đã cập nhật
   */
  updateMaterial: async (id: string, materialData: {
    name: string;
    categoryId: string;
    supplierId: string | null;
    unit: string;
    quantityInStock: number;
    maxQuantity: number;
    minQuantity: number;
  }) => {
    try {
      const response = await api.put(`/Materials/${id}`, materialData);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error updating material:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa vật tư
   * @param id - ID vật tư cần xóa
   * @returns Kết quả xóa
   */
  deleteMaterial: async (id: string) => {
    try {
      const response = await api.delete(`/Materials/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting material:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // ===============================================
  // SUPPLIER MANAGEMENT - Quản lý nhà cung cấp
  // ===============================================

  /**
   * Lấy danh sách tất cả nhà cung cấp
   * @returns Danh sách nhà cung cấp
   */
  getSupplierList: async () => {
    try {
      const response = await api.get('/Suppliers');
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching supplier list:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy hồ sơ bệnh án theo patientProfileId
  getByPatientProfileMedicalRecord: async (patientProfileId: string) => {
    try {
      const response = await api.get(`/MedicalRecord/patient-profile/${patientProfileId}`);
      return response.data?.data?.[0];
    } catch (error: any) {
      console.error("Error fetching medical record by patient profile:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  // Lấy lịch sử khám theo patientProfileId
  getByPatientProfileVisit: async (patientProfileId: string) => {
    try {
      const response = await api.get(`/Visit/patient-profile/${patientProfileId}`);
      return response.data?.data?.[0];
    } catch (error: any) {
      console.error("Error fetching visit by patient profile:", error?.response?.data?.message || error.message);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết nhà cung cấp theo ID
   * @param id - ID nhà cung cấp
   * @returns Thông tin chi tiết nhà cung cấp
   */
  getSupplierById: async (id: string) => {
    try {
      const response = await api.get(`/Suppliers/${id}`);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error fetching supplier by id:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Tạo nhà cung cấp mới
   * @param supplierData - Thông tin nhà cung cấp
   * @param supplierData.name - Tên nhà cung cấp
   * @param supplierData.phoneNumber - Số điện thoại
   * @param supplierData.email - Email
   * @param supplierData.address - Địa chỉ
   * @param supplierData.description - Mô tả
   * @returns Nhà cung cấp đã tạo
   */
  createSupplier: async (supplierData: {
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
    description: string;
  }) => {
    try {
      const response = await api.post('/Suppliers', supplierData);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error creating supplier:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin nhà cung cấp
   * @param id - ID nhà cung cấp cần cập nhật
   * @param supplierData - Thông tin mới
   * @returns Nhà cung cấp đã cập nhật
   */
  updateSupplier: async (id: string, supplierData: {
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
    description: string;
  }) => {
    try {
      const response = await api.put(`/Suppliers/${id}`, supplierData);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error updating supplier:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa nhà cung cấp
   * @param id - ID nhà cung cấp cần xóa
   * @returns Kết quả xóa
   */
  deleteSupplier: async (id: string) => {
    try {
      const response = await api.delete(`/Suppliers/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting supplier:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // ===============================================
  // TRANSACTION MANAGEMENT - Quản lý giao dịch vật tư
  // ===============================================

  /**
   * Lấy lịch sử phân phát vật tư
   * @param materialName - Tên vật tư để lọc (tùy chọn)
   * @param roomName - Tên phòng để lọc (tùy chọn)
   * @returns Danh sách lịch sử phân phát
   */
  getProvideHistories: async (materialName?: string, roomName?: string) => {
    try {
      let url = '/Transactions/provide-histories';
      const params = new URLSearchParams();

      if (materialName) {
        params.append('materialName', materialName);
      }

      if (roomName) {
        params.append('roomName', roomName);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.get(url);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching provide histories:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách đơn hàng trả lỗi
   * @returns Danh sách đơn hàng trả lỗi
   */
  getDefectiveBatches: async () => {
    try {
      const response = await api.get('/Transactions/defective-batches');

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching defective batches:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // ===============================================
  // MEDICINE MANAGEMENT - Quản lý thuốc
  // ===============================================

  /**
   * Lấy danh sách thuốc với phân trang
   * @param pageNumber - Số trang (mặc định: 1)
   * @param pageSize - Số item trên mỗi trang (mặc định: 10)
   * @returns {items, totalItems, pageNumber, pageSize}
   */
  getMedicineList: async (pageNumber = 1, pageSize = 10) => {
    try {
      const response = await api.get(`/Medicines?pageNumber=${pageNumber}&pageSize=${pageSize}`);

      // Handle both array and object response formats
      let pageData;
      if (Array.isArray(response.data)) {
        pageData = response.data[0];
      } else {
        pageData = response.data;
      }

      return {
        items: pageData?.items || [],
        totalItems: pageData?.totalItems || 0,
        pageNumber: pageData?.pageNumber || 1,
        pageSize: pageData?.pageSize || 10,
      };
    } catch (error: any) {
      console.error("Error fetching medicine list:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết thuốc theo ID
   * @param id - ID thuốc
   * @returns Thông tin chi tiết thuốc
   */
  getMedicineById: async (id: string) => {
    try {
      const response = await api.get(`/Medicines/${id}`);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error fetching medicine by id:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Tạo thuốc mới
   * @param medicineData - Thông tin thuốc cần tạo
   * @param medicineData.name - Tên thuốc
   * @param medicineData.activeIngredients - Hoạt chất
   * @param medicineData.strength - Liều lượng
   * @param medicineData.packaging - Quy cách đóng gói
   * @param medicineData.unit - Đơn vị
   * @param medicineData.description - Mô tả
   * @returns Thuốc đã tạo
   */
  createMedicine: async (medicineData: {
    name: string;
    activeIngredients: string;
    strength: string;
    packaging: string;
    unit: string;
    description: string;
  }) => {
    try {
      const response = await api.post('/Medicines', medicineData);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error creating medicine:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin thuốc
   * @param id - ID thuốc cần cập nhật
   * @param medicineData - Thông tin mới
   * @returns Thuốc đã cập nhật
   */
  updateMedicine: async (id: string, medicineData: {
    name: string;
    activeIngredients: string;
    strength: string;
    packaging: string;
    unit: string;
    description: string;
  }) => {
    try {
      const response = await api.put(`/Medicines/${id}`, medicineData);
      return response.data?.data;
    } catch (error: any) {
      console.error("Error updating medicine:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa thuốc
   * @param id - ID thuốc cần xóa
   * @returns Kết quả xóa
   */
  deleteMedicine: async (id: string) => {
    try {
      const response = await api.delete(`/Medicines/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting medicine:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // ===============================================
  // TRANSACTION IMPORT - Nhập lô hàng mới
  // ===============================================

  /**
   * Tạo phiếu nhập vật tư mới
   * @param importData - Thông tin nhập hàng
   * @param importData.materialId - ID vật tư
   * @param importData.price - Giá nhập
   * @param importData.quantity - Số lượng
   * @param importData.defectiveQuantity - Số lượng lỗi (tùy chọn)
   * @param importData.reason - Lý do nhập (tùy chọn)
   * @param importData.importDate - Ngày nhập hàng
   * @returns Kết quả tạo phiếu nhập
   */
  createImportTransaction: async (importData: {
    materialId: string;
    price: number;
    quantity: number;
    defectiveQuantity?: number;
    reason?: string;
    importDate: string;
  }) => {
    try {
      const response = await api.post('/Transactions/import', importData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating import transaction:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách transactions import cho một material
   * @param materialId - ID của material
   * @returns Danh sách transactions import
   */
  getImportTransactionsForMaterial: async (materialId: string) => {
    try {
      const response = await api.get(`/Transactions/import-to-provide/${materialId}`);

      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching import transactions for material:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng khám (examination rooms)
   * @returns Danh sách phòng khám
   */
  getExaminationRoomsForDistribution: async () => {
    try {
      const response = await api.get('/ExaminationRooms/active');
      return response.data[0] || [];
    } catch (error: any) {
      console.error("Error fetching examination rooms:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng xét nghiệm (laboratory rooms)
   * @returns Danh sách phòng xét nghiệm
   */
  getLaboratoryRoomsForDistribution: async () => {
    try {
      const response = await api.get('/LaboratoryRooms/active');
      return response.data[0] || [];
    } catch (error: any) {
      console.error("Error fetching laboratory rooms:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Phân phát vật tư cho các phòng
   * @param provideData - Thông tin phân phát
   * @param provideData.transactions - Danh sách transactions và phòng phân phát
   * @param provideData.transactions[].transactionId - ID của transaction
   * @param provideData.transactions[].rooms - Danh sách phòng và số lượng phân phát
   * @param provideData.transactions[].rooms[].roomId - ID của phòng
   * @param provideData.transactions[].rooms[].quantity - Số lượng phân phát cho phòng
   * @returns Kết quả phân phát
   */
  createProvideTransaction: async (provideData: {
    transactions: {
      transactionId: string;
      rooms: {
        roomId: string;
        quantity: number;
      }[];
    }[];
  }) => {
    try {
      const response = await api.post('/Transactions/provide', provideData);
      return response.data;
    } catch (error: any) {
      console.error("Error creating provide transaction:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy lịch sử nhập hàng của một material
   * @param materialId - ID của material
   * @returns Danh sách lịch sử nhập hàng
   */
  getImportHistory: async (materialId: string) => {
    try {
      const response = await api.get(`/Transactions/import-history/${materialId}`);

      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching import history:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin import transaction
   * @param transactionId - ID của transaction
   * @param updateData - Dữ liệu cập nhật
   * @returns Kết quả cập nhật
   */
  updateImportTransaction: async (transactionId: string, updateData: {
    materialId: string;
    price: number;
    quantity: number;
    defectiveQuantity: number;
    reason: string;
    importDate: string;
  }) => {
    try {
      const response = await api.put(`/Transactions/update-import/${transactionId}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error("Error updating import transaction:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Xóa import transaction
   * @param transactionId - ID của transaction
   * @returns Kết quả xóa
   */
  /**
 * Xóa import transaction
 * @param transactionId - ID của transaction cần xóa
 * @returns Kết quả xóa
 */
  deleteImportTransaction: async (transactionId: string) => {
    try {
      const response = await api.delete(`/Transactions/delete-import/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error deleting import transaction:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Cập nhật số lượng lỗi của transaction
   * @param transactionId - ID của transaction cần cập nhật
   * @param newDefectiveQuantity - Số lượng lỗi mới
   * @returns Kết quả cập nhật
   */
  updateDefectiveTransaction: async (transactionId: string, newDefectiveQuantity: number) => {
    try {
      const response = await api.put(`/Transactions/update-defective/${transactionId}`, {
        newDefectiveQuantity
      });
      return response.data;
    } catch (error: any) {
      console.error("Error updating defective transaction:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Duyệt đơn đổi trả hàng lỗi từ nhà cung cấp
   * @param transactionId - ID của transaction cần duyệt
   * @returns Kết quả duyệt
   */
  approveSupplierReturn: async (transactionId: string) => {
    try {
      const response = await api.put(`/Transactions/return/approve-supplier-return/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error approving supplier return:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Từ chối đơn đổi trả hàng lỗi từ nhà cung cấp
   * @param transactionId - ID của transaction cần từ chối
   * @returns Kết quả từ chối
   */
  rejectSupplierReturn: async (transactionId: string) => {
    try {
      const response = await api.put(`/Transactions/return/reject-supplier-return/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error rejecting supplier return:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },
};