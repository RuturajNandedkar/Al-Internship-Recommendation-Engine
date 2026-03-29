import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const pingBackend = () => {
  fetch(`${BACKEND_URL}/api/health`, { method: "GET" })
    .catch(() => {});
};

// Ping immediately on page load
pingBackend();

// Ping every 10 minutes to keep alive
setInterval(pingBackend, 10 * 60 * 1000);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
