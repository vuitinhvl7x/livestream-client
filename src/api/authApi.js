import axios from "axios";
import useAuthStore from "../state/authStore";

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

export default authApi;
