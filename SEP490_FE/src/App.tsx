import React, { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ErrorBoundary } from "@/shared/components/common/ErrorBoundary";
import { LayoutWrapper } from "@/shared/components/layouts";
import AppRouter from "@/router";

const App: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Quick app initialization without loading screen
        console.log("🚀 Khởi tạo ứng dụng...");

        // Check localStorage
        const token = localStorage.getItem("clinic_auth_token");
        console.log("🔑 Token:", token ? "Có" : "Không có");

        console.log("✅ Khởi tạo thành công!");
      } catch (err: any) {
        console.error("❌ Lỗi khởi tạo:", err);
        setError(err.message);
      }
    };

    initializeApp();
  }, []);

  // Debug error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            ❌ Lỗi khởi tạo ứng dụng
          </h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔄 Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  // Removed loading state - using initial loading from index.html instead

  // Main app
  return (
    <div className="min-h-screen">
      <ErrorBoundary>
        <ReduxProvider>
          <TooltipProvider>
            <BrowserRouter>
              <LayoutWrapper>
                <AppRouter />
              </LayoutWrapper>

              {/* Global UI Components */}
              <Toaster />
              <Sonner />
            </BrowserRouter>
          </TooltipProvider>
        </ReduxProvider>
      </ErrorBoundary>
    </div>
  );
};

export default App;
