import React from 'react';
import BaseLayout from './BaseLayout';
import AdminHeader from './components/headers/AdminHeader';
import AdminSidebar from './components/sidebars/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <BaseLayout
      role="admin"
      className={className}
      header={<AdminHeader />}
      sidebar={<AdminSidebar />}
    >
      <div className="flex-1 p-6">
        {children}
      </div>
    </BaseLayout>
  );
};

export default AdminLayout; 