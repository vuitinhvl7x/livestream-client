import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "../state/authStore";

// Import all page components
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import Streams from "../pages/Streams";
import StreamDetail from "../pages/StreamDetail";
import Categories from "../pages/Categories";
import CategoryDetail from "../pages/CategoryDetail";
import Channel from "../pages/Channel";
import Vods from "../pages/Vods";
import VodDetail from "../pages/VodDetail";

const Dashboard = () => {
  const userInfo = useAuthStore((state) => state.userInfo);
  const token = useAuthStore((state) => state.token);
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">Welcome to your Dashboard!</h2>
      {userInfo && (
        <p className="mt-4">User Info: {JSON.stringify(userInfo)}</p>
      )}
      {token && (
        <p className="mt-4" style={{ wordBreak: "break-all" }}>
          Token: {token}
        </p>
      )}
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
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/streams" element={<Streams />} />
      <Route path="/streams/:streamId" element={<StreamDetail />} />
      <Route path="/vods" element={<Vods />} />
      <Route path="/vods/:vodId" element={<VodDetail />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/categories/:slug" element={<CategoryDetail />} />
      <Route path="/channel/:username" element={<Channel />} />

      {/* Auth Routes */}
      <Route path="/account/login" element={<Login />} />
      <Route path="/account/register" element={<Register />} />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
