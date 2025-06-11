import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../api";
import useAuthStore from "../state/authStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { connectSocket } from "../lib/socket";

export const loginSchema = z.object({
  username: z.string().min(1, "Username không được để trống"),
  password: z.string().min(1, "Password không được để trống"),
});

const Login = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await api.post("/users/login", data);
      if (response.status === 200) {
        const { token, user } = response.data;
        setAuth(token, user);
        connectSocket();
        toast.success("Đăng nhập thành công!");
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
            toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
          }
        } else if (error.response.status === 401) {
          toast.error(
            error.response.data.error || "Sai username hoặc password"
          );
        } else if (error.response.status === 500) {
          toast.error("Lỗi hệ thống, vui lòng thử lại sau.");
        } else {
          toast.error(
            error.response.data.message || "Có lỗi xảy ra, vui lòng thử lại."
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
        <h2 className="text-center text-2xl font-bold text-white">Đăng Nhập</h2>
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
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-sky-500"
            />
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
            Đăng Nhập
          </button>
        </form>
        <p className="text-center text-sm text-gray-300">
          Chưa có tài khoản?{" "}
          <Link
            to="/account/register"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
