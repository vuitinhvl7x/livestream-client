import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import useAuthStore from "../state/authStore";

// Placeholder for a potential Dashboard or Home component
const Home = () => (
  <div>
    Welcome to the Home Page! You can try navigating to /dashboard. If not
    logged in, you should be redirected to login.
  </div>
);
const Dashboard = () => {
  const userInfo = useAuthStore((state) => state.userInfo);
  const token = useAuthStore((state) => state.token);
  return (
    <div>
      <h2>Welcome to your Dashboard!</h2>
      {userInfo && <p>User: {JSON.stringify(userInfo)}</p>}
      {token && <p>Token: {token}</p>}
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
