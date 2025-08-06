import React from "react";
import { cn } from "@/shared/utils";

interface BaseLayoutProps {
  children: React.ReactNode;
<<<<<<< HEAD
  role?: "patient" | "doctor" | "receptionist" | "nurse" | "technician" | "admin";
=======
  role?: "patient" | "doctor" | "receptionist" | "admin" | "technician" | "nurse";
>>>>>>> 8bf3b0d71ba8a0f00c078455d7de6d8cbd1d09c7
  className?: string;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({
  children,
  role = "patient",
  className,
  header,
  sidebar,
  footer,
}) => {
  const themeClass = `${role}-theme`;

  return (
    <div
      className={cn("min-h-screen", themeClass, className)}
      style={{ backgroundColor: "var(--theme-background, #F5F7FA)" }}
    >
      <div className="flex h-screen">
        {/* Sidebar */}
        {sidebar && (
          <aside className="w-64 border-r bg-card shadow-sm">{sidebar}</aside>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          {header && (
            <header className="border-b bg-card shadow-sm">{header}</header>
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>

          {/* Footer */}
          {footer && <footer className="border-t bg-card">{footer}</footer>}
        </div>
      </div>
    </div>
  );
};

export default BaseLayout;
