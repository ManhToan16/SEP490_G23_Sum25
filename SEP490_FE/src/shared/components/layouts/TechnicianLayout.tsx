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
<<<<<<< HEAD
      <div className="flex-1 p-6">
        {children}
      </div>
=======
      {children}
>>>>>>> 8bf3b0d71ba8a0f00c078455d7de6d8cbd1d09c7
    </BaseLayout>
  );
};

export default TechnicianLayout; 