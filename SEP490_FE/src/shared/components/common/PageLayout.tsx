import React from 'react';
import { cn } from '@/shared/utils';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  showRefreshButton?: boolean;
  backPath?: string;
  headerActions?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  showRefreshButton = false,
  backPath,
  headerActions,
  className,
  containerClassName,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <div className={cn('clinic-container', containerClassName)}>
        {/* Page Header */}
        {(title || showBackButton || showRefreshButton || headerActions) && (
          <div className="clinic-header">
            <div className="clinic-flex-between">
              <div className="flex items-center space-x-4">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Quay lại</span>
                  </Button>
                )}
                
                <div>
                  {title && (
                    <h1 className="text-3xl font-bold text-gray-900">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-gray-600 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {showRefreshButton && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Làm mới</span>
                  </Button>
                )}
                {headerActions}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="clinic-section">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageLayout; 