import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../state/authStore";

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Redirect to home page if the user is already authenticated
    return <Navigate to="/" replace />;
  }

  // Render the children (Login, Register page) if not authenticated
  return children ? children : <Outlet />;
};

export default PublicRoute;
