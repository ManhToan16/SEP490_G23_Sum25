import React from 'react';
import BaseLayout from './BaseLayout';
import DoctorHeader from './components/headers/DoctorHeader';
import DoctorSidebar from './components/sidebars/DoctorSidebar';

interface DoctorLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DoctorLayout: React.FC<DoctorLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <BaseLayout
      role="doctor"
      className={className}
      header={<DoctorHeader />}
      sidebar={<DoctorSidebar />}
    >
      <div className="flex-1 p-6">
        {children}
      </div>
    </BaseLayout>
  );
};

export default DoctorLayout; 