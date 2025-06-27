import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate("/auth/login");
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F5F7FA" }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Đang chuyển hướng...</h1>
        <p className="text-xl text-muted-foreground">
          Vui lòng chờ trong giây lát
        </p>
      </div>
    </div>
  );
};

export default Index;
