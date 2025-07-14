import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "403 Error: User attempted to access unauthorized route:",
      location.pathname
    );
  }, [location.pathname]);

  const goBack = () => {
    navigate(-1); // Quay về trang trước đó
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex justify-center mb-4 text-red-500">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Bạn không có quyền truy cập
        </h1>
        <p className="text-gray-600 mb-6">
          Vui lòng quay lại trang trước hoặc liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.
        </p>
        <Button onClick={goBack} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
          Quay lại
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;