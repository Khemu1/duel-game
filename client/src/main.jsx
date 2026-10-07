import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { DuelProvider } from "./components/Provider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DuelProvider>
      <App />
    </DuelProvider>
  </StrictMode>,
);
