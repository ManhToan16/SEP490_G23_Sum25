import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Clock, 
  Calendar, 
  FileText, 
  User, 
  Users,
  BarChart3,
  Stethoscope
} from 'lucide-react';
import { cn } from '../../../../utils';
import { ROUTES, NAVIGATION_ITEMS } from '../../../../constants/routes';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

const NurseSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = NAVIGATION_ITEMS.NURSE;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getIcon = (iconName: string) => {
    const icons = {
      Home,
      Clock,
      Calendar,
      FileText,
      User,
      Users,
      BarChart3,
      Stethoscope,
    };
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Home className="h-5 w-5" />;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#2C3E50] rounded-lg flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Khu vực Y Tá</h3>
            <p className="text-sm text-gray-600">Chuyên khoa Nội thần kinh</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            variant={isActive(item.path) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start text-left",
              isActive(item.path) 
                ? "bg-[#2C3E50] text-white hover:bg-[#34495E]" 
                : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={() => navigate(item.path)}
          >
            <div className="flex items-center space-x-3">
                             {getIcon(item.icon)}
               <span>{item.label}</span>
            </div>
          </Button>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Lịch hôm nay</span>
            <Badge variant="outline">8 bệnh nhân</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Đang chờ</span>
            <Badge variant="secondary">3 người</Badge>
          </div>
        
        </div>
      </div>

    </div>
  );
};

export default NurseSidebar; 