import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import useAuthStore from "../state/authStore";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const setToken = useAuthStore((state) => state.setToken);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/api/users/login", data);
      if (response.status === 200) {
        setToken(response.data.token);
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
    <div>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" type="text" {...register("username")} />
          {errors.username && (
            <p style={{ color: "red" }}>{errors.username.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>
        <button type="submit">Đăng Nhập</button>
      </form>
      <p>
        Chưa có tài khoản? <Link to="/account/register">Đăng ký</Link>
      </p>
    </div>
  );
};

export default Login;
