import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Vite production hardening:
// If a user has a stale cached index.html after a publish, dynamic import preloads
// can fail ("Failed to fetch dynamically imported module").
// This event is emitted by Vite to allow auto-recovery.
window.addEventListener("vite:preloadError", () => {
  const key = "__vite_preload_error_reloaded__";
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
