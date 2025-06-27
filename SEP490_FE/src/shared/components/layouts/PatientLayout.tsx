import React from "react";
import PatientHeader from "./components/headers/PatientHeader";
import PatientSidebar from "./components/sidebars/PatientSidebar";

interface PatientLayoutProps {
  children: React.ReactNode;
}

const PatientLayout: React.FC<PatientLayoutProps> = ({ children }) => {
  return (
    <div
      className="patient-theme"
      style={{ backgroundColor: "var(--theme-background, #F8FAFC)" }}
    >
      <PatientHeader />
      <div className="flex h-[calc(100vh-64px)]">
        <PatientSidebar />
        <main
          className="flex-1 overflow-auto p-6"
          style={{ backgroundColor: "rgba(169, 198, 232, 0.1)" }}
        >
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
