import axios from "axios";

// Vite's proxy will handle the redirection to the backend server.
// See vite.config.js for proxy configuration.
const api = axios.create({
  baseURL: "/api", // This should match the proxy path
});

export default api;
