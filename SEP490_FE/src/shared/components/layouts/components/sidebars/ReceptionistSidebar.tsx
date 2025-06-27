import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, UserPlus, Plus } from 'lucide-react';
import { cn } from '@/shared/utils';
import { NAVIGATION_ITEMS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';

const ReceptionistSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = NAVIGATION_ITEMS.RECEPTIONIST;

  const isActive = (path: string) => location.pathname === path;

  const getIcon = (iconName: string) => {
    const icons = { Home, Users, Calendar, UserPlus, Plus };
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Home className="h-5 w-5" />;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b">
        <h3 className="font-semibold text-[#B2C4B1]">Khu vực Lễ tân</h3>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            variant={isActive(item.path) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start",
              isActive(item.path) 
                ? "bg-[#B2C4B1] text-white" 
                : "text-gray-700 hover:bg-green-50"
            )}
            onClick={() => navigate(item.path)}
          >
            {getIcon(item.icon)}
            <span className="ml-3">{item.label}</span>
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default ReceptionistSidebar; 