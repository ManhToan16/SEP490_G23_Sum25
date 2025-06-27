import React from 'react';
import { useLocation } from 'react-router-dom';
import PatientLayout from './PatientLayout';
import DoctorLayout from './DoctorLayout';
import ReceptionistLayout from './ReceptionistLayout';
import AdminLayout from './AdminLayout';
// import PublicLayout from './PublicLayout';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const location = useLocation();
  
  // Determine layout based on current route
  const getLayout = () => {
    const path = location.pathname;
    
    if (path.startsWith('/patient')) {
      return <PatientLayout>{children}</PatientLayout>;
    }
    
    if (path.startsWith('/doctor')) {
      return <DoctorLayout>{children}</DoctorLayout>;
    }
    
    if (path.startsWith('/receptionist')) {
      return <ReceptionistLayout>{children}</ReceptionistLayout>;
    }
    
    if (path.startsWith('/admin')) {
      return <AdminLayout>{children}</AdminLayout>;
    }
    
    // For auth pages and public pages, no layout wrapper
    if (path.startsWith('/auth') || path === '/' || path === '/home') {
      return <>{children}</>;
    }
    
    // Default: no layout for unknown routes
    return <>{children}</>;
  };
  
  return getLayout();
};

export default LayoutWrapper; 