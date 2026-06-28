"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "moon" | "sun";

const storageKey = "devroulotte_theme";

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "moon";
  }

  try {
    return window.localStorage.getItem(storageKey) === "sun" ? "sun" : "moon";
  } catch {
    return "moon";
  }
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode === "sun" ? "light" : "dark";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(mode);
    try {
      window.localStorage.setItem(storageKey, mode);
    } catch {
      // Ignore storage failures: the visual theme still applies for this page view.
    }
  }, [mode]);

  function toggleTheme() {
    setMode((currentMode) => (currentMode === "moon" ? "sun" : "moon"));
  }

  const isSun = mode === "sun";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-current transition"
      aria-label={isSun ? "Passa alla modalità luna" : "Passa alla modalità sole"}
      title={isSun ? "Modalità luna" : "Modalità sole"}
    >
      {isSun ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
