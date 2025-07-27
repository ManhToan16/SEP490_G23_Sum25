import React from 'react';
import BaseLayout from './BaseLayout';
import TechnicianHeader from './components/headers/TechnicianHeader';
import TechnicianSidebar from './components/sidebars/TechnicianSidebar';

interface TechnicianLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const TechnicianLayout: React.FC<TechnicianLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <BaseLayout
      role="technician"
      className={className}
      header={<TechnicianHeader />}
      sidebar={<TechnicianSidebar />}
    >
      {children}
    </BaseLayout>
  );
};

export default TechnicianLayout; 