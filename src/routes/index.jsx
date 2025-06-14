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
import DashboardLayout from "../pages/dashboard/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import ProfileSettings from "../pages/dashboard/ProfileSettings";
import EditStreamInfo from "../pages/dashboard/EditStreamInfo";
import MyFollowersList from "../pages/dashboard/MyFollowersList";
import MyFollowingList from "../pages/dashboard/MyFollowingList";
import UserNotificationsCenter from "../pages/dashboard/UserNotificationsCenter";
import CreateStream from "../pages/dashboard/CreateStream";

// Import Admin components
import AdminRoute from "./AdminRoute";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import CategoryManagement from "../pages/admin/CategoryManagement";
import VodManagement from "../pages/admin/VodManagement";
import PublicRoute from "./PublicRoute";

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
      <Route
        path="/account/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/account/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="settings/profile" element={<ProfileSettings />} />
        <Route path="creator/stream-info/:id" element={<EditStreamInfo />} />
        <Route path="creator/create-stream" element={<CreateStream />} />
        <Route path="followers" element={<MyFollowersList />} />
        <Route path="following" element={<MyFollowingList />} />
        <Route path="notifications" element={<UserNotificationsCenter />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="vods" element={<VodManagement />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
