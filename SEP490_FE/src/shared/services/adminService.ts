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
      return response;
    } catch (error: any) {
      console.error("Error fetching patient list:", error);
      const message = error?.response?.data?.Message || error?.message || "Không thể tải danh sách bệnh nhân";
      throw new Error(message);
    }
  },

  /**
   * Tạo hồ sơ bệnh nhân mới
   * @param patientData - Thông tin bệnh nhân cần tạo
   * @returns Thông tin bệnh nhân đã tạo
   */
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

  /**
   * Cập nhật thông tin bệnh nhân
   * @param id - ID bệnh nhân cần cập nhật
   * @param patientData - Thông tin mới
   * @returns Thông tin bệnh nhân đã cập nhật
   */
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

  /**
   * Lấy thông tin chi tiết bệnh nhân theo ID
   * @param id - ID bệnh nhân
   * @returns Thông tin chi tiết bệnh nhân
   */
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
      const response = await api.get(`/ExaminationRooms/active`);
      return response?.data[0]|| [];
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
      const response = await api.get(`/LaboratoryRooms/active`);
      console.log(response?.data[0]);
      return response?.data[0]|| [];
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
  // SUPPLIER MANAGEMENT - Quản lý nhà cung cấp
  // ===============================================
  
  /**
   * Lấy danh sách tất cả nhà cung cấp
   * @returns Danh sách nhà cung cấp
   */
  getSupplierList: async () => {
    try {
      const response = await api.get('/Suppliers');
      return response.data|| [];
    } catch (error: any) {
      console.error("Error fetching supplier list:", error?.response?.data?.Message || error.message);
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
};