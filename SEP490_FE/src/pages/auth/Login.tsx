import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import Loading from "@/shared/components/common/LoadingSpinner";
import { useAuth } from "@/shared/hooks/business/useAuth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    isAuthenticated,
    loading,
    error,
    login,
    clearError,
    checkAuthentication,
  } = useAuth();

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/patient/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      // Redux will handle redirect through auth state
      console.log("Login successful!");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <Card
        className="w-full max-w-md shadow-xl"
        style={{ backgroundColor: "#ffffff" }}
      >
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-slate-800">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-center text-slate-600">
            Nhập thông tin để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4" />
                  <span className="ml-2">Đang đăng nhập...</span>
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-slate-600">Chưa có tài khoản? </span>
              <Link
                to="/auth/register"
                className="text-slate-800 hover:text-slate-700 font-medium underline"
              >
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
