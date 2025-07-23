import React from 'react';
import BaseLayout from './BaseLayout';
import ReceptionistHeader from './components/headers/ReceptionistHeader';
import ReceptionistSidebar from './components/sidebars/ReceptionistSidebar';

interface ReceptionistLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ReceptionistLayout: React.FC<ReceptionistLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <BaseLayout
      role="receptionist"
      className={className}
      header={<ReceptionistHeader />}
      sidebar={<ReceptionistSidebar />}
    >
      <div className="flex-1 p-6">
        {children}
      </div>
    </BaseLayout>
  );
};

export default ReceptionistLayout; 