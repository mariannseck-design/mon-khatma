import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Startup cache check — clear stale caches before render
(async () => {
  if ('caches' in window) {
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const { v } = await res.json();
        const stored = localStorage.getItem('app_version');
        if (stored && stored !== v) {
          localStorage.setItem('app_version', v);
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
          window.location.reload();
          return;
        }
        if (!stored) localStorage.setItem('app_version', v);
      }
    } catch {}
  }
})();

// Apply saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

// Apply saved Arabic text size
const savedArabicSize = localStorage.getItem('arabic-text-size');
if (savedArabicSize) {
  document.documentElement.style.setProperty('--arabic-font-size', `${savedArabicSize}%`);
}

createRoot(document.getElementById("root")!).render(<App />);
