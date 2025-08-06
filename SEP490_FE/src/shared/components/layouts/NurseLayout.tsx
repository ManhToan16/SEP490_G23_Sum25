import React from 'react';
import BaseLayout from './BaseLayout';
import NurseHeader from './components/headers/NurseHeader';
import NurseSidebar from './components/sidebars/NurseSidebar';

interface NurseLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const NurseLayout: React.FC<NurseLayoutProps> = ({ 
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
      <div className="flex-1 p-6">
        {children}
      </div>
    </BaseLayout>
  );
};

export default NurseLayout; 