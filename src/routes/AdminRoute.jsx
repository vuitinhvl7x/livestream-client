import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../state/authStore";

const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userInfo = useAuthStore((state) => state.userInfo);

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/account/login" replace />;
  }

  if (userInfo?.role !== "admin") {
    // If the user is logged in but not an admin, show a "forbidden" page
    // or redirect them to the home page.
    // For now, redirecting to home.
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
