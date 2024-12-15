import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <>
      <head>
        <title>gage trade</title>
      </head>
      <App />
    </>
  </StrictMode>
);
