<<<<<<< HEAD
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/shared/utils';
import { NAVIGATION_ITEMS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';

function isMenuGroup(item: any): item is { label: string; icon: string; children: any[] } {
  return Array.isArray(item.children);
}

const TechnicianSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const menuItems = NAVIGATION_ITEMS.TECHNICIAN;

  const isActive = (path: string) => location.pathname === path;
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };
  const handleToggle = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
=======
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
import { cn } from '@/shared/utils';
import { ROUTES, NAVIGATION_ITEMS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

const TechnicianSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const menuItems = NAVIGATION_ITEMS.TECHNICIAN;

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
>>>>>>> 8bf3b0d71ba8a0f00c078455d7de6d8cbd1d09c7
  };

  return (
    <div className="flex flex-col h-full bg-white">
<<<<<<< HEAD
      <div className="p-6 border-b">
        <h3 className="font-semibold text-[#B2C4B1]">Khu vực Kỹ thuật viên</h3>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item: any, index: number) => {
          if (isMenuGroup(item)) {
            const isOpen = openMenus.includes(item.label);
            return (
              <div key={item.label}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg text-left',
                    isOpen ? 'bg-[#B2C4B1] text-white' : 'text-gray-700 hover:bg-green-50'
                  )}
                  onClick={() => handleToggle(item.label)}
                >
                  <span className="flex items-center">
                    {getIcon(item.icon)}
                    <span className="ml-3 font-medium">{item.label}</span>
                  </span>
                  <LucideIcons.ChevronDown className={cn('ml-2 transition-transform', isOpen ? 'rotate-180' : '')} />
                </Button>
                {isOpen && (
                  <div className="pl-8 space-y-1 mt-1">
                    {item.children.map((child: any) => (
                      <Button
                        key={child.path}
                        variant={isActive(child.path) ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start text-sm',
                          isActive(child.path)
                            ? 'bg-[#B2C4B1] text-white'
                            : 'text-gray-700 hover:bg-green-50'
                        )}
                        onClick={() => navigate(child.path)}
                      >
                        {getIcon(child.icon)}
                        <span className="ml-2">{child.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          if (item.path) {
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive(item.path)
                    ? 'bg-[#B2C4B1] text-white'
                    : 'text-gray-700 hover:bg-green-50'
                )}
                onClick={() => navigate(item.path)}
              >
                {getIcon(item.icon)}
                <span className="ml-3">{item.label}</span>
              </Button>
            );
          }
          return null;
        })}
      </nav>
=======
      {/* User Profile Section */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#2C3E50] rounded-lg flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Khu vực Kỹ Thuật Viên</h3>
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

>>>>>>> 8bf3b0d71ba8a0f00c078455d7de6d8cbd1d09c7
    </div>
  );
};

export default TechnicianSidebar; 