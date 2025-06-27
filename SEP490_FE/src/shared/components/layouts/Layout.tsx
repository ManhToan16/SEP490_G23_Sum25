import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const noLayoutRoutes = ["/auth", "/home"];
  const isNoLayoutPage = noLayoutRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  if (isNoLayoutPage) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
        {children}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex w-full"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
