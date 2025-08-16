import { api } from "./apiClient";

// Interface cho transaction response
export interface TransactionResponseDTO {
  id: string;
  materialId: string;
  materialName: string;
  transactionType: string;
  quantity: number;
  defectiveQuantity?: number;
  roomId: string;
  roomType: string;
  userId: string;
  userName: string;
  reason?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  price: number;
  supplierId: string;
  supplierName: string;
  isEdit: boolean;
}

// Interface cho provided summary
export interface ProvidedSummaryDTO {
  materialName: string;
  totalQuantity: number;
  roomId: string;
  roomType: string;
  roomName: string;
  batchInfo: {
    transactionId: string;
    quantity: number;
    status?: string;
  }[];
  isLowStock: boolean;
}

// Interface cho lịch sử approve/reject
export interface HistoryApproveRejectDTO {
  historyId: string;
  transactionId: string;
  materialId: string;
  materialName: string;
  quantity: number;
  action: string;
  changedBy: string;
  changedAt: string;
}

// Interface cho tổng vật tư theo phòng
export interface TotalByRoomDTO {
  materialId: string;
  materialName: string;
  totalQuantity: number;
  roomId: string;
  roomType: string;
  roomName: string;
  batchInfo: {
    transactionId: string | null;
    quantity: number;
    status: string | null;
  }[];
  isLowStock: boolean;
}

// Interface cho lịch sử sử dụng
export interface UsageHistoryDTO {
  historyId: string;
  roomId: string;
  materialId: string;
  materialName: string;
  oldQuantity: number;
  newQuantity: number;
  quantityUsed: number;
  changedBy: string;
  changedAt: string;
}

// Interface cho request sử dụng vật tư
export interface UseMaterialRequestDTO {
  materialId: string;
  quantity: number;
  roomId: string;
}

export const transactionService = {
  /**
   * Lấy danh sách hàng cần nhận hôm nay cho phòng của y tá
   * @param userId - ID của y tá
   * @returns Danh sách transactions cần nhận
   */
  getPendingProvideTransactionsForNurse: async (userId: string): Promise<TransactionResponseDTO[]> => {
    try {
      const response = await api.get(`/Transactions/schedule/${userId}`);
      
      if (response?.data?.statusCode === 404) {
        // Y tá không có lịch làm việc hôm nay
        return [];
      }
      
      if (response?.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching pending provide transactions:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách hàng đã nhận của phòng
   * @param userId - ID của y tá
   * @returns Danh sách vật tư đã nhận
   */
  getHistoryProvidedByRoomId: async (userId: string): Promise<ProvidedSummaryDTO[]> => {
    try {
      const response = await api.get(`/Transactions/historyProvideByRoomId?userId=${userId}`);
      
      if (response?.data?.statusCode === 404) {
        // Y tá không có lịch làm việc hôm nay
        return [];
      }
      
      if (response?.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching history provided:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Duyệt transaction (nhận hàng)
   * @param transactionId - ID của transaction
   * @param adminId - ID của admin duyệt
   * @returns Kết quả duyệt
   */
  approveProvideTransaction: async (transactionId: string, adminId: string): Promise<TransactionResponseDTO> => {
    try {
      const response = await api.put(`/Transactions/provide/approve/${transactionId}`, {
        adminId
      });
      return response.data;
    } catch (error: any) {
      console.error("Error approving provide transaction:", error?.response?.data?.Message || error.message);
      
      // Handle specific error cases
      if (error?.response?.data?.StatusCode === 401) {
        throw new Error('Bạn không có quyền truy cập.');
      }
      
      throw new Error(error?.response?.data?.Message || 'Có lỗi xảy ra khi nhận hàng');
    }
  },

  /**
   * Từ chối transaction
   * @param transactionId - ID của transaction
   * @param adminId - ID của admin từ chối
   * @returns Kết quả từ chối
   */
  rejectProvideTransaction: async (transactionId: string, adminId: string): Promise<TransactionResponseDTO> => {
    try {
      const response = await api.put(`/Transactions/provide/reject/${transactionId}`, {
        adminId
      });
      return response.data;
    } catch (error: any) {
      console.error("Error rejecting provide transaction:", error?.response?.data?.Message || error.message);
      
      // Handle specific error cases
      if (error?.response?.data?.StatusCode === 401) {
        throw new Error('Bạn không có quyền truy cập.');
      }
      
      throw new Error(error?.response?.data?.Message || 'Có lỗi xảy ra khi từ chối hàng');
    }
  },

  /**
   * Lấy thông tin transaction theo ID
   * @param transactionId - ID của transaction
   * @returns Thông tin transaction
   */
  getTransactionById: async (transactionId: string): Promise<TransactionResponseDTO> => {
    try {
      const response = await api.get(`/Transactions/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching transaction by ID:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy tất cả transactions với filter
   * @param materialId - ID vật tư (tùy chọn)
   * @param transactionType - Loại transaction (tùy chọn)
   * @param status - Trạng thái (tùy chọn)
   * @returns Danh sách transactions
   */
  getAllTransactions: async (
    materialId?: string, 
    transactionType?: string, 
    status?: string
  ): Promise<TransactionResponseDTO[]> => {
    try {
      const params: any = {};
      if (materialId) params.materialId = materialId;
      if (transactionType) params.transactionType = transactionType;
      if (status) params.status = status;

      const response = await api.get('/Transactions', params);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching all transactions:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy lịch sử approve/reject của y tá
   * @param userId - ID của y tá
   * @returns Danh sách lịch sử approve/reject
   */
  getHistoryApproveReject: async (userId: string): Promise<HistoryApproveRejectDTO[]> => {
    try {
      const response = await api.get(`/Transactions/historyApproveReject?userId=${userId}`);
      
      if (response?.data?.statusCode === 404) {
        return [];
      }
      
      if (response?.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching history approve/reject:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy tổng vật tư theo phòng của y tá
   * @param userId - ID của y tá
   * @returns Danh sách vật tư theo phòng
   */
  getTotalByRoomId: async (userId: string): Promise<TotalByRoomDTO[]> => {
    try {
      const response = await api.get(`/Transactions/total-by-room-id?userId=${userId}`);
      
      if (response?.data?.statusCode === 404) {
        return [];
      }
      
      if (response?.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching total by room:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Lấy lịch sử sử dụng vật tư
   * @param userId - ID của y tá
   * @returns Danh sách lịch sử sử dụng
   */
  getUsageHistory: async (userId: string): Promise<UsageHistoryDTO[]> => {
    try {
      const response = await api.get(`/Transactions/usage-history?userId=${userId}`);
      
      if (response?.data?.statusCode === 404) {
        return [];
      }
      
      if (response?.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error fetching usage history:", error?.response?.data?.Message || error.message);
      throw error;
    }
  },

  /**
   * Sử dụng vật tư
   * @param request - Thông tin sử dụng vật tư
   * @returns Kết quả sử dụng
   */
  useMaterial: async (request: UseMaterialRequestDTO): Promise<any> => {
    try {
      const response = await api.post('/Transactions/use', request);
      return response.data;
    } catch (error: any) {
      console.error("Error using material:", error?.response?.data?.Message || error.message);
      throw new Error(error?.response?.data?.Message || 'Có lỗi xảy ra khi sử dụng vật tư');
    }
  }
};
