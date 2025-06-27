
import React, { useState } from 'react';
import { Activity, Filter, Download, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const SystemLogs: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const logs = [
    {
      id: 1,
      timestamp: '2025-06-18 14:30:25',
      type: 'LOGIN',
      user: 'BS. Nguyễn Văn A',
      action: 'Đăng nhập vào hệ thống',
      ip: '192.168.1.100',
      status: 'success',
      details: 'Đăng nhập thành công từ Chrome browser'
    },
    {
      id: 2,
      timestamp: '2025-06-18 14:25:15',
      type: 'CREATE_RECORD',
      user: 'BS. Trần Thị B',
      action: 'Tạo hồ sơ bệnh án mới',
      ip: '192.168.1.105',
      status: 'success',
      details: 'Tạo hồ sơ cho bệnh nhân ID: 123'
    },
    {
      id: 3,
      timestamp: '2025-06-18 14:20:08',
      type: 'UPDATE_APPOINTMENT',
      user: 'Lễ tân Hoa',
      action: 'Cập nhật trạng thái lịch hẹn',
      ip: '192.168.1.102',
      status: 'success',
      details: 'Cập nhật lịch hẹn ID: 456 từ "Chờ khám" thành "Đang khám"'
    },
    {
      id: 4,
      timestamp: '2025-06-18 14:15:42',
      type: 'LOGIN',
      user: 'unknown_user',
      action: 'Thử đăng nhập không thành công',
      ip: '203.162.4.115',
      status: 'error',
      details: 'Đăng nhập thất bại - Sai mật khẩu (3 lần liên tiếp)'
    },
    {
      id: 5,
      timestamp: '2025-06-18 14:10:30',
      type: 'SYSTEM',
      user: 'System',
      action: 'Backup dữ liệu tự động',
      ip: 'localhost',
      status: 'success',
      details: 'Backup hoàn thành - Dung lượng: 2.3GB'
    },
    {
      id: 6,
      timestamp: '2025-06-18 14:05:17',
      type: 'DELETE',
      user: 'Admin Minh',
      action: 'Xóa tài khoản người dùng',
      ip: '192.168.1.101',
      status: 'warning',
      details: 'Xóa tài khoản bệnh nhân không hoạt động - ID: 789'
    },
    {
      id: 7,
      timestamp: '2025-06-18 13:55:23',
      type: 'CREATE_USER',
      user: 'Admin Minh',
      action: 'Tạo tài khoản bác sĩ mới',
      ip: '192.168.1.101',
      status: 'success',
      details: 'Tạo tài khoản cho BS. Lê Văn X - Chuyên khoa Thần kinh'
    },
    {
      id: 8,
      timestamp: '2025-06-18 13:50:45',
      type: 'UPDATE_SYSTEM',
      user: 'System',
      action: 'Cập nhật cấu hình hệ thống',
      ip: 'localhost',
      status: 'info',
      details: 'Cập nhật thời gian backup từ 02:00 thành 03:00'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'LOGIN': return <Info size={16} />;
      case 'CREATE_RECORD': return <CheckCircle size={16} />;
      case 'CREATE_USER': return <CheckCircle size={16} />;
      case 'UPDATE_APPOINTMENT': return <Activity size={16} />;
      case 'DELETE': return <XCircle size={16} />;
      case 'SYSTEM': return <Activity size={16} />;
      case 'UPDATE_SYSTEM': return <Activity size={16} />;
      default: return <Info size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LOGIN': return 'bg-blue-100 text-blue-800';
      case 'CREATE_RECORD': return 'bg-green-100 text-green-800';
      case 'CREATE_USER': return 'bg-purple-100 text-purple-800';
      case 'UPDATE_APPOINTMENT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'SYSTEM': return 'bg-gray-100 text-gray-800';
      case 'UPDATE_SYSTEM': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = selectedType === 'all' 
    ? logs 
    : logs.filter(log => log.type === selectedType);

  const logStats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    error: logs.filter(l => l.status === 'error').length,
    warning: logs.filter(l => l.status === 'warning').length
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
        
        <button className="flex items-center space-x-2 clinic-button-primary">
          <Download size={20} />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-clinic-navy">{logStats.total}</h3>
          <p className="text-gray-600">Tổng sự kiện</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-green-600">{logStats.success}</h3>
          <p className="text-gray-600">Thành công</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-red-600">{logStats.error}</h3>
          <p className="text-gray-600">Lỗi</p>
        </div>
        <div className="clinic-card text-center">
          <h3 className="text-2xl font-bold text-yellow-600">{logStats.warning}</h3>
          <p className="text-gray-600">Cảnh báo</p>
        </div>
      </div>

      {/* Filters */}
      <div className="clinic-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại sự kiện
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            >
              <option value="all">Tất cả sự kiện</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="CREATE_RECORD">Tạo hồ sơ</option>
              <option value="CREATE_USER">Tạo người dùng</option>
              <option value="UPDATE_APPOINTMENT">Cập nhật lịch hẹn</option>
              <option value="DELETE">Xóa dữ liệu</option>
              <option value="SYSTEM">Hệ thống</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinic-blue">
              <option value="all">Tất cả trạng thái</option>
              <option value="success">Thành công</option>
              <option value="error">Lỗi</option>
              <option value="warning">Cảnh báo</option>
              <option value="info">Thông tin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="clinic-card">
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-2 rounded-lg ${getTypeColor(log.type)}`}>
                    {getTypeIcon(log.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-clinic-navy">{log.action}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                        {log.status === 'success' ? 'Thành công' :
                         log.status === 'error' ? 'Lỗi' :
                         log.status === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Người dùng:</strong> {log.user}
                      </div>
                      <div>
                        <strong>Thời gian:</strong> {log.timestamp}
                      </div>
                      <div>
                        <strong>IP:</strong> {log.ip}
                      </div>
                    </div>
                    
                    <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      <strong>Chi tiết:</strong> {log.details}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-8">
            <Activity className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Không có nhật ký nào</p>
          </div>
        )}
      </div>

      {/* Security Alerts */}
      <div className="clinic-card">
        <h2 className="text-xl font-poppins font-semibold text-clinic-navy mb-4">
          Cảnh báo bảo mật
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="text-red-600" size={20} />
            <div>
              <h4 className="font-medium text-red-800">Đăng nhập thất bại liên tiếp</h4>
              <p className="text-sm text-red-600">
                IP 203.162.4.115 thử đăng nhập thất bại 3 lần - 14:15
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="text-yellow-600" size={20} />
            <div>
              <h4 className="font-medium text-yellow-800">Dung lượng ổ cứng</h4>
              <p className="text-sm text-yellow-600">
                Dung lượng đã sử dụng 85% - Cần dọn dẹp hoặc mở rộng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
