
import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Filter, Download, AlertTriangle, Info, CheckCircle, XCircle, Search, RefreshCw, User } from 'lucide-react';
import { auditLogService } from '../../shared/services/auditLog';
import appointmentService from '../../shared/services/appointmentService';
import Modal from '../../shared/components/common/Modal';

interface AuditLog {
  id: number;
  userId: string;
  userName?: string;
  action: string;
  tableName: string;
  recordId: string;
  oldData: string | null;
  newData: string | null;
  actionTime: string;
  user: any;
}

interface AuditLogsResponse {
  items: AuditLog[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  // Thêm các trường khác nếu cần
}

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState<UserInfo | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    tableName: '',
    recordId: '',
    pageNumber: 1,
    pageSize: 10
  });
  
  const [pagination, setPagination] = useState({
    totalItems: 0,
    pageNumber: 1,
    pageSize: 10
  });

  // Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await auditLogService.getAuditLogs(filters);
      
      setLogs(response.items);
      setPagination({
        totalItems: response.totalItems,
        pageNumber: response.pageNumber,
        pageSize: response.pageSize
      });
    } catch (err: any) {
      // More detailed error handling
      let errorMessage = 'Không thể tải dữ liệu audit logs';
      
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 500) {
          errorMessage = 'Lỗi server (500) - Vui lòng thử lại sau';
        } else if (err.response.status === 404) {
          errorMessage = 'API endpoint không tồn tại (404)';
        } else if (err.response.status === 401) {
          errorMessage = 'Không có quyền truy cập (401)';
        } else {
          errorMessage = `Lỗi server (${err.response.status}): ${err.response.data?.message || err.message}`;
        }
      } else if (err.request) {
        // Network error
        errorMessage = 'Lỗi kết nối mạng - Vui lòng kiểm tra kết nối internet';
      } else {
        // Other error
        errorMessage = err.message || 'Có lỗi xảy ra khi tải dữ liệu';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchAuditLogs();
  }, [filters.pageNumber, filters.pageSize, fetchAuditLogs]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      pageNumber: 1 // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({
      ...prev,
      pageNumber: newPage
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      tableName: '',
      recordId: '',
      pageNumber: 1,
      pageSize: 10
    });
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return <CheckCircle size={16} className="text-green-600" />;
      case 'UPDATE': return <Activity size={16} className="text-blue-600" />;
      case 'DELETE': return <XCircle size={16} className="text-red-600" />;
      default: return <Info size={16} className="text-gray-600" />;
    }
  };

  // Get action color
  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };



  // Calculate stats
  const stats = {
    total: pagination.totalItems,
    create: logs.filter(log => log.action.toUpperCase() === 'CREATE').length,
    update: logs.filter(log => log.action.toUpperCase() === 'UPDATE').length,
    delete: logs.filter(log => log.action.toUpperCase() === 'DELETE').length
  };

  // Fetch user info by ID
  const fetchUserInfo = async (userId: string) => {
    setUserLoading(true);
    setUserError(null);
    
    try {
      const response = await appointmentService.getUserById(userId);
      
      // API trả về data trong array, lấy phần tử đầu tiên
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        setSelectedUserInfo(response.data[0]);
      } else if (response && response.data) {
        // Nếu data không phải array
        setSelectedUserInfo(response.data);
      } else {
        throw new Error('Invalid user data format');
      }
      
      setShowUserModal(true);
    } catch (err: any) {
      let errorMessage = 'Không thể tải thông tin người dùng';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Không tìm thấy người dùng';
        } else if (err.response.status === 401) {
          errorMessage = 'Không có quyền truy cập thông tin người dùng';
        } else {
          errorMessage = `Lỗi server (${err.response.status}): ${err.response.data?.message || err.message}`;
        }
      } else if (err.request) {
        errorMessage = 'Lỗi kết nối mạng';
      } else {
        errorMessage = err.message || 'Có lỗi xảy ra khi tải thông tin người dùng';
      }
      
      setUserError(errorMessage);
    } finally {
      setUserLoading(false);
    }
  };

  // Handle user info button click
  const handleUserInfoClick = (userId: string) => {
    fetchUserInfo(userId);
  };

  // Close user modal
  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUserInfo(null);
    setUserError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-clinic-navy mb-2">
            Nhật ký hệ thống
          </h1>
          <p className="text-gray-600">
            Theo dõi hoạt động và bảo mật hệ thống
          </p>
        </div>
        
        <button 
          onClick={fetchAuditLogs}
          disabled={loading}
          className="flex items-center space-x-2 clinic-button-secondary"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
        </button>
      </div>



      {/* Filters */}
      <div className="clinic-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-clinic-navy">Bộ lọc</h3>
          <button 
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Xóa bộ lọc
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Nhập User ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hành động
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            >
              <option value="">Tất cả hành động</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
          
                     <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Tên bảng
             </label>
             <select
               value={filters.tableName}
               onChange={(e) => handleFilterChange('tableName', e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
             >
               <option value="">Tất cả bảng</option>
               <option value="Users">Người dùng</option>
               <option value="PatientProfiles">Hồ sơ bệnh nhân</option>
               <option value="MedicalRecords">Hồ sơ bệnh án</option>
               <option value="ExaminationResults">Kết quả tổng quát</option>
               <option value="LaboratoryResults">Kết quả xét nghiệm</option>
             </select>
           </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record ID
            </label>
            <input
              type="text"
              value={filters.recordId}
              onChange={(e) => handleFilterChange('recordId', e.target.value)}
              placeholder="Nhập Record ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button 
            onClick={fetchAuditLogs}
            disabled={loading}
            className="flex items-center space-x-2 clinic-button-primary"
          >
            <Search size={16} />
            <span>Tìm kiếm</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="clinic-card bg-red-50 border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-600" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="clinic-card">
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-blue mx-auto"></div>
              <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : logs.length > 0 ? (
            logs.map((log) => {
              return (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                        {getActionIcon(log.action)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-clinic-navy">
                            {log.action} - {log.tableName}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <strong>ID người dùng:</strong>{' '}
                            <button
                              onClick={() => handleUserInfoClick(log.userId)}
                              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              <User size={14} />
                              <span>{log.userId}</span>
                            </button>
                          </div>
                          <div>
                            <strong>Tên người dùng:</strong> {log.userName || 'N/A'}
                          </div>
                          <div>
                            <strong>Thời gian:</strong> {formatDate(log.actionTime)}
                          </div>
                          <div>
                            <strong>Record ID:</strong> {log.recordId}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">Không có nhật ký nào</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination.totalItems > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {((pagination.pageNumber - 1) * pagination.pageSize) + 1} - {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalItems)} của {pagination.totalItems} kết quả
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={pagination.pageNumber <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Trước
              </button>
              
              <span className="px-3 py-1 text-sm">
                Trang {pagination.pageNumber} của {Math.ceil(pagination.totalItems / pagination.pageSize)}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={pagination.pageNumber >= Math.ceil(pagination.totalItems / pagination.pageSize)}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Info Modal */}
      <Modal
        open={showUserModal}
        onClose={closeUserModal}
        title="Thông tin người dùng"
      >
        {userLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-blue mx-auto"></div>
            <p className="text-gray-500 mt-2">Đang tải thông tin...</p>
          </div>
        ) : userError ? (
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-red-600">{userError}</p>
          </div>
        ) : selectedUserInfo ? (
          <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   ID
                 </label>
                 <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                   {selectedUserInfo.id}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Tên người dùng
                 </label>
                 <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                   {selectedUserInfo.name || 'N/A'}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Email
                 </label>
                 <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                   {selectedUserInfo.email || 'N/A'}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Số điện thoại
                 </label>
                 <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                   {selectedUserInfo.phoneNumber || 'N/A'}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Vai trò
                 </label>
                 <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                   {selectedUserInfo.role || 'N/A'}
                 </p>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Trạng thái
                 </label>
                 <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                   {selectedUserInfo.isActive ? 'Hoạt động' : 'Không hoạt động'}
                 </p>
               </div>
               {selectedUserInfo.address && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Địa chỉ
                   </label>
                   <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                     {selectedUserInfo.address}
                   </p>
                 </div>
               )}
               {selectedUserInfo.gender && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Giới tính
                   </label>
                   <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                     {selectedUserInfo.gender}
                   </p>
                 </div>
               )}
             </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={closeUserModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
      
    </div>
  );
};

export default SystemLogs;
