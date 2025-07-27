import React from 'react';
import { useLocation } from 'react-router-dom';
import PatientLayout from './PatientLayout';
import DoctorLayout from './DoctorLayout';
import ReceptionistLayout from './ReceptionistLayout';
import AdminLayout from './AdminLayout';
import NurseLayout from './NurseLayout';
import TechnicianLayout from './TechnicianLayout';
import { useAuth } from '@/shared/hooks/business/useAuth';
// import PublicLayout from './PublicLayout';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { user } = useAuth();

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

    if (path.startsWith('/nurse')) {
      return <NurseLayout>{children}</NurseLayout>;
    }

    if (path.startsWith('/technician')) {
      return <TechnicianLayout>{children}</TechnicianLayout>;
    }

    if (path.startsWith('/receptionist')) {
      return <ReceptionistLayout>{children}</ReceptionistLayout>;
    }

    if (path.startsWith('/admin')) {
      return <AdminLayout>{children}</AdminLayout>;
    }

    if (path.startsWith('/staff')) {
      switch (user?.role) {
        case 'DOCTOR':
          return <DoctorLayout>{children}</DoctorLayout>;
        case 'NURSE':
          return <NurseLayout>{children}</NurseLayout>;
        case 'TECHNICIAN':
          return <TechnicianLayout>{children}</TechnicianLayout>;
        default:
          return <>{children}</>;
      }
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