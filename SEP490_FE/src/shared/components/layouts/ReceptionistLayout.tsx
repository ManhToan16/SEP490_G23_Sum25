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
      {children}
    </BaseLayout>
  );
};

export default ReceptionistLayout; 