import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";
import "./styles.css";

// Clean up old secure-ls encrypted keys from localStorage
const staleKeys = Object.keys(localStorage).filter(
  (k) =>
    k.startsWith("_secure__ls__") ||
    (k !== "accessToken" && k !== "authUser" && localStorage.getItem(k)?.startsWith("U2FsdGVkX1")),
);
staleKeys.forEach((k) => localStorage.removeItem(k));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
