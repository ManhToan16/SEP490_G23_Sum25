
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getRoleFromPath = () => {
    if (location.pathname.includes('/patient')) return 'Bệnh nhân';
    if (location.pathname.includes('/receptionist')) return 'Lễ tân';
    if (location.pathname.includes('/doctor')) return 'Bác sĩ';
    if (location.pathname.includes('/admin')) return 'Quản trị viên';
    return '';
  };

  const getWelcomeMessage = () => {
    const role = getRoleFromPath();
    return `Xin chào, ${role}`;
  };

  const handleLogout = () => {
    navigate('/home');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-poppins font-semibold text-clinic-navy">
            Phòng khám nội thần kinh
          </h1>
          <p className="text-sm text-gray-600">{getWelcomeMessage()}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-clinic-navy">
            <User size={20} />
            <span className="font-medium">Người dùng</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-clinic-navy transition-colors"
          >
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
