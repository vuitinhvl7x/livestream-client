import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Placeholder App component
function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Hello, Vite + React + Tailwind!</h1>
      <p>Project setup is in progress.</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
