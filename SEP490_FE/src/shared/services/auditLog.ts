// services/auditLog.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://be.khanhanclinic.io.vn';

// Create a direct axios instance without authentication
const directApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const auditLogService = {
  getAuditLogs: async (params: {
    userId?: string;
    action?: string;
    tableName?: string;
    recordId?: string;
    pageNumber?: number;
    pageSize?: number;
  } = {}) => {
    try {
      const { userId, action, tableName, recordId, pageNumber = 1, pageSize = 10 } = params;
      let url = `/api/Auth/log?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      
      if (userId) url += `&userId=${encodeURIComponent(userId)}`;
      if (action) url += `&action=${encodeURIComponent(action)}`;
      if (tableName) url += `&tableName=${encodeURIComponent(tableName)}`;
      if (recordId) url += `&recordId=${encodeURIComponent(recordId)}`;
      
      console.log('🔍 Fetching audit logs with URL:', url);
      
      const response = await directApi.get(url);
      console.log('📊 Audit logs response:', response.data);
      
      // Based on the Postman response structure: response.data.data[0] contains the paginated data
      const pageData = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      
      return {
        items: pageData?.items || [],
        totalItems: pageData?.totalItems || 0,
        pageNumber: pageData?.pageNumber || 1,
        pageSize: pageData?.pageSize || 10,
      };
    } catch (error: any) {
      console.error("Error fetching audit logs:", error?.response?.data?.message || error.message);
      throw error;
    }
  },
}; 