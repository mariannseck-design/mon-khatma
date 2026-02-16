import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
