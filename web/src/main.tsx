import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { Toaster } from "sonner";
import ErrorPage from "./ErrorPage.tsx";
import Search from "./Search.tsx";
import Settings from "./Settings.tsx";
import { ThemeProvider } from "./components/ui/theme-provider.tsx";

const router = createHashRouter([
  {
    path: "/",
    element: <Search />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/settings",
    element: <Settings />,
    errorElement: <ErrorPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster position="top-center" duration={1500} theme="dark" />
    </ThemeProvider>
  </StrictMode>,
);
