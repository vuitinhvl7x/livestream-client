import axios from "axios";
import useAuthStore from "../state/authStore";
import { toast } from "sonner";

// This will be populated by a React component
let navigate;

export const injectNavigate = (nav) => {
  navigate = nav;
};

const authApi = axios.create({
  // The base URL will be proxied by Vite, so we only need the base path if any.
  // In our case, the proxy handles '/api', so we can even leave this empty
  // and call authApi.post('/users/logout')
  baseURL: "/api",
});

// Request interceptor to add the auth token to every request
authApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
authApi.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    // Check if the error is due to an expired or invalid token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      const { clearAuth, token } = useAuthStore.getState();

      // Only clear auth and redirect if a token was present
      if (token) {
        clearAuth();
        toast.error("Your session has expired. Please log in again.");

        if (navigate) {
          navigate("/account/login"); // Use React Router's navigation
        } else {
          // Fallback if navigate is not available for some reason
          console.error(
            "Navigate function not available. Falling back to full reload."
          );
          window.location.href = "/account/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default authApi;
