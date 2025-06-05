import React from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import useAuthStore from "../state/authStore";
import authApi from "../api/authApi";
import { toast } from "sonner";

const Home = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await authApi.post("/api/users/logout");
      toast.success(response.data.message || "Đăng xuất thành công!");
    } catch (error) {
      console.error("Logout failed:", error.response);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể đăng xuất. Token có thể đã hết hạn.";
      toast.error(errorMessage);
    } finally {
      // Always clear client-side auth state and redirect
      clearAuth();
      navigate("/account/login");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Chào mừng đến với ứng dụng Livestream</h1>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "10px",
          justifyContent: "center",
        }}
      >
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">
              <button>Đi đến Dashboard</button>
            </Link>
            <button onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <Link to="/account/login">
              <button>Đăng nhập</button>
            </Link>
            <Link to="/account/register">
              <button>Đăng ký</button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const userInfo = useAuthStore((state) => state.userInfo);
  const token = useAuthStore((state) => state.token);
  return (
    <div>
      <h2>Welcome to your Dashboard!</h2>
      {userInfo && <p>User: {JSON.stringify(userInfo)}</p>}
      {token && <p style={{ wordBreak: "break-all" }}>Token: {token}</p>}
    </div>
  );
};

// PrivateRoute component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/account/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/account/login" element={<Login />} />
      <Route path="/account/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      {/* Redirect to home for any other path or show a 404 component */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
