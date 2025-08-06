import React from 'react';
import BaseLayout from './BaseLayout';
import NurseHeader from './components/headers/NurseHeader';
import NurseSidebar from './components/sidebars/NurseSidebar';

<<<<<<< HEAD
interface NurseLayoutProps {
=======
interface TechnicianLayoutProps {
>>>>>>> 8bf3b0d71ba8a0f00c078455d7de6d8cbd1d09c7
  children: React.ReactNode;
  className?: string;
}

<<<<<<< HEAD
const NurseLayout: React.FC<NurseLayoutProps> = ({ 
=======
const NurseLayout: React.FC<TechnicianLayoutProps> = ({ 
>>>>>>> 8bf3b0d71ba8a0f00c078455d7de6d8cbd1d09c7
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

export default NurseLayout; 