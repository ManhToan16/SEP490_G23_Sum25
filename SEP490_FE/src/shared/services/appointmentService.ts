import { api } from "./apiClient";
import apiClient from "./apiClient";

// Interface cho TimeSlot
export interface TimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  description: string;
}

// Interface cho Doctor
export interface Doctor {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  specialty?: string;
  status?: string;
}

// Interface cho Appointment
export interface Appointment {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  symptom: string;
  requiredDoctorId: string;
  requiredDoctorName: string;
  date: string;
  timeSlotId: string;
  timeSlotStartTime: string;
  timeSlotEndTime: string;
  status: string;
  totalPrice: number;
  expiredAt: string;
  createdAt: string;
}

// Interface cho Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}

// Interface cho API Response (generic)
export interface ApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T[];
}

// Interface cho API Response với single object data
export interface ApiSingleResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

// Interface cho ChangePasswordDTO
export interface ChangePasswordDTO {
  oldPassword: string;
  password: string;
  repassword: string;
}

// Interface cho UpdateUserDTO
export interface UpdateUserDTO {
  name: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  address?: string;
  role: string;
}

// Interface cho ExaminationRoom
export interface ExaminationRoomResponseDTO {
  id: string;
  name: string;
  description: string;
}

// Interface cho ExaminationRoomWithDoctorDTO
export interface ExaminationRoomWithDoctorDTO {
  room: ExaminationRoomResponseDTO;
  doctorId: string | null;
  doctorName: string | null;
  patientCount: number;
}

// Interface cho VisitRequestDTO
export interface VisitRequestDTO {
  examinationRoomId: string;
  appointmentId: string;
  assignedDoctorId: string;
  patientProfileId: string;
  isPrioritized: boolean;
}

// Interface cho VisitResponseDTO
export interface VisitResponseDTO {
  visitId: string;
  examinationRoomId: string;
  examinationRoomName: string;
  appointmentId: string;
  assignedDoctorId: string;
  assignedDoctorName: string;
  patientProfileId: string;
  patientName: string;
  queueNumber: number;
  totalPrice: number;
  status: string;
  isPrioritized: boolean;
}

// Interface cho ServiceResponseDTO
export interface ServiceResponseDTO {
  id: string;
  laboratoryRoomId: string;
  name: string;
  price?: number;
  description?: string;
}

// Interface cho AssignmentRequestDTO
export interface AssignmentRequestDTO {
  laboratoryRoomId: string;
  serviceIds: string[];
}

