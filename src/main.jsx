import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "sonner";
import "./index.css";
import Layout from "./components/Layout";
import useAuthStore from "./state/authStore";
import authApi, { injectNavigate } from "./api/authApi";

// We need a component inside the router to use the useNavigate hook
const AppContent = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const setUserInfo = useAuthStore((state) => state.setUserInfo);

  useEffect(() => {
    // Inject the navigate function into our api module
    injectNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    const verifyUserSession = async () => {
      // We only need to run this on initial load.
      // If a token exists, we'll verify it with the server.
      // Post-login, the user state is already set by the login component.
      if (useAuthStore.getState().token) {
        try {
          const response = await authApi.get("/users/me");
          setUserInfo(response.data.user);
        } catch (error) {
          if (error.response?.status !== 401) {
            console.error("Failed to verify user session on startup:", error);
          }
        }
      }
    };
    verifyUserSession();
    // This effect should only run once on component mount.
    // We remove 'token' from the dependency array to prevent re-running after login.
  }, [setUserInfo]);

  return (
    <Layout>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </Layout>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  </StrictMode>
);
