import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/shared/hooks/business/useAuth';
import { useNavigate } from 'react-router-dom';

const TechnicianHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between bg-white border-b">
      <div className="flex items-center space-x-4">
        <div className="font-bold text-xl text-[#374151]">
          Phòng Khám - Kỹ Thuật Viên
        </div>
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          Technician
        </Badge>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <Bell className="h-5 w-5" />
        </Button>
        
        <Button variant="ghost" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{user?.name}</span>
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default TechnicianHeader; 