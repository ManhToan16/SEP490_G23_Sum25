import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '@/shared/hooks/business/useAuth';
import { useNavigate } from 'react-router-dom';

const NurseHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  return (
    <div className="h-16 px-6 flex items-center justify-between bg-white border-b">
      <div className="flex items-center space-x-4">
        <div className="font-bold text-xl text-[#3B82F6]">
          Phòng Khám - Y Tá
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Y tá
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

export default NurseHeader; 