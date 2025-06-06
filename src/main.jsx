import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import { Toaster } from "sonner";
import "./index.css";
import Layout from "./components/Layout";

// Main App component now renders Layout, routes and Toaster
function App() {
  return (
    <Layout>
      <AppRoutes />
      <Toaster richColors position="top-right" />
    </Layout>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
