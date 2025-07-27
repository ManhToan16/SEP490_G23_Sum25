import React from 'react';
import BaseLayout from './BaseLayout';
import NurseHeader from './components/headers/NurseHeader';
import NurseSidebar from './components/sidebars/NurseSidebar';

interface TechnicianLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const NurseLayout: React.FC<TechnicianLayoutProps> = ({ 
  children, 
  className 
}) => {
  return (
    <BaseLayout
      role="nurse"
      className={className}
      header={<NurseHeader />}
      sidebar={<NurseSidebar />}
    >
      {children}
    </BaseLayout>
  );
};

export default NurseLayout; 