import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#09090b",
            color: "#fff",
            marginBottom: "60px",
            border: "1px solid #27272a",
          },
          success: {
            iconTheme: {
              primary: "#00FF87",
              secondary: "#000",
            },
          },
        }}
      />
    </AuthProvider>
  </StrictMode>
);