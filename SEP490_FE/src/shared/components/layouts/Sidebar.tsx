
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
  Star,
  ChevronDown
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = React.useState<string[]>([]);

  // Menu đa cấp cho admin
  const adminMenu = [
    { icon: Home, label: 'Trang chủ', path: '/admin/dashboard' },
    { icon: Users, label: 'Quản lý tài khoản', path: '/admin/accounts' },
    { icon: Building, label: 'Quản lý phòng khám', path: '/admin/clinic' },
    { icon: Star, label: 'Đánh giá bác sĩ', path: '/admin/doctor-feedback' },
    // Mục đa cấp mẫu
    {
      icon: ClipboardList,
      label: 'Quản lý kho',
      children: [
        { label: 'Quản lý vật tư', path: '/admin/materials' },
        { label: 'Quản lý loại vật tư', path: '/admin/material-types' },
      ]
    },
    { icon: Settings, label: 'Nhật ký hệ thống', path: '/admin/logs' },
  ];

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
        { icon: Calendar, label: 'Lịch làm việc', path: '/doctor/schedule' },
        { icon: Activity, label: 'Hàng chờ khám', path: '/doctor/queue' },
      ];
    }
    
    if (location.pathname.includes('/admin')) return adminMenu;

    return [];
  };

  const menuItems = getMenuItems();

  const handleToggle = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-poppins font-semibold text-clinic-navy mb-6">
          Menu điều hướng
        </h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            // Nếu là mục đa cấp
            if (item.children) {
              const isOpen = openMenus.includes(item.label);
              // Nếu có children, render accordion
              return (
                <div key={item.label}>
                  <button
                    onClick={() => handleToggle(item.label)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isOpen ? 'bg-clinic-blue text-clinic-navy' : 'text-gray-700 hover:bg-gray-50 hover:text-clinic-navy'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium flex-1">{item.label}</span>
                    <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="pl-8 space-y-1 mt-1">
                      {item.children.map((child) => {
                        const isChildActive = location.pathname === child.path;
                        return (
                          <button
                            key={child.path}
                            onClick={() => navigate(child.path)}
                            className={`w-full flex items-center px-3 py-2 rounded text-left text-sm transition-colors ${
                              isChildActive ? 'bg-blue-100 text-clinic-navy' : 'text-gray-700 hover:bg-gray-50 hover:text-clinic-navy'
                            }`}
                          >
                            <span>{child.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            // Mục thường
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
