import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/shared/utils';
import { NAVIGATION_ITEMS } from '@/shared/constants/routes';
import { Button } from '@/shared/components/ui/button';

function isMenuGroup(item: any): item is { label: string; icon: string; children: any[] } {
  return Array.isArray(item.children);
}

const NurseSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const menuItems = NAVIGATION_ITEMS.NURSE;

  const isActive = (path: string) => location.pathname === path;
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };
  const handleToggle = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 border-b">
        <h3 className="font-semibold text-[#B2C4B1]">Khu vực Y tá</h3>
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
    </div>
  );
};

export default NurseSidebar; 