// Interface cho PrescriptionItemRequestDTO
export interface PrescriptionItemRequestDTO {
  medicineId: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// Interface cho PrescriptionRequestDTO
export interface PrescriptionRequestDTO {
  note: string;
  items: PrescriptionItemRequestDTO[];
}


export const appointmentService = {
  // Lấy danh sách time slots
  getAppointments: async (params?: any) => {
    try {
      return await api.get("/appointments", params);
    } catch (error) {
      throw error;
    }
  },
  getTimeSlots: async (): Promise<TimeSlot[]> => {
    try {
      const response = await api.get("/TimeSlots");

      // API trả về: { data: [{slot1}, {slot2}, ...] }
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error: any) {
      console.error("Error fetching time slots:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy danh sách bác sĩ
  getDoctors: async (): Promise<Doctor[]> => {
    try {
      const response = await api.get("/User/role/DOCTOR");

      // API trả về: { data: [[{doctor1}, {doctor2}, ...]] }
      if (response && response.data && Array.isArray(response.data)) {
        // Nếu data[0] là array chứa doctors
        if (response.data[0] && Array.isArray(response.data[0])) {
          return response.data[0];
        }
        // Nếu data trực tiếp là array doctors
        return response.data;
      }

      return [];
    } catch (error: any) {
      console.error("Error fetching doctors:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Tạo lịch hẹn (cho patient)
  createAppointment: async (appointmentData: any) => {
    try {
      const response = await api.post("/Appointment", appointmentData);

      // Kiểm tra response structure
      if (response && response.data) {
        return response.data;
      } else if (response) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Tạo lịch hẹn (cho clinic - admin/receptionist/doctor)
  createAppointmentByClinic: async (appointmentData: any): Promise<any> => {
    try {
      const response = await api.post("/Appointment/created-by-clinic", appointmentData);

      // API trả về: { statusCode: 201, success: true, message: "...", data: {...} }
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error creating appointment by clinic:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Xác nhận lịch hẹn (WAITING_FOR_CONFIRMATION -> WAITING_FOR_CHECK_IN)
  confirmAppointment: async (appointmentId: string): Promise<any> => {
    try {
      const response = await api.put(`/Appointment/${appointmentId}/confirm`);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [{appointment}] }
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error confirming appointment:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Hủy lịch hẹn (WAITING_FOR_CONFIRMATION -> CANCELLED)
  cancelAppointment: async (appointmentId: string): Promise<any> => {
    try {
      const response = await api.put(`/Appointment/${appointmentId}/cancel`);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [{appointment}] }
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error cancelling appointment:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Check-in lịch hẹn (WAITING_FOR_CHECK_IN -> CHECKED_IN)
  checkInAppointment: async (appointmentId: string): Promise<any> => {
    try {
      const response = await api.put(`/Appointment/${appointmentId}/check-in`);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [{appointment}] }
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error checking in appointment:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy danh sách tất cả lịch hẹn với filter và pagination
  getAllAppointment: async (params?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    dob?: string;
    date?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<ApiResponse<PaginatedResponse<Appointment>>> => {
    try {
      // Xây dựng query parameters
      const queryParams = new URLSearchParams();

      if (params?.name) queryParams.append('name', params.name);
      if (params?.email) queryParams.append('email', params.email);
      if (params?.phoneNumber) queryParams.append('phoneNumber', params.phoneNumber);
      if (params?.dob) queryParams.append('dob', params.dob);
      if (params?.date) queryParams.append('date', params.date);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `/Appointment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await api.get(url);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [{ paginatedResponse }] }
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching appointments:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy chi tiết lịch hẹn theo ID
  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    try {
      const response = await api.get(`/Appointment/${appointmentId}`);

      console.log('API Response for getAppointmentById:', response);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 200, success: true, message: "...", data: {...} }
      if (response && (response as any).statusCode === 200 && (response as any).success === true) {
        // Kiểm tra nếu data là array với 1 phần tử
        if (Array.isArray((response as any).data) && (response as any).data[0]) {
          return (response as any).data[0];
        }
        // Kiểm tra nếu data là object trực tiếp
        if ((response as any).data && typeof (response as any).data === 'object' && (response as any).data.id) {
          return (response as any).data;
        }
      }

      console.error('Unexpected API response format:', response);
      throw new Error('Invalid response from API');
    } catch (error: any) {
      console.error("Error fetching appointment detail:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy lịch hẹn theo user ID với optional date range
  getByUserSchedule: async (userId: string, params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<any> => {
    try {
      // Xây dựng query parameters
      const queryParams = new URLSearchParams();

      if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params?.toDate) queryParams.append('toDate', params.toDate);

      const url = `/Schedules/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await api.get(url);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      // Nhưng từ console log, data nằm trực tiếp trong response
      if (response) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching user schedules:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },
  // Lấy danh sách phòng khám theo ngày và giờ
  getExaminationRoomsByDate: async (
    time: string, // dạng "HH:mm:ss"
    date: string  // dạng "YYYY-MM-DD"
  ): Promise<ExaminationRoomWithDoctorDTO[]> => {
    try {
      const params = new URLSearchParams();
      params.append("time", time);
      params.append("date", date);

      const url = `/ExaminationRooms/ByDate?${params.toString()}`;
      const response = await api.get(url);
      if (response && response.data) {
        if (Array.isArray(response.data.data)) {
          return response.data.data;
        }
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }
    } catch (error: any) {
      console.error("Error fetching examination rooms by date:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Tạo visit (cho receptionist)
  createVisit: async (visitData: VisitRequestDTO): Promise<any> => {
    try {
      const response = await api.post("/Visit", visitData);

      // API trả về: { statusCode: 201, success: true, message: "...", data: {...} }
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error creating visit:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy danh sách visits theo phòng khám và ngày
  getVisitsByRoomAndDate: async (params: {
    examinationRoomId: string;
    status?: string;
    date: string; // dạng "YYYY-MM-DD"
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> => {
    try {
      // Xây dựng query parameters
      const queryParams = new URLSearchParams();

      queryParams.append('examinationRoomId', params.examinationRoomId);
      if (params.status) queryParams.append('status', params.status);
      queryParams.append('date', params.date);
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `/Visit?${queryParams.toString()}`;
      const response = await api.get(url);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 200, success: true, message: "...", data: { items: [...], pageNumber: 1, ... } }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching visits by room and date:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy thông tin chi tiết visit theo ID
  getVisitByVisitId: async (id: string): Promise<any> => {
    try {
      const url = `/Visit/${id}`;
      const response = await api.get(url);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching visit by ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy kết quả khám theo Visit ID
  getExaminationResultByVisitId: async (visitId: string): Promise<any> => {
    try {
      const url = `/ExaminationResult/visit/${visitId}`;
      const response = await api.get(url);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching examination result by visit ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },
  deleteAppointment: async (id: string) => {
    try {
      return await api.delete(`/appointments/${id}`);
    } catch (error) {
      throw error;
    }
  },
  // Tạo kết quả khám cho Visit
  createExaminationResult: async (visitId: string, examinationData: any): Promise<any> => {
    try {
      const url = `/ExaminationResult/visit/${visitId}`;
      const response = await api.post(url, examinationData);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 201, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 201) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error creating examination result:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy danh sách phòng xét nghiệm với filter và pagination
  getLaboratoryRooms: async (params?: {
    name?: string;
    description?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> => {
    try {
      // Xây dựng query parameters
      const queryParams = new URLSearchParams();

      if (params?.name) queryParams.append('name', params.name);
      if (params?.description) queryParams.append('description', params.description);
      if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `/LaboratoryRooms${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await api.get(url);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [{ paginatedResponse }] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching laboratory rooms:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy dịch vụ theo phòng xét nghiệm (roomId là id của LaboratoryRoom)
  getServices: async (roomId: string): Promise<ServiceResponseDTO[]> => {
    try {
      const url = `/Services/room/${roomId}`;
      const response = await api.get(url);

      console.log('Service response for room:', roomId, response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [[ServiceResponseDTO, ...]] }
      if (response && (response as any).statusCode === 200) {
        const data = (response as any).data;

        // Kiểm tra nếu data là array và có phần tử đầu tiên là array
        if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
          console.log('Found services:', data[0]);
          return data[0]; // Trả về array of services
        }

        // Fallback: nếu data trực tiếp là array of services
        if (Array.isArray(data) && data.length > 0 && data[0].id) {
          console.log('Found services (direct array):', data);
          return data;
        }

        // Trường hợp không có dữ liệu
        console.log('No services found for room:', roomId);
        return [];
      } else {
        console.log('Invalid response status:', (response as any).statusCode);
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching services by room:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Tạo chỉ định xét nghiệm cho Visit
  createAssignment: async (visitId: string, assignments: AssignmentRequestDTO[]): Promise<any> => {
    try {
      const url = `/Assignment/visit/${visitId}`;
      const response = await api.post(url, assignments);

      console.log('Assignment creation response:', response);

      // API trả về: { statusCode: 201, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 201) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error creating assignment:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Đánh dấu appointment đã thanh toán (PENDING -> COMPLETED hoặc status khác)
  markAsPaid: async (appointmentId: string): Promise<any> => {
    try {
      const url = `/Appointment/${appointmentId}/mark-as-paid`;
      const response = await api.put(url);

      console.log('Mark as paid response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error marking appointment as paid:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // In hóa đơn appointment (chỉ cho appointment có status PENDING)
  printInvoice: async (appointmentId: string): Promise<Blob> => {
    try {
      const url = `/Appointment/${appointmentId}/invoice`;
      // Sử dụng trực tiếp apiClient để có thể truyền responseType và headers
      const response = await apiClient.get(url, {
        responseType: 'blob', // Quan trọng: để nhận PDF file
        headers: {
          'Accept': 'application/pdf'
        }
      });

      console.log('Print invoice response:', response);

      // API trả về PDF file dưới dạng blob
      if (response && response.data && response.data instanceof Blob) {
        return response.data;
      } else if (response && response instanceof Blob) {
        return response;
      } else {
        throw new Error('Invalid response format - expected PDF blob');
      }
    } catch (error: any) {
      console.error("Error printing invoice:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy danh sách assignments theo phòng xét nghiệm và ngày
  getAssignmentsByRoomAndDate: async (params: {
    laboratoryRoomId: string;
    status?: string;
    date: string; // dạng "YYYY-MM-DD"
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> => {
    try {
      // Xây dựng query parameters
      const queryParams = new URLSearchParams();

      queryParams.append('laboratoryRoomId', params.laboratoryRoomId);
      if (params.status) queryParams.append('status', params.status);
      queryParams.append('date', params.date);
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `/Assignment?${queryParams.toString()}`;
      const response = await api.get(url);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 200, success: true, message: "...", data: [{ items: [...], pageNumber: 1, ... }] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching assignments by room and date:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy thông tin chi tiết assignment theo ID
  getAssignmentById: async (id: string): Promise<any> => {
    try {
      const url = `/Assignment/${id}`;
      const response = await api.get(url);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching assignment by ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy kết quả xét nghiệm theo Assignment ID
  getLaboratoryResultByAssignmentId: async (assignmentId: string): Promise<any> => {
    try {
      const url = `/LaboratoryResult/assignment/${assignmentId}`;
      const response = await api.get(url);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching laboratory result by assignment ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Tạo kết quả xét nghiệm cho Assignment
  createLaboratoryResult: async (assignmentId: string, laboratoryData?: any): Promise<any> => {
    try {
      const url = `/LaboratoryResult/assignment/${assignmentId}`;

      // Tạo request body với dữ liệu mặc định
      const requestBody = laboratoryData || {
        note: '', // Ghi chú mặc định rỗng
        // Có thể thêm các field khác nếu cần
      };

      console.log('Creating laboratory result for assignment:', assignmentId, 'with data:', requestBody);

      const response = await api.post(url, requestBody);

      // Vì axios interceptor đã return response.data, nên response ở đây chính là API response
      // API trả về: { statusCode: 201, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 201) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error creating laboratory result:", error?.response?.data?.Message || error.message);
      console.error("Full error response:", error?.response?.data);
      throw error;
    }
  },

  // Upload files cho Laboratory Result
  uploadFiles: async (laboratoryResultId: string, files: File[]): Promise<any> => {
    try {
      const url = `/LaboratoryResult/${laboratoryResultId}/upload-files`;

      // Tạo FormData để upload files
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Sử dụng trực tiếp apiClient để có thể truyền FormData và headers
      const response = await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload files response:', response);

      // API trả về: { statusCode: 201, success: true, message: "...", data: [...] }
      if (response && response.data) {
        // Kiểm tra nhiều trường hợp statusCode có thể
        const statusCode = (response.data as any).statusCode;
        if (statusCode === 201 || statusCode === 200 || (response.data as any).success === true) {
          return response.data;
        }
      }

      // Nếu response có data nhưng không có statusCode, vẫn trả về
      if (response && response.data) {
        console.log('Upload files response without expected statusCode, but has data:', response.data);
        return response.data;
      }

      throw new Error('Invalid response from API');
    } catch (error: any) {
      console.error("Error uploading files:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Xóa file theo fileId
  deleteFile: async (fileId: string): Promise<any> => {
    try {
      const url = `/LaboratoryResult/delete-file/${fileId}`;
      const response = await api.delete(url);

      console.log('Delete file response:', response);

      // API trả về: { statusCode: 200, success: true, message: "..." }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error deleting file:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Cập nhật kết quả xét nghiệm theo ID
  updateLaboratoryResult: async (id: string, laboratoryData: any): Promise<any> => {
    try {
      const url = `/LaboratoryResult/${id}`;
      const response = await api.put(url, laboratoryData);

      console.log('Update laboratory result response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error updating laboratory result:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Đánh dấu assignment đã hoàn thành
  completedAssignment: async (id: string): Promise<any> => {
    try {
      const url = `/Assignment/${id}/mark-as-completed`;
      const response = await api.put(url);

      console.log('Mark assignment as completed response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error marking assignment as completed:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy thông tin assignment theo Visit ID
  getAssignmentByVisitId: async (visitId: string): Promise<any> => {
    try {
      const url = `/Assignment/visitId/${visitId}`;
      const response = await api.get(url);

      console.log('Get assignment by visit ID response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      // Backend wrap result trong array: Data = new[] { result }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching assignment by visit ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Cập nhật trạng thái assignment thành "calling" (gọi bệnh nhân)
  updateAssignmentCalling: async (id: string): Promise<any> => {
    try {
      const url = `/Assignment/${id}/calling`;
      const response = await api.put(url);

      console.log('Update assignment calling response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error updating assignment calling status:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Cập nhật trạng thái visit thành "calling" (gọi bệnh nhân)
  updateVisitCalling: async (id: string): Promise<any> => {
    try {
      const url = `/Visit/${id}/calling`;
      const response = await api.put(url);

      console.log('Update visit calling response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error updating visit calling status:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Đánh dấu visit đã hoàn thành
  markAsCompleted: async (id: string): Promise<any> => {
    try {
      const url = `/Visit/${id}/mark-as-completed`;
      const response = await api.put(url);

      console.log('Mark visit as completed response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error marking visit as completed:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Cập nhật kết quả khám theo ID
  updateExaminationResult: async (id: string, examinationData: any): Promise<any> => {
    try {
      const url = `/ExaminationResult/${id}`;
      const response = await api.put(url, examinationData);

      console.log('Update examination result response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error updating examination result:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy danh sách tất cả thuốc với filter và pagination
  getAllMedicines: async (params?: {
    name?: string;
    description?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<any> => {
    try {
      // Xây dựng query parameters
      const queryParams = new URLSearchParams();

      if (params?.name) queryParams.append('name', params.name);
      if (params?.description) queryParams.append('description', params.description);
      if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `/Medicines${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await api.get(url);

      console.log('Get all medicines response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [{ paginatedResponse }] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching medicines:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy danh sách thuốc đang hoạt động
  getActiveMedicines: async (): Promise<any> => {
    try {
      const url = `/Medicines/active`;
      const response = await api.get(url);

      console.log('Get active medicines response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching active medicines:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Tạo đơn thuốc cho kết quả khám
  createPrescription: async (examinationResultId: string, prescriptionData: PrescriptionRequestDTO): Promise<any> => {
    try {
      const url = `/Prescription/examination-result/${examinationResultId}`;
      const response = await api.post(url, prescriptionData);

      console.log('Create prescription response:', response);

      // API trả về: { statusCode: 201, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 201) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error creating prescription:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Cập nhật đơn thuốc theo ID
  updatePrescription: async (id: string, prescriptionData: PrescriptionRequestDTO): Promise<any> => {
    try {
      const url = `/Prescription/${id}`;
      const response = await api.put(url, prescriptionData);

      console.log('Update prescription response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error updating prescription:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Xóa đơn thuốc theo ID
  deletePrescription: async (id: string): Promise<any> => {
    try {
      const url = `/Prescription/${id}`;
      const response = await api.delete(url);

      console.log('Delete prescription response:', response);

      // API trả về: { statusCode: 200, success: true, message: "..." }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error deleting prescription:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Tìm kiếm theo mã truy cập (access code)
  findByAccessCode: async (accessCode: string): Promise<any> => {
    try {
      const url = `/ExaminationResult/access-code/${accessCode}`;
      const response = await api.get(url);

      console.log('Find by access code response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error finding by access code:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy đơn thuốc theo examination result ID
  getPrescriptionByExaminationResultId: async (examinationResultId: string): Promise<any> => {
    try {
      const url = `/Prescription/examination-result/${examinationResultId}`;
      const response = await api.get(url);

      console.log('Get prescription by examination result ID response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error getting prescription by examination result ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },
  updateAppointment: async (id: string, appointmentData: any) => {
    // Lấy kết quả khám theo Visit ID
    try {
      return await api.put(`/appointments/${id}`, appointmentData);
    } catch (error) {
      throw error;
    }
  },
  // Lấy kết quả khám theo ID
  getExaminationResultById: async (id: string): Promise<any> => {
    try {
      const url = `/ExaminationResult/${id}`;
      const response = await api.get(url);

      console.log('Get examination result by ID response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error getting examination result by ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy danh sách phòng khám đang hoạt động
  getActiveExaminationRooms: async (): Promise<any> => {
    try {
      const url = `/ExaminationRooms/active`;
      const response = await api.get(url);

      console.log('Get active examination rooms response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error fetching active examination rooms:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy thông tin user theo ID
  getUserById: async (userId: string): Promise<any> => {
    try {
      const url = `/User/${userId}`;
      const response = await api.get(url);

      console.log('Get user by ID response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error getting user by ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Cập nhật lịch hẹn theo ID
  updateAppointmentReceptionist: async (id: string, appointmentData: any): Promise<any> => {
    try {
      const url = `/Appointment/${id}`;
      const response = await api.put(url, appointmentData);

      console.log('Update appointment response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error updating appointment:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy hồ sơ bệnh án theo patient profile ID
  getMedicalRecordByPatientProfile: async (patientProfileId: string): Promise<any> => {
    try {
      const url = `/MedicalRecord/patient-profile/${patientProfileId}`;
      const response = await api.get(url);

      console.log('Get medical record by patient profile response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error getting medical record by patient profile:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Cập nhật hồ sơ bệnh án
  updateMedicalRecord: async (medicalRecordId: string, medicalRecordData: any): Promise<any> => {
    try {
      const url = `/MedicalRecord/${medicalRecordId}`;
      const response = await api.put(url, medicalRecordData);

      console.log('Update medical record response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error updating medical record:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy kết quả khám theo medical record ID
  getExaminationResultByMedicalRecord: async (medicalRecordId: string): Promise<any> => {
    try {
      const url = `/ExaminationResult/medical-record/${medicalRecordId}`;
      const response = await api.get(url);

      console.log('Get examination result by medical record response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error getting examination result by medical record:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy visit theo patient profile ID
  getVisitByPatientProfile: async (patientProfileId: string): Promise<any> => {
    try {
      const url = `/Visit/patient-profile/${patientProfileId}`;
      const response = await api.get(url);

      console.log('Get visit by patient profile response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error getting visit by patient profile:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy visit theo ID
  getVisitById: async (visitId: string): Promise<any> => {
    try {
      const url = `/Visit/${visitId}`;
      const response = await api.get(url);

      console.log('Get visit by ID response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error getting visit by ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy kết quả xét nghiệm theo examination result ID
  getLaboratoryResultByExamResult: async (examinationResultId: string): Promise<any> => {
    try {
      const url = `/LaboratoryResult/examination-result/${examinationResultId}`;
      const response = await api.get(url);

      console.log('Get laboratory result by examination result ID response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error getting laboratory result by examination result ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (userId: string, userData: any): Promise<any> => {
    try {
      const url = `/User/${userId}`;
      const response = await api.put(url, userData);

      console.log('Update user response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: [...] }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error updating user:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Đổi mật khẩu người dùng
  changePassword: async (passwordData: ChangePasswordDTO): Promise<any> => {
    try {
      const url = `/Auth/change-password`;
      const response = await api.put(url, passwordData);

      console.log('Change password response:', response);

      // API trả về: { statusCode: 200, success: true, message: "...", data: null }
      if (response && (response as any).statusCode === 200) {
        return response;
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error: any) {
      console.error("Error changing password:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  // Lấy thông tin chi tiết người dùng (alias cho getUserById)
  getUserDetail: async (userId: string): Promise<any> => {
    return appointmentService.getUserById(userId);
  }
};

export default appointmentService;
