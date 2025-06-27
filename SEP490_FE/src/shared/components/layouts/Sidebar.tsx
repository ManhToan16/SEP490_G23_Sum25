
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  Calendar, 
  FileText, 
  Users, 
  ClipboardList,
  Settings,
  Activity,
  UserPlus,
  Building,
  Star
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getMenuItems = () => {
    if (location.pathname.includes('/patient')) {
      return [
        { icon: Home, label: 'Trang chủ', path: '/patient/dashboard' },
        { icon: User, label: 'Thông tin cá nhân', path: '/patient/my-info' },
        { icon: FileText, label: 'Hồ sơ bệnh án', path: '/patient/medical-records' },
        { icon: Calendar, label: 'Lịch hẹn của tôi', path: '/patient/appointments' },
        { icon: ClipboardList, label: 'Đặt lịch khám', path: '/patient/book-appointment' },
        { icon: Star, label: 'Đánh giá bác sĩ', path: '/patient/review-list' },
      ];
    }
    
    if (location.pathname.includes('/receptionist')) {
      return [
        { icon: Home, label: 'Trang chủ', path: '/receptionist/dashboard' },
        { icon: Users, label: 'Danh sách bệnh nhân', path: '/receptionist/list' },
        { icon: Calendar, label: 'Lịch hẹn', path: '/receptionist/appointments' },
        { icon: UserPlus, label: 'Tạo bệnh nhân mới', path: '/receptionist/create-patient' },
        { icon: ClipboardList, label: 'Tạo lịch hẹn', path: '/receptionist/create-appointment' },
      ];
    }
    
    if (location.pathname.includes('/doctor')) {
      return [
        { icon: Home, label: 'Trang chủ', path: '/doctor/dashboard' },
        { icon: User, label: 'Thông tin cá nhân', path: '/doctor/my-info' },
        { icon: Calendar, label: 'Lịch làm việc', path: '/doctor/schedule' },
        { icon: Activity, label: 'Hàng chờ khám', path: '/doctor/queue' },
      ];
    }
    
    if (location.pathname.includes('/admin')) {
      return [
        { icon: Home, label: 'Trang chủ', path: '/admin/dashboard' },
        { icon: Users, label: 'Quản lý tài khoản', path: '/admin/accounts' },
        { icon: Building, label: 'Quản lý phòng khám', path: '/admin/clinic' },
        { icon: Star, label: 'Đánh giá bác sĩ', path: '/admin/doctor-feedback' },
        { icon: Settings, label: 'Nhật ký hệ thống', path: '/admin/logs' },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-poppins font-semibold text-clinic-navy mb-6">
          Menu điều hướng
        </h2>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive 
                    ? 'bg-clinic-blue text-clinic-navy' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-clinic-navy'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
