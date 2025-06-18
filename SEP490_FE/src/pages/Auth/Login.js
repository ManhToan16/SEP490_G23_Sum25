import React from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/receptionist");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Left Section */}
      <div className="flex-1 bg-gradient-to-br justify-center from-green-400 hidden items-center md:flex relative to-blue-500">
        <button
          type="button"
          className="flex bg-white p-2 rounded-full shadow-md absolute gap-2 hover:bg-gray-100 items-center left-4 top-4 transition"
        >
          ←
        </button>

        <img
          src="/login.png"
          alt="Login Illustration"
          className="rounded-lg shadow-lg w-2/3 max-w-md"
        />
      </div>

      {/* Right Section */}
      <div className="flex flex-1 justify-center p-6 items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl text-center text-gray-800 font-bold mb-6">
            Đăng nhập
          </h1>

          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="text-gray-600 block font-medium">
                Tài khoản
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email của bạn"
                className="border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-gray-600 text-sm block font-medium">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  className="border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2"
                />
                <button
                  type="button"
                  className="text-gray-500 -translate-y-1/2 absolute hover:text-gray-700 right-3 top-1/2 transform"
                >
                  👁
                </button>
              </div>
            </div>

            <div className="flex justify-between text-gray-600 text-sm items-center">
              <span></span>
              <a href="/forgot-password" className="text-blue-500 hover:underline">
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition"
              onClick={handleLogin}
            >
              Đăng nhập
            </button>

            <div className="mt-4 relative">
              <div className="flex justify-center items-center">
                <span className="bg-white text-gray-500 px-4">hoặc</span>
              </div>
            </div>
          </form>

          <div className="text-center text-gray-600 text-sm mt-6">
            Bạn chưa có tài khoản?{" "}
            <a href="/register" className="text-blue-500 hover:underline">
              Đăng ký ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;