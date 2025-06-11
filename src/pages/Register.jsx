import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api";
import useAuthStore from "../state/authStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const registerSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  displayName: z.string().min(3, "Tên hiển thị phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Password phải có ít nhất 6 ký tự"),
});

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/users/register", data);
      if (response.status === 201) {
        const { token, user } = response.data;
        setAuth(token, user);
        toast.success("Đăng ký thành công!");
        navigate("/");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          const apiErrors = error.response.data.errors;
          let hasSetFieldErrors = false;
          if (Array.isArray(apiErrors)) {
            apiErrors.forEach((err) => {
              if (err.path && err.msg) {
                setError(err.path, { type: "server", message: err.msg });
                hasSetFieldErrors = true;
              }
            });
          }
          if (!hasSetFieldErrors && error.response.data.message) {
            toast.error(error.response.data.message);
          } else if (!hasSetFieldErrors) {
            toast.error("Dữ liệu đăng ký không hợp lệ. Vui lòng kiểm tra lại.");
          }
        } else if (error.response.status === 500) {
          toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
        } else {
          toast.error(
            error.response.data.message ||
              "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại."
          );
        }
      } else if (error.request) {
        toast.error(
          "Không thể kết nối đến server. Vui lòng kiểm tra lại đường truyền."
        );
      } else {
        toast.error("Lỗi khi gửi yêu cầu. Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-gray-800 p-8 shadow-md">
        <h2 className="text-center text-2xl font-bold text-white">Register</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-sky-500"
            />
            {errors.username && (
              <p className="mt-2 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              {...register("displayName")}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-sky-500"
            />
            {errors.displayName && (
              <p className="mt-2 text-sm text-red-500">
                {errors.displayName.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-gray-200"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243l-4.243-4.243"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639l4.418-4.418a1.012 1.012 0 011.414 0l4.418 4.418a1.012 1.012 0 010 1.414l-4.418 4.418a1.012 1.012 0 01-1.414 0l-4.418-4.418z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 focus:outline-none focus:ring-4 focus:ring-sky-800"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link
            to="/account/login"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